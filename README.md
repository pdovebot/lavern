# Lavern

**An agentic law firm. Yours.** Open source. Apache 2.0.

Lavern is a team of 67 AI agents that reviews documents, debates risks, and delivers defensible outputs — every finding cited, every decision auditable, every critical call gated by a human. Run it interactively (brief it; it works), or autonomously: **Clawern** mode watches a folder, reviews documents overnight, and pings your phone when something matters.

> **Disclaimer:** Lavern assists with document analysis and legal design. It does not provide legal advice. Always verify outputs with qualified legal professionals.

**[Quick Start →](QUICKSTART.md)** · **[Architecture deep-dive →](https://lavern.ai/architecture/)** · **[lavern.ai](https://lavern.ai)**

## What's in the box

**67 agents** · **21 MCP tools** · **9 workflows** · **5 legal datasets** (CUAD · MAUD · ACORD · UNFAIR-ToS · LEDGAR) · **2 LLM providers** (Claude · Mistral EU) · **1,695 tests** across 108 files.

## How Lavern relates to Claude for Legal

Anthropic recently released [`claude-for-legal`](https://github.com/anthropics/claude-for-legal) — a suite of practice-area plugins (commercial, privacy, IP, litigation, employment, M&A, regulatory, AI governance, and more) that ship inside Claude Cowork and Claude Code. It's excellent. If you're a lawyer who wants drop-in AI skills inside the tools you already use, start there.

Lavern is a different shape of thing. Not a plugin pack — a firm. End-to-end engagements with a team of agents, a debate protocol between them, a human gate before critical decisions, and a dual artifact (user-facing deliverable + legal review package) for every output. You don't invoke a skill; you brief a team.

The honest split:

- **Use Claude for Legal** if you want to augment an existing lawyer's workflow with task-specific AI skills inside Claude.
- **Use Lavern** if you want an autonomous law firm — multi-agent, end-to-end, with a continuous-practice mode (Clawern) that watches your folders and an EU-sovereign mode (Mistral) for European in-house teams.

They're compatible: Lavern runs on Claude (or Mistral), the same models Claude for Legal does. A future release will let Lavern's orchestrator dispatch to `claude-for-legal` plugins as installable specialists.

## What This Is

67 agents (specialists + orchestrators) organized into 9 workflows, from quick legal questions to full adversarial review. Agents post findings with evidence, challenge each other through a formal debate protocol, and resolve disputes with auditable reasoning.

Every engagement produces two outputs: a user-facing deliverable and a complete legal review package with the full chain of reasoning.

### What "67 agents" actually means

Honest version, because this is the first question every engineer asks: **each agent is a specialized system prompt with its own role, its own MCP tool permissions, and its own slot in the debate protocol.** Sixty-seven of them — 59 domain specialists, 7 orchestrators, 1 base prompt — all running on the same underlying frontier LLM (Claude or Mistral, your choice).

So yes — at the bottom of the stack it's an LLM. Anyone can prompt one.

The work isn't the prompts. The work is everything around them:

- **The debate protocol.** Agents must cite evidence from the parsed document. Findings without citations don't enter the board. Agents review each other's work and can challenge — the challenger has to cite text too.
- **The three-layer verification loop.** Evaluator gate (drops weak findings), adversarial debate (red-team / blue-team), 10-pass verification pipeline (mechanical cross-checks: clause grounding, defined-term integrity, monetary preservation, jurisdiction integrity, …). Each layer fails closed.
- **Human gates.** Critical findings don't auto-deliver. The orchestrator pauses, surfaces the call, and waits for a real human (you) to approve or override.
- **Precedent Board.** Persistent memory across engagements. Findings that recurred across documents get reinforced; stale ones decay. The next review starts smarter than the last.

That stack is what separates "I prompted Claude and got a contract review" from "I have an auditable artifact I can defend in a deposition."

**Key architectural ideas:**

- **Debate is the product.** Agents challenge each other's findings. Disagreement produces better results than consensus.
- **Three verification layers.** Evaluator gate, adversarial debate, 10-pass verification pipeline. Fail-closed.
- **Grounding verification.** Mechanical cross-reference of cited clauses against the parsed document. Zero LLM cost.
- **Human gates are mandatory.** Critical findings require human approval. The system raises concerns; humans decide.
- **Uncertainty is a feature.** Agents can decline to find when evidence is insufficient. Low confidence triggers escalation, not guessing.
- **Precedent Board.** Institutional memory that compounds across engagements. Every document reviewed makes the next review smarter.
- **Soul.** User-defined firm personality. Safety invariants (preservation rules, confidence thresholds) are firewalled from personality.

## Quick Start

For the full 60-second walkthrough — install + first engagement + "who are you, where to start" — see [QUICKSTART.md](QUICKSTART.md).

Short version:

```bash
curl -fsSL lavern.ai/install.sh | sh   # or: git clone + npm install (see below)
cd lavern

# Terminal 1 — API server on :3000  (demo mode, no API key needed)
npm run serve:dev

# Terminal 2 — Dashboard on :5173  (Vite, hot reload)
cd viz && npm run dev

open http://localhost:5173
```

Without curl-piping, the manual path is the same three steps the script runs for you:

```bash
git clone https://github.com/AnttiHero/lavern.git
cd lavern
npm install
(cd viz && npm install)
```

Demo mode gives you the full dashboard, auth, and Clawern monitoring without an API key. To process documents, add `ANTHROPIC_API_KEY` (or `MISTRAL_API_KEY` for the EU sovereign provider) to `.env` — it's auto-created from `.env.example` on first run.

## Clawern (Autonomous Mode)

Drop files in a folder. Clawern reviews them overnight. Critical findings hit your phone.

```bash
npm run dev -- claw init       # Interactive setup
npm run dev -- claw validate   # Check configuration
npm run dev -- claw start      # Start watching
npm run dev -- claw pause      # Pause processing
npm run dev -- claw resume     # Resume processing
```

Features: 30-minute heartbeat, Telegram bot, email alerts, weekly digest, scheduled re-review, change detection, cost forecasting, portfolio intelligence, hybrid local+frontier processing, multi-client isolation, audit trail, Prometheus metrics. For maximum-confidentiality engagements, `claw start --ethical` enforces Mistral EU only with conservative risk posture.

## Dashboard

React SPA with editorial design language. WCAG AA accessible, responsive.

**Flow:** Landing → Briefing → Strategy → Team → Working → Delivery

The Working view is a live team chat room where you watch agents analyze, post findings, debate, and resolve disputes in real time. The Delivery view includes confidence scores, grounding indicators, and the full audit trail.

## API

```bash
npm run dev -- --serve    # Start API server (default: localhost:3000)
```

| Endpoint | Description |
|----------|-------------|
| `POST /api/sessions` | Create analysis session |
| `GET /api/sessions/:id/events` | WebSocket event stream |
| `POST /api/sessions/:id/gate` | Submit gate decision |
| `GET /api/sessions/:id/download` | Download work product |
| `POST /api/engage` | Agent-native engagement (sync + webhook) |
| `POST /api/auth/signup` | User registration |
| `GET /.well-known/agent.json` | A2A agent card |

See [`.env.example`](.env.example) for full configuration. Key variables:

- `ANTHROPIC_API_KEY` — Anthropic API key (optional in demo mode)
- `MISTRAL_API_KEY` — Mistral API key (optional; required if `LAVERN_PROVIDER=mistral`)
- `LAVERN_PROVIDER` — `anthropic` (default) or `mistral`
- `SHEM_PORT` — Server port (default: 3000)
- `SHEM_DEFAULT_BUDGET` — Per-session budget in USD (default: 5.0)

## Development

```bash
npm test                  # 1,665 tests across 108 files
npm run typecheck:all     # TSC check (backend + frontend)
npm run build             # Build backend
cd viz && npm run build   # Build dashboard
```

## Project Structure

```
src/
├── agents/             # 67 agent prompts + profiles + definitions
├── api/                # Fastify API server + WebSocket + middleware
├── assembly/           # Document assembly + format conversion + fidelity check
├── claw/               # Clawern: 28 modules (watch, plan, process, deliver,
│                       #   precedents, audit, backup, telegram, multi-client,
│                       #   hybrid analysis, anonymization, voice dispatch)
├── db/                 # SQLite persistence
├── documents/          # Document parser (PDF, DOCX, MD, TXT) + sanitization
├── mcp/tools/          # 21 MCP tools (debate, scoring, verification,
│                       #   grounding, memory, knowledge base, quality checks)
├── mcp/remote-bridge/  # JSON-RPC bridge exposing Counsel tools to Anthropic
│                       #   Managed Agents (gated by env flag)
├── providers/          # LLM provider abstraction (Claude, Mistral EU)
├── workflows/          # 9 templates + executor
├── config.ts           # Centralized config (all env-var backed)
└── index.ts            # Entry point

viz/                    # React dashboard
├── landing/            # Landing, QuickStart, YOLO launcher
├── briefing/           # LLM-powered intake
├── staffing/           # Strategy + team selection
├── working/            # Live agent activity
├── delivery/           # Tabbed delivery with confidence scores
├── claw/               # Clawern monitoring dashboard
├── dispatch/           # Voice Dispatch
├── challenge/          # Lavern Challenge (blind document comparison)
└── agent-builder/      # Custom agent builder

site/                   # Marketing site (static, Netlify)
menubar/                # macOS menu bar app (SwiftUI)
tests/                  # 1,665 tests across 108 files
```

For full architectural detail see [CLAUDE.md](CLAUDE.md) (the same context Claude Code reads when working on this repo).

## Connectors

Lavern's 21 MCP tools, 5 bundled legal datasets, 2 LLM providers, and the remote MCP bridge are documented in [CONNECTORS.md](CONNECTORS.md).

## Status

Lavern is at **v0.15.0** — the initial public open-source release. Lavern was developed privately for several months before this point; the codebase has been running in production-like environments throughout that period. The engine, Clawern daemon, and dashboard are stable. The remote MCP bridge for Anthropic Managed Agents is gated behind a feature flag and considered preview. The HTTP API is evolving — expect non-breaking additions before a v1.0 freeze. Pin a tag if you depend on it.

Test coverage is 1,665 tests across 108 files (97 unit + 11 integration). `npm run typecheck:all` is clean on both backend and frontend.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New agents, new MCP tools, and new workflow templates are all welcomed — the agent prompts are pure markdown and editable in any editor.

## Security

Found a vulnerability? See [SECURITY.md](SECURITY.md). Email `security@lavern.ai` — please do not file public GitHub issues for security bugs.

## License

[Apache 2.0](LICENSE) — Copyright (c) 2025-2026 Antti Innanen.

See [NOTICE](NOTICE) for third-party attributions and dataset licenses.
