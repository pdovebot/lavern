/**
 * Briefing questions per workflow type.
 *
 * Each workflow has a tailored set of intake questions
 * that mirror how a law firm would conduct a first meeting.
 *
 * impactNote: shown to the user after they answer, explaining WHY
 * the context matters. Makes providing context feel rewarding.
 */

export interface BriefingQuestion {
  id: string;
  text: string;
  hint?: string;
  required: boolean;
  multiline: boolean;
  category: 'context' | 'scope' | 'constraints' | 'objectives';
  impactNote?: string;
}

export const WORKFLOW_QUESTIONS: Record<string, BriefingQuestion[]> = {
  'roundtable': [
    {
      id: 'matter-description',
      text: 'Describe the document you need reviewed or improved.',
      hint: 'What is the document, and what do you need — review, redraft, simplification, or something else?',
      required: true,
      multiline: true,
      category: 'context',
      impactNote: 'This shapes every agent\'s analysis — the more specific, the sharper their work.',
    },
    {
      id: 'audience',
      text: 'Who is the primary audience, and what industry or business does this document relate to?',
      hint: 'Consumers, small business owners, employees, enterprise clients... and the sector — SaaS, healthcare, finance, retail...',
      required: true,
      multiline: false,
      category: 'context',
      impactNote: 'Knowing your audience and industry helps us calibrate readability targets, tone, and sector-specific requirements.',
    },
    {
      id: 'pain-points',
      text: 'What issues have you noticed with the current version?',
      hint: 'Unclear language, compliance gaps, missing sections, outdated terms...',
      required: false,
      multiline: true,
      category: 'scope',
      impactNote: 'Known issues tell agents where to focus their review effort.',
    },
    {
      id: 'constraints',
      text: 'Any regulatory or compliance constraints?',
      hint: 'Specific jurisdictions, industry regulations, internal policies...',
      required: true,
      multiline: true,
      category: 'constraints',
      impactNote: 'Regulatory context prevents changes that could create compliance issues.',
    },
    {
      id: 'success-criteria',
      text: 'What does success look like?',
      hint: 'Measurable outcomes, deadlines, stakeholder requirements...',
      required: false,
      multiline: true,
      category: 'objectives',
      impactNote: 'Clear success criteria let agents verify their work against your expectations.',
    },
  ],

  'review': [
    {
      id: 'contract-type',
      text: 'What type of contract is this?',
      hint: 'SaaS agreement, employment contract, NDA, vendor agreement...',
      required: true,
      multiline: false,
      category: 'context',
      impactNote: 'Contract type activates specialized review templates and risk frameworks.',
    },
    {
      id: 'party-position',
      text: 'Which party do you represent, and what is your position?',
      hint: 'Are you the drafter, counterparty, or a neutral advisor?',
      required: true,
      multiline: true,
      category: 'context',
      impactNote: 'Your position determines which clauses to strengthen vs. which to challenge.',
    },
    {
      id: 'key-concerns',
      text: 'What terms or clauses concern you most?',
      hint: 'Liability caps, IP ownership, termination rights, data handling...',
      required: false,
      multiline: true,
      category: 'scope',
      impactNote: 'Flagged concerns get prioritized in the review and receive deeper analysis.',
    },
    {
      id: 'deal-context',
      text: 'What is the broader deal context?',
      hint: 'Deal size, timeline pressure, relationship with counterparty...',
      required: false,
      multiline: true,
      category: 'context',
      impactNote: 'Deal context helps calibrate how aggressive or conciliatory to be.',
    },
    {
      id: 'risk-appetite',
      text: 'What is your risk appetite?',
      hint: 'Conservative (flag everything), balanced, or aggressive...',
      required: false,
      multiline: false,
      category: 'constraints',
      impactNote: 'Risk appetite sets the threshold for what gets flagged vs. accepted.',
    },
    {
      id: 'objective',
      text: 'What is your objective?',
      hint: 'What does good look like? Financial, risk management, or other outcomes that matter.',
      required: true,
      multiline: true,
      category: 'objectives',
      impactNote: 'A clear objective aligns the review toward outcomes that matter to you, not just generic legal issues.',
    },
  ],

  'adversarial': [
    {
      id: 'research-question',
      text: 'What legal question needs answering?',
      hint: 'Be as specific as possible about the issue...',
      required: true,
      multiline: true,
      category: 'context',
      impactNote: 'A precise question produces a focused memo; a vague one produces a survey.',
    },
    {
      id: 'jurisdiction',
      text: 'Which jurisdiction(s) are relevant?',
      hint: 'US federal, specific states, EU, UK, multiple...',
      required: true,
      multiline: false,
      category: 'context',
      impactNote: 'Jurisdiction determines which legal authorities and precedents are analyzed.',
    },
    {
      id: 'factual-background',
      text: 'What are the key facts?',
      hint: 'Relevant facts, parties involved, timeline of events...',
      required: false,
      multiline: true,
      category: 'scope',
      impactNote: 'Facts let agents apply law to your specific situation, not just in theory.',
    },
    {
      id: 'desired-outcome',
      text: 'What outcome are you hoping to support?',
      hint: 'The position or argument you want to evaluate...',
      required: false,
      multiline: true,
      category: 'objectives',
      impactNote: 'Knowing your preferred outcome helps agents test its viability honestly.',
    },
  ],

  'counsel': [
    {
      id: 'question',
      text: 'What is your legal question?',
      hint: 'Describe what you need help with...',
      required: true,
      multiline: true,
      category: 'context',
      impactNote: 'The clearer your question, the more actionable the answer.',
    },
    {
      id: 'context',
      text: 'Any relevant context?',
      hint: 'Background information, specific circumstances...',
      required: false,
      multiline: true,
      category: 'context',
      impactNote: 'Context transforms a generic answer into advice tailored to your situation.',
    },
    {
      id: 'jurisdiction',
      text: 'What jurisdiction does this question relate to?',
      hint: 'US federal, California, Delaware, EU, UK, multiple jurisdictions...',
      required: true,
      multiline: false,
      category: 'context',
      impactNote: 'Jurisdiction determines which laws, regulations, and precedents apply to your question.',
    },
    {
      id: 'industry',
      text: 'What industry does this question apply to?',
      hint: 'SaaS, healthcare, finance, e-commerce, professional services...',
      required: false,
      multiline: false,
      category: 'context',
      impactNote: 'Industry context surfaces sector-specific regulations and standard practices that affect the analysis.',
    },
    {
      id: 'business-relevance',
      text: 'What is the relevance of this question to your business operations?',
      hint: 'How does this issue affect your day-to-day operations, contracts, or strategic decisions?',
      required: false,
      multiline: true,
      category: 'context',
      impactNote: 'Understanding operational impact helps agents prioritize practical, actionable guidance over purely theoretical analysis.',
    },
    {
      id: 'cost-constraints',
      text: 'Are there cost constraints we should factor into this analysis?',
      hint: 'Budget limits, cost-benefit considerations, proportionality to deal size...',
      required: false,
      multiline: false,
      category: 'constraints',
      impactNote: 'Cost constraints shape whether recommendations are practical to implement for your situation.',
    },
    {
      id: 'urgency',
      text: 'How urgent is this?',
      hint: 'Immediate, this week, no deadline...',
      required: false,
      multiline: false,
      category: 'constraints',
      impactNote: 'Urgency helps us balance thoroughness with speed.',
    },
  ],

  'pre-engagement': [
    {
      id: 'client-name',
      text: 'Client name and entity type?',
      hint: 'Individual, corporation, partnership, non-profit...',
      required: true,
      multiline: false,
      category: 'context',
      impactNote: 'Entity type determines which regulatory frameworks apply.',
    },
    {
      id: 'matter-type',
      text: 'What type of matter is this?',
      hint: 'Transaction, litigation, advisory, regulatory...',
      required: true,
      multiline: false,
      category: 'context',
      impactNote: 'Matter type selects the right workflow and team composition.',
    },
    {
      id: 'matter-description',
      text: 'Describe the matter briefly.',
      hint: 'Overview of the engagement and expected scope...',
      required: true,
      multiline: true,
      category: 'scope',
      impactNote: 'A clear scope description prevents scope creep and sets proper expectations.',
    },
    {
      id: 'conflicts',
      text: 'Any potential conflicts of interest?',
      hint: 'Adverse parties, prior representations...',
      required: false,
      multiline: true,
      category: 'constraints',
      impactNote: 'Early conflict identification prevents costly surprises mid-engagement.',
    },
  ],

  default: [
    {
      id: 'matter-description',
      text: 'Describe the matter you need help with.',
      hint: 'Please supply who, what, when, where, and why - and the question or questions you have.',
      required: true,
      multiline: true,
      category: 'context',
      impactNote: 'More detail here means more relevant, actionable results.',
    },
    {
      id: 'outputs',
      text: 'What outputs are you looking for from me?',
      hint: 'A detailed memo, a decision guide, a contract...',
      required: true,
      multiline: true,
      category: 'objectives',
      impactNote: 'Knowing the desired output format lets agents structure their work to be immediately usable.',
    },
    {
      id: 'business-objectives',
      text: 'What are the business objectives you want to achieve?',
      hint: 'A transaction, risk management, resolution of a dispute, launch of a new product...',
      required: true,
      multiline: true,
      category: 'objectives',
      impactNote: 'Business objectives ground the analysis in what actually matters to your organisation.',
    },
    {
      id: 'constraints',
      text: 'Any constraints or deadlines?',
      hint: 'Timeline, budget, regulatory, jurisdictional...',
      required: false,
      multiline: true,
      category: 'constraints',
      impactNote: 'Constraints shape practical recommendations, not just theoretical ones.',
    },
  ],
};

// Backward-compatible alias for old workflow ID
WORKFLOW_QUESTIONS['legal-design'] = WORKFLOW_QUESTIONS['roundtable'];
