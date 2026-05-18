/**
 * Briefing Analyzer — LLM call for intelligent intake analysis.
 *
 * Routes through crossProviderChat so it honors LAVERN_PROVIDER (anthropic /
 * mistral / local / managed). The structured-output path that the Claude Agent
 * SDK previously provided is replaced with a prompted-JSON contract: we append
 * a strict-JSON instruction to the system prompt, parse defensively (strip
 * markdown fences, slice to outer braces), and retry once with a stricter
 * instruction if the first response fails Zod validation.
 */

import { briefingAnalyzerPrompt } from './briefing-prompt.js';
import {
  BriefingAnalyzeResponseSchema,
  type BriefingAnalyzeRequest,
  type BriefingAnalyzeResponse,
} from './briefing-schema.js';
import { crossProviderChat } from '../../providers/cross-provider-chat.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('BRIEFING');

const MAX_CONTENT_PER_DOC = 12_000;

/** Legal section headings to prioritize in truncation. */
const PRIORITY_SECTIONS = [
  'definition', 'obligation', 'liability', 'indemnif', 'terminat',
  'confidential', 'governing', 'warranty', 'limitation', 'intellectual',
  'payment', 'represent', 'covenant', 'default', 'force majeure',
];

/**
 * Intelligently truncate document content, prioritizing key legal sections.
 * If the document has structural data (sections), uses that for smarter selection.
 */
function smartTruncate(content: string, sections?: Array<{ heading: string; content: string }>, maxChars = MAX_CONTENT_PER_DOC): string {
  if (content.length <= maxChars) return content;

  // If we have structural sections, prioritize key legal sections
  if (sections && sections.length > 0) {
    const parts: string[] = [];
    let remaining = maxChars;

    // First pass: priority sections
    for (const section of sections) {
      const headingLower = section.heading.toLowerCase();
      if (PRIORITY_SECTIONS.some(p => headingLower.includes(p))) {
        const block = `### ${section.heading}\n${section.content}\n`;
        if (block.length <= remaining) {
          parts.push(block);
          remaining -= block.length;
        } else if (remaining > 200) {
          parts.push(`### ${section.heading}\n${section.content.slice(0, remaining - 100)}\n[...truncated]\n`);
          remaining = 0;
        }
      }
    }

    // Second pass: fill remaining space with other sections
    if (remaining > 500) {
      for (const section of sections) {
        const headingLower = section.heading.toLowerCase();
        if (!PRIORITY_SECTIONS.some(p => headingLower.includes(p))) {
          const block = `### ${section.heading}\n${section.content}\n`;
          if (block.length <= remaining) {
            parts.push(block);
            remaining -= block.length;
          }
        }
      }
    }

    if (parts.length > 0) {
      return parts.join('\n') + `\n[${sections.length} total sections — key sections prioritized]`;
    }
  }

  // Fallback: simple truncation
  return content.slice(0, maxChars) + '\n[...truncated]';
}

/**
 * Build the user prompt from the request data.
 */
function buildUserPrompt(req: BriefingAnalyzeRequest): string {
  const parts: string[] = [];

  parts.push(`## Engagement Type: ${req.workflowId}`);
  parts.push('');

  // Documents — use smart truncation with structure when available
  if (req.documents.length > 0) {
    parts.push('## Uploaded Documents');
    for (const doc of req.documents) {
      // Check if this document has structural sections (from parsed data)
      const docWithSections = doc as { content: string; name: string; sections?: Array<{ heading: string; content: string }> };
      const truncated = smartTruncate(doc.content, docWithSections.sections);
      parts.push(`### ${doc.name}`);
      parts.push(truncated);
      parts.push('');
    }
  } else {
    parts.push('## Documents: None provided');
    parts.push('');
  }

  // Static Q&A
  if (Object.keys(req.answers).length > 0) {
    parts.push('## Client Answers (Initial Intake)');
    for (const [qId, answer] of Object.entries(req.answers)) {
      if (answer.trim()) {
        parts.push(`**${qId}:** ${answer}`);
      }
    }
    parts.push('');
  }

  // Follow-up Q&A (from previous round)
  if (req.followUpAnswers && Object.keys(req.followUpAnswers).length > 0) {
    parts.push('## Client Answers (Follow-Up Round)');
    for (const [qId, answer] of Object.entries(req.followUpAnswers)) {
      if (answer.trim()) {
        parts.push(`**${qId}:** ${answer}`);
      }
    }
    parts.push('');
  }

  // Final instructions
  if (req.finalInstructions?.trim()) {
    parts.push('## Final Client Instructions');
    parts.push(req.finalInstructions.trim());
    parts.push('');
  }

  parts.push('---');
  parts.push('Analyze the above and produce the sufficiency assessment, follow-up questions (if needed), and engagement brief.');

  return parts.join('\n');
}

