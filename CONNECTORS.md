# Connectors

Lavern speaks to a curated set of external services and bundles a small set of internal MCP tools and reference datasets. This file is the authoritative index. For the in-code authoritative list of MCP tools, see `src/mcp/tools/`; for the bundled datasets, see `scripts/seed-knowledge-base.ts`.

## LLM providers

Lavern abstracts the underlying model behind a provider interface in `src/providers/`. Per-session provider selection is exposed in the dashboard (Strategy view → ProviderToggle) and the API (`provider` field on `POST /api/sessions`).

| Provider | Used by default? | Required env | When to use |
|---|---|---|---|
| **Anthropic Claude** | yes | `ANTHROPIC_API_KEY` | Default. Opus 4.7 for primary orchestration, Sonnet 4.5 for lighter passes. |
| **Mistral AI** (EU sovereign) | no | `MISTRAL_API_KEY` + `LAVERN_PROVIDER=mistral` | European in-house teams under Schrems II pressure. Data stays in EU. Per-session opt-in. |
| **Ollama** (on-device) | only in Clawern | (local) | Clawern confidential-mode triage. Runs entirely on-device. Zero LLM cost. |

## Internal MCP tools (21)

Every Lavern agent calls into these tools via the Model Context Protocol. Tools are factory-created with session state in closure, emit events into the session bus for the dashboard, and are gated by phase-based permissions (`src/permissions/`).

| Tool | File | Purpose |
|---|---|---|
| `approval-gate` | `src/mcp/tools/approval-gate.ts` | Human approval gate for critical findings; non-overridable. |
| `baselines` | `src/mcp/tools/baselines.ts` | Baseline contract comparison against bundled corpora. |
| `debate-board` | `src/mcp/tools/debate-board.ts` | The core multi-agent debate primitive — post findings, challenge, resolve. |
| `document-checks` | `src/mcp/tools/document-checks.ts` | Document-level structural and integrity checks. |
| `document-reader` | `src/mcp/tools/document-reader.ts` | Parsed-document access for agents (PDF, DOCX, MD, TXT after SMAC-L1 sanitization). |
| `evaluator-gate` | `src/mcp/tools/evaluator-gate.ts` | Pre-delivery validation gate. Fail-closed on first error. |
| `feedback-loop` | `src/mcp/tools/feedback-loop.ts` | Post-engagement feedback capture for the precedent board and report cards. |
| `generic-workflow-engine` | `src/mcp/tools/generic-workflow-engine.ts` | Generic dispatch primitive used by workflow templates. |
| `grounding-verifier` | `src/mcp/tools/grounding-verifier.ts` | Mechanical cross-reference of cited clauses against parsed-document text. Zero LLM cost. |
| `handoff` | `src/mcp/tools/handoff.ts` | Inter-agent and inter-orchestrator handoff with state transfer. |
| `knowledge-base` | `src/mcp/tools/knowledge-base.ts` | FTS5 search over bundled + user reference collections. |
| `legal-md-compiler` | `src/mcp/tools/legal-md-compiler.ts` | Compiles Lavern's internal markdown to legal-document output formats. |
| `memory-system` | `src/mcp/tools/memory-system.ts` | Per-session and cross-session agent memory with atomic writes. |
| `pre-engagement` | `src/mcp/tools/pre-engagement.ts` | Intake briefing analysis, team selection, and engagement scoping. |
| `quality-check` | `src/mcp/tools/quality-check.ts` | Final quality pass before delivery; placeholder + contamination detection. |
| `report-card` | `src/mcp/tools/report-card.ts` | Agent and team scoring; per-engagement report card generation. |
| `risk-pricing` | `src/mcp/tools/risk-pricing.ts` | Risk-priced contract scoring against benchmark distributions. |
| `scoring-engine` | `src/mcp/tools/scoring-engine.ts` | Finding severity and confidence scoring with calibrated thresholds. |
| `session-replay-testing` | `src/mcp/tools/session-replay-testing.ts` | Session replay for deterministic regression testing. |
| `verification-engine` | `src/mcp/tools/verification-engine.ts` | The 10-pass verification pipeline. Three-layer fail-closed enforcement. |
| `workflow-engine` | `src/mcp/tools/workflow-engine.ts` | Workflow template orchestration (9 templates in `src/workflows/templates/`). |

## Remote MCP bridge (preview)

Lavern can expose a subset of its MCP surface as a remote MCP server over JSON-RPC 2.0, so the Anthropic Managed Agents runtime can treat Lavern as one of its tools. Gated behind `LAVERN_MANAGED_AGENTS_BRIDGE=1` and authenticated with a shared secret (`LAVERN_MANAGED_AGENTS_BRIDGE_SECRET`, ≥32 chars) plus an `X-Lavern-Session-Id` header.

| Surface | What's exposed |
|---|---|
| JSON-RPC methods | `initialize`, `tools/list`, `tools/call`, `notifications/initialized` |
| Tool factories | `createWorkflowTools`, `createMemoryTools`, `createKnowledgeBaseTools`, `createHandoffTools`, `createFeedbackLoopTools` — 12 tools total |
| Auth | `Authorization: Bearer <secret>` (timing-safe compare) + `X-Lavern-Session-Id: <session-id>` |
| Defense in depth | Allowlist enforced at JSON-RPC server layer AND at the dispatcher layer |

Detailed staged-rollout status in [`docs/managed-agents-migration.md`](docs/managed-agents-migration.md).

