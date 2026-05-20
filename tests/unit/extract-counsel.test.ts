import { describe, it, expect } from 'vitest';
import { extractCounselDocument } from '../../src/assembly/extract-counsel.js';

describe('extractCounselDocument', () => {
  function makeToS(): string {
    // Pad each section so the total exceeds MIN_EXTRACTED_CHARS (2000).
    const para = (n: number) => 'This is realistic legal prose that describes the terms in detail. '.repeat(n);
    return [
      '# LoveNow Terms of Service',
      '',
      '**Effective Date:** [INSERT DATE]',
      '',
      para(5),
      '',
      '## 1. Eligibility',
      '',
      '### 1.1 Age Requirement',
      '',
      para(5),
      '',
      '### 1.2 Account Verification',
      '',
      para(5),
      '',
      '## 2. Account Registration',
      '',
      para(5),
      '',
      '## 3. User Conduct',
      '',
      para(5),
      '',
      '## 4. Termination',
      '',
      para(5) + 'these Terms.',
    ].join('\n');
  }

  it('returns empty string for empty/short input', () => {
    expect(extractCounselDocument('')).toBe('');
    expect(extractCounselDocument('short')).toBe('');
  });

  it('returns empty string when no top-level heading exists', () => {
    const noHeading = 'Just some prose here.\n\nMore prose without any markdown headings at all.\n\n' + 'x'.repeat(3000);
    expect(extractCounselDocument(noHeading)).toBe('');
  });

  it('extracts a clean markdown document that starts with orchestrator preamble', () => {
    const input = [
      "I'll start by checking the current workflow step and gathering context.",
      '',
      'Good. Intake step, clean slate. Triage assessment: dating platform ToS.',
      '',
      'Now dispatching the contract specialist.',
      '',
      makeToS(),
    ].join('\n');

    const result = extractCounselDocument(input);
    expect(result).toContain('# LoveNow Terms of Service');
    expect(result).toContain('## 4. Termination');
    expect(result).not.toContain("I'll start by");
    expect(result).not.toContain('Now dispatching');
  });

  it('strips trailing orchestrator epilogue', () => {
    const input = [
      makeToS(),
      '',
      '**Specialist:** Draft complete.',
      '',
      'Now dispatching to the evaluator for final review.',
      '',
      'Session complete.',
    ].join('\n');

    const result = extractCounselDocument(input);
    expect(result).toContain('## 4. Termination');
    expect(result).not.toContain('Specialist:');
    expect(result).not.toContain('Now dispatching');
    expect(result).not.toContain('Session complete');
  });

  it('strips both leading and trailing narrative', () => {
    const input = [
      "I'll start by checking the workflow.",
      'Let me look at the brief.',
      '',
      makeToS(),
      '',
      'Now dispatching next step.',
      'Handoff complete.',
    ].join('\n');

    const result = extractCounselDocument(input);
    expect(result.startsWith('# LoveNow Terms of Service')).toBe(true);
    expect(result.trimEnd().endsWith('these Terms.')).toBe(true);
  });

  it('returns empty when document is too short after extraction', () => {
    const input = '# Short\n\nOnly a few words.';
    expect(extractCounselDocument(input)).toBe('');
  });

  it('returns empty when content is mostly narrative (not a document)', () => {
    const narrative = [
      "# Analysis",
      '',
      "I'll start by reviewing the document.",
      "Let me check each section.",
      "I've identified three issues.",
      "Now dispatching to the specialist.",
      "The specialist has produced findings.",
      "The ethics auditor agrees.",
      "Let me summarize.",
      "First, I reviewed the eligibility section.",
      "Then I checked the termination clauses.",
      "Next, I evaluated the arbitration terms.",
      "The evaluator scored this at 7/10.",
    ].join('\n') + '\n\n' + 'x'.repeat(2500);

    // Even though length > 2000, narrative ratio is too high
    expect(extractCounselDocument(narrative)).toBe('');
  });

  it('requires at least 3 markdown headings', () => {
    const twoHeadings = [
      '# Title',
      '',
      'Some content. '.repeat(100),
      '',
      '## Only Section',
      '',
      'More content. '.repeat(100),
    ].join('\n');

    expect(extractCounselDocument(twoHeadings)).toBe('');
  });

  describe('<deliverable> marker fast path', () => {
    it('extracts content between markers and ignores surrounding narration', () => {
      const inner = '# MEMORANDUM\n\n' + 'Substantive legal advice with enough body. '.repeat(20);
      const input = [
        "I'll handle this Counsel workflow. No prior precedent. Proceeding.",
        '{"agentId":"abc","totalDurationMs":12345,"usage":{}}',
        '<deliverable>',
        inner,
        '</deliverable>',
        'Workflow complete. Final spend: $0.12.',
      ].join('\n');

      const result = extractCounselDocument(input);
      expect(result).toContain('# MEMORANDUM');
      expect(result).not.toContain("I'll handle");
      expect(result).not.toContain('agentId');
      expect(result).not.toContain('Workflow complete');
      expect(result).not.toContain('<deliverable>');
    });

    it('uses the LAST marker pair when multiple exist', () => {
      const placeholder = '# DRAFT\n\nthinking out loud about the structure';
      const real = '# FINAL MEMO\n\n' + 'Polished client-facing advice. '.repeat(30);
      const input = [
        '<deliverable>', placeholder, '</deliverable>',
        'On reflection, let me redraft.',
        '<deliverable>', real, '</deliverable>',
      ].join('\n');

      const result = extractCounselDocument(input);
      expect(result).toContain('# FINAL MEMO');
      expect(result).not.toContain('# DRAFT');
    });

    it('falls through to heuristic extractor when marker block is too thin', () => {
      const thin = '<deliverable>tiny</deliverable>\n\n' + makeToS();
      const result = extractCounselDocument(thin);
      // Heuristic path kicks in and extracts the ToS instead.
      expect(result).toContain('# LoveNow Terms of Service');
    });

    it('decodes escaped newlines inside the marker block', () => {
      const inner = '# MEMO\\n\\n' + 'Body content with escaped newlines. '.repeat(20);
      const input = `<deliverable>${inner}</deliverable>`;
      const result = extractCounselDocument(input);
      expect(result).toMatch(/^# MEMO\n\n/);
    });
  });

  it('preserves the document structure verbatim', () => {
    const doc = makeToS();
    const input = 'Preamble.\n\n' + doc;
    const result = extractCounselDocument(input);

    // All original headings should be preserved
    expect(result).toContain('# LoveNow Terms of Service');
    expect(result).toContain('## 1. Eligibility');
    expect(result).toContain('### 1.1 Age Requirement');
    expect(result).toContain('### 1.2 Account Verification');
    expect(result).toContain('## 2. Account Registration');
    expect(result).toContain('## 3. User Conduct');
    expect(result).toContain('## 4. Termination');
  });
});