/**
 * Strict-JSON instruction appended to the system prompt. Describes the exact
 * response shape so providers without native structured-output (local/mistral)
 * can still produce valid output that survives Zod validation.
 */
const JSON_INSTRUCTION = `
Respond with ONLY a single JSON object matching this exact shape:

{
  "sufficiency": {
    "score": <number 0-100>,
    "verdict": "insufficient" | "adequate" | "strong",
    "gaps": [<strings>],
    "ambiguities": [<strings>]
  },
  "followUpQuestions": [
    {
      "id": <string>,
      "text": <string>,
      "hint": <string>,
      "category": "context" | "scope" | "constraints" | "objectives",
      "required": <boolean>
    }
  ],
  "engagementBrief": {
    "summary": <string>,
    "objective": <string>,
    "documentAnalysis": <string or null>,
    "scopeAndConstraints": <string>,
    "riskFactors": [<strings>],
    "successCriteria": [<strings>],
    "specialInstructions": <string>
  }
}

Do not wrap in markdown fences. Do not include any text before or after the JSON. The JSON must parse on the first attempt.
`.trim();

/**
 * Parse a raw LLM response into a validated BriefingAnalyzeResponse.
 * Returns null on parse or schema-validation failure so the caller can retry.
 */
function parseAnalysis(text: string): BriefingAnalyzeResponse | null {
  let jsonText = text.trim();

  // Strip markdown fencing if the model emitted any.
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  // If the model added preamble or trailing commentary, slice to the outer braces.
  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');
  if (firstBrace > 0 && lastBrace > firstBrace) {
    jsonText = jsonText.slice(firstBrace, lastBrace + 1);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    return null;
  }

  const validated = BriefingAnalyzeResponseSchema.safeParse(raw);
  return validated.success ? validated.data : null;
}

/**
 * Call the LLM to analyze the briefing and return structured output.
 * Honors the active LLM provider via crossProviderChat.
 */
export async function analyzeBriefing(
  req: BriefingAnalyzeRequest,
): Promise<BriefingAnalyzeResponse> {
  const userPrompt = buildUserPrompt(req);
  const systemPrompt = `${briefingAnalyzerPrompt}\n\n${JSON_INSTRUCTION}`;

  // First attempt — standard prompted-JSON call.
  const first = await crossProviderChat({
    system: systemPrompt,
    user: userPrompt,
    tier: 'sonnet',
    maxTokens: 4096,
  });

  let result = parseAnalysis(first.text);

  // Retry once with a stricter instruction if the first attempt failed Zod
  // validation. Local models in particular sometimes wrap responses in prose
  // or emit slightly malformed JSON on the first try.
  if (!result) {
    logger.warn('Briefing analyzer: first attempt invalid, retrying with stricter prompt', {
      provider: first.provider,
      model: first.model,
      preview: first.text.slice(0, 200),
    });

    const retry = await crossProviderChat({
      system: systemPrompt,
      user:
        userPrompt +
        '\n\n---\nIMPORTANT: Your previous response did not contain valid JSON matching the schema. ' +
        'Reply with ONLY the JSON object — no markdown fencing, no commentary, no preamble. ' +
        'Start the response with `{` and end with `}`.',
      tier: 'sonnet',
      maxTokens: 4096,
    });

    result = parseAnalysis(retry.text);
  }

  if (!result) {
    throw new Error(
      'Briefing analyzer did not return a valid response after retry — model output did not match the briefing schema',
    );
  }

  return result;
}