## Bundled legal datasets

Seeded by `scripts/seed-knowledge-base.ts` into the FTS5 knowledge base. Available to all users as global reference collections via the `knowledge-base` MCP tool. Skip individual datasets with `--cuad`, `--maud`, `--acord`, `--unfair-tos`, `--ledgar` flags; force re-seed with `--force`.

| Dataset | Content | License | Source |
|---|---|---|---|
| **CUAD** | 510 commercial contracts, 41 clause types | CC BY 4.0 | [Atticus Project](https://www.atticusprojectai.org/cuad) |
| **MAUD** | 152 merger agreements, 92 deal points | CC BY 4.0 | [Atticus Project](https://www.atticusprojectai.org/maud) |
| **ACORD** | 126K+ expert-rated clause retrieval pairs | CC BY 4.0 | [Atticus Project](https://www.atticusprojectai.org/acord) |
| **UNFAIR-ToS** | 5.5K sentences, 8 unfair-clause types | CC BY-SA 4.0 | [LexGLUE / coastalcph](https://github.com/coastalcph/lex-glue) |
| **LEDGAR** | 60K SEC contract provisions, 98 clause types | CC BY-SA 4.0 | [LexGLUE / coastalcph](https://github.com/coastalcph/lex-glue) |
| **ContractNLI** | — | CC BY-NC-SA 4.0 (incompatible with Apache 2.0) | *Not bundled.* Fetch independently from [stanfordnlp.github.io/contract-nli](https://stanfordnlp.github.io/contract-nli/) and accept its non-commercial terms. |

Attribution requirements per dataset license live in [NOTICE](NOTICE).

## External integrations

Lavern speaks to a small set of third-party services. All are optional unless the relevant feature is in use; production startup validation in `src/config.ts` enforces presence of required keys when `NODE_ENV=production`.

| Service | What it powers | Required env | Optional? |
|---|---|---|---|
| **Anthropic API** | Primary LLM | `ANTHROPIC_API_KEY` | Optional in demo mode |
| **Mistral API** | EU sovereign LLM | `MISTRAL_API_KEY` | Optional; required if `LAVERN_PROVIDER=mistral` |
| **Ollama** (local daemon) | Clawern on-device triage for confidential docs | (none — local socket) | Optional; only used by Clawern hybrid/ethical mode |
| **Stripe** | Billable-hours billing, top-ups, subscriptions | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Off in LOCAL MODE; requires `LAVERN_AUTH_ENABLED=true` |
| **Resend** | Transactional email (verification, password reset, receipts, low-balance, weekly digest, Clawern alerts) | `RESEND_API_KEY` | Verification + password-reset mails only fire with `LAVERN_AUTH_ENABLED=true`; Clawern alerts always |
| **Telegram Bot API** | Clawern two-way control (status, findings, pause, resume) and alerts | `LAVERN_CLAW_TELEGRAM_BOT_TOKEN`, `LAVERN_CLAW_TELEGRAM_CHAT_ID` | Optional |
| **Deepgram** | Voice-mode speech-to-text (intake, interrupt, post-case) | `DEEPGRAM_API_KEY` | Optional (Web Speech API fallback) |
| **ElevenLabs** | Voice-mode text-to-speech (future read-back) | `ELEVENLABS_API_KEY` | Optional |
| **Google OAuth** | Signup / login with Google | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI` | Off in LOCAL MODE; requires `LAVERN_AUTH_ENABLED=true` |
| **Plausible Analytics** | Marketing site + dashboard analytics | (client-side, no key) | Optional |
| **Sentry** | Server + client error monitoring | `SENTRY_DSN`, `VITE_SENTRY_DSN` | Optional |

## Clawern notification surfaces

Clawern's notification system fans out across multiple channels. All are optional and independently configurable.

| Surface | When it fires | Configured by |
|---|---|---|
| **Webhook** | Every notification event (configurable filter) | `LAVERN_CLAW_WEBHOOK_URL` |
| **macOS native** | All severities on macOS host | `LAVERN_CLAW_NOTIFY_MACOS=1` (default on macOS) |
| **Telegram** | Critical + heartbeat + precedent matches | Telegram env vars above |
| **Email (Resend)** | Critical findings + weekly digest | Resend env vars above + `LAVERN_CLAW_NOTIFY_EMAIL=1` |
| **Filesystem (audit log)** | Every notification — append-only JSON lines | `LAVERN_CLAW_AUDIT_PATH` |

Confidential documents are redacted from notifications according to `LAVERN_CLAW_NOTIFY_REDACTION_LEVEL` (`minimal` | `summary` | `full`).

## What we don't connect to (yet)

For honesty's sake — Lavern does **not** currently bundle integrations with:

- **Document management systems** (iManage, NetDocuments) — on the roadmap.
- **Contract lifecycle management** (Ironclad, DocuSign CLM, Spotdraft) — on the roadmap.
- **Legal research databases** (Westlaw, Lexis, Bloomberg Law, CoCounsel) — on the roadmap; Lavern's `claude-for-legal` compatibility path (v0.15) is one way these could land.
- **E-discovery platforms** (Everlaw, Relativity) — out of scope for now.
- **Court docket systems** (CourtListener, PACER, Trellis) — out of scope for now.

If you're building a connector, see [CONTRIBUTING.md](CONTRIBUTING.md). MCP tools are factory functions; external connectors live alongside `src/providers/` or as new MCP tools.
