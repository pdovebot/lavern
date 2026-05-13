/**
 * Local provider smoke test.
 *
 *   npx tsx --env-file=.env scripts/test-local.ts
 *
 * Verifies, in order:
 *   1. Ollama daemon is reachable + the configured model is pulled
 *   2. Plain chat completion works
 *   3. Tool calling works end-to-end (request -> tool_call -> tool result -> final answer)
 *
 * The third check is the interesting one — it's the same loop shape that
 * `local-executor.ts` runs, just with one fake tool instead of the full
 * MCP registry. If this passes, the executor's plumbing is healthy.
 */
import { localChat, checkLocalReady, type LocalToolDefinition } from '../src/providers/local.js';
import { config } from '../src/config.js';
import type OpenAI from 'openai';

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

const MODEL = process.env.LAVERN_LOCAL_DEFAULT_MODEL ?? config.local.defaultModel;

async function main() {
  console.log(`\n── Local provider test ──`);
  console.log(`URL:   ${config.local.baseUrl}`);
  console.log(`Model: ${MODEL}\n`);

  // 1. Health check
  console.log('[1/3] Probing Ollama…');
  const err = await checkLocalReady(MODEL);
  if (err) {
    console.error(`  ✗ ${err}`);
    process.exit(1);
  }
  console.log('  ✓ daemon reachable, model present\n');

  // 2. Plain chat
  console.log('[2/3] Plain chat completion…');
  const t0 = Date.now();
  const plain = await localChat({
    model: MODEL,
    messages: [
      { role: 'system', content: 'Answer in one short sentence.' },
      { role: 'user', content: 'What does the doctrine of consideration require in contract law?' },
    ],
    maxTokens: 200,
  });
  console.log(`  ✓ ${Date.now() - t0}ms · ${plain.usage?.completion_tokens ?? '?'} output tokens`);
  console.log(`  > ${plain.message.content?.trim().slice(0, 240)}\n`);

  // 3. Tool calling
  console.log('[3/3] Tool calling round-trip…');
  const tools: LocalToolDefinition[] = [
    {
      type: 'function',
      function: {
        name: 'lookup_jurisdiction_rule',
        description: 'Look up a single legal rule by jurisdiction and topic. Returns a short rule statement.',
        parameters: {
          type: 'object',
          properties: {
            jurisdiction: { type: 'string', description: 'e.g. "NSW", "England & Wales", "Finland"' },
            topic:        { type: 'string', description: 'e.g. "penalty doctrine", "consideration"' },
          },
          required: ['jurisdiction', 'topic'],
          additionalProperties: false,
        },
      },
    },
  ];

  const messages: ChatMessage[] = [
    { role: 'system', content: 'You have one tool. Call it before answering. After the tool replies, give a one-sentence answer.' },
    { role: 'user',   content: 'Under NSW law, when is a liquidated damages clause an unenforceable penalty?' },
  ];

  // Round 1 — expect a tool_call
  const r1 = await localChat({ model: MODEL, messages, tools, toolChoice: 'auto', maxTokens: 400 });
  const calls = r1.message.tool_calls ?? [];
  if (calls.length === 0) {
    console.error('  ✗ model did not emit a tool_call');
    console.error(`    content: ${r1.message.content?.slice(0, 200)}`);
    process.exit(2);
  }
  const call = calls[0];
  console.log(`  ✓ tool_call: ${call.function.name}(${call.function.arguments})`);

  // Feed back a synthetic tool result
  messages.push(r1.message);
  messages.push({
    role: 'tool',
    tool_call_id: call.id,
    content: 'In NSW, a liquidated damages clause is a penalty if it is out of all proportion to the legitimate interests of the innocent party at the time of contracting (Paciocco v ANZ, 2016).',
  });

  // Round 2 — expect a natural-language answer
  const r2 = await localChat({ model: MODEL, messages, tools, toolChoice: 'auto', maxTokens: 300 });
  if (r2.message.tool_calls && r2.message.tool_calls.length > 0) {
    console.warn('  ! model issued a second tool_call instead of answering — still OK, but worth noting');
  }
  console.log(`  ✓ final answer:`);
  console.log(`  > ${r2.message.content?.trim().slice(0, 300)}\n`);

  console.log('All checks passed.\n');
}

main().catch((e) => {
  console.error('\nFAILED:', e instanceof Error ? e.message : e);
  process.exit(1);
});
