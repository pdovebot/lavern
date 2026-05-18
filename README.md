# Lavern

**A multi-agent legal system. Yours.**

Sixty-seven AI agents that review documents, debate risks, and deliver defensible outputs. Every finding cited. Every decision auditable. Every critical call gated by a human. Apache 2.0.

Run it interactively, brief it like a partner. Or run **Clawern** mode and let it watch a folder, review documents overnight, ping your phone when something matters.

[**Watch the demo →**](https://lavern.ai/demo/) · [**lavern.ai**](https://lavern.ai) · [**Architecture deep-dive →**](https://lavern.ai/architecture/) · [**Quick Start →**](QUICKSTART.md)

> **Disclaimer.** Lavern is **not a law firm** and does **not provide legal advice**. The "agentic law firm" framing used in some of these docs is an analogy for the software's architecture, not a description of what Lavern is. Lavern is software that assists with document analysis and legal design. **You use it at your own risk.** Always have qualified legal counsel verify anything that matters before relying on it.

## Install

```bash
curl -fsSL lavern.ai/install.sh | sh
```

That clones the repo, installs both backend and frontend deps, and gives you a single `lavern` command. The full 60-second walkthrough (install plus first engagement plus "now what") lives in [QUICKSTART.md](QUICKSTART.md).

Prefer doing it by hand:

```bash
git clone https://github.com/AnttiHero/lavern.git
cd lavern
npm install
(cd viz && npm install)
```

Then:

```bash
npm run serve:dev          # API server on :3000 (LOCAL MODE, no API key needed)
cd viz && npm run dev      # Dashboard on :5173, hot reload
open http://localhost:5173
```

Demo mode runs the full dashboard, Clawern monitoring, and the cinematic guided tour without an API key. To process real documents, add `ANTHROPIC_API_KEY` (or `MISTRAL_API_KEY` for the EU sovereign provider) to `.env`. It's auto-created from `.env.example` on first run.

## What's in the box

- **67 agents** (59 specialists, 7 orchestrators, 1 base prompt)
- **21 MCP tools** (debate, scoring, verification, grounding, memory, knowledge base, quality checks)
- **9 workflows** from quick legal questions to full adversarial review
- **6 legal datasets** seeded out of the box: CUAD, MAUD, ACORD, UNFAIR-ToS, ContractNLI, LEDGAR
- **2 LLM providers**: Anthropic Claude (US) and Mistral AI (EU sovereign)
- **1,677 tests** across 109 files. Clean `tsc --noEmit` on backend and frontend.

## Three modes

**Interactive.** You open the dashboard, brief the firm in plain language, watch the agents work in a live chat room, and approve critical calls at human gates. Every engagement produces two outputs: a user-facing deliverable and a complete legal review package with the full chain of reasoning.

**Clawern (autonomous).** You drop files into a folder. Clawern watches it, reviews documents overnight, learns from precedent, and pings your phone (Telegram, email, macOS native) when something critical surfaces. Heartbeat health checks every 30 minutes. Weekly digest. Multi-client isolation. Audit trail. Cost forecasting. Hybrid local-plus-frontier mode for confidential work.

**EU Sovereign.** Flip `LAVERN_PROVIDER=mistral` and the entire stack routes through Mistral AI (Paris). Use `claw start --ethical` to enforce maximum confidentiality (EU only, all documents treated confidential, conservative risk posture).

## What "67 agents" actually means

Honest version, because this is the first question every engineer asks. Each agent is a specialised system prompt with its own role, its own MCP tool permissions, and its own slot in the debate protocol. Sixty-seven of them, all running on the same underlying frontier LLM (Claude or Mistral, your choice).

So yes, at the bottom of the stack it's an LLM. Anyone can prompt one.

The work isn't the prompts. The work is everything around them:

- **The debate protocol.** Agents must cite evidence from the parsed document. Findings without citations don't enter the board. Agents review each other's work and can challenge. The challenger has to cite text too.
- **The three-layer verification loop.** Evaluator gate (drops weak findings), adversarial debate (red team and blue team), 10-pass verification pipeline (mechanical cross-checks: clause grounding, defined-term integrity, monetary preservation, jurisdiction integrity). Each layer fails closed.
- **Human gates.** Critical findings don't auto-deliver. The orchestrator pauses, surfaces the call, and waits for a real human to approve or override.
- **Precedent Board.** Persistent memory across engagements. Findings that recurred across documents get reinforced. Stale ones decay. The next review starts smarter than the last.

That stack is what separates "I prompted Claude and got a contract review" from "I have an auditable artifact I can defend in a deposition."

## How Lavern relates to Claude for Legal

Anthropic recently released [`claude-for-legal`](https://github.com/anthropics/claude-for-legal), a suite of practice-area plugins (commercial, privacy, IP, litigation, employment, M&A, regulatory, AI governance) that ship inside Claude Cowork and Claude Code. It's excellent. If you're a lawyer who wants drop-in AI skills inside the tools you already use, start there.

Lavern is a different shape of thing. Not a plugin pack. A firm. End-to-end engagements with a team of agents, a debate protocol between them, a human gate before critical decisions, and a dual artifact (user-facing deliverable plus legal review package) for every output. You don't invoke a skill; you brief a team.

The honest split:

- **Use Claude for Legal** if you want to augment an existing lawyer's workflow with task-specific AI skills inside Claude.
- **Use Lavern** if you want an autonomous multi-agent legal system. End-to-end, with a continuous-practice mode (Clawern) that watches your folders and an EU-sovereign mode for European in-house teams. Still software; still your responsibility.

They're compatible. Lavern runs on Claude (or Mistral), the same models Claude for Legal does. A future release will let Lavern's orchestrator dispatch to `claude-for-legal` plugins as installable specialists.

## LOCAL MODE (the default in v0.15.0)

Out of the box Lavern runs as a single-user firm on your machine. No login, no signup, no cookies. Every request is the synthetic `local-user`. Account routes, Google OAuth, email verification, password reset, Stripe billing, and the referral system are all gated behind `LAVERN_AUTH_ENABLED=true` and don't register at startup.

That flag re-enables the v0.14 cookie-based multi-user flow if you want to host Lavern for a team. The database schema is unchanged. Flip the flag, restart, and the full multi-user stack comes back online with no migration needed.

## Dashboard

React SPA, editorial design language (Newsreader serif plus Geist sans on cream paper). WCAG AA accessible, responsive across desktop, tablet, and phone.

**Flow:** Landing → Briefing → Strategy → Team → Working → Delivery.

The Working view is a live team chat room. You watch agents analyse, post findings, debate, and resolve disputes in real time. The Delivery view includes confidence scores, grounding indicators, and the full audit trail.

## API

```bash
npm run dev -- --serve     # Start API server, default localhost:3000
```

| Endpoint | Description |
|---|---|
| `POST /api/sessions` | Create analysis session |
| `GET /api/sessions/:id/events` | WebSocket event stream |
| `POST /api/sessions/:id/gate` | Submit gate decision |
| `GET /api/sessions/:id/download` | Download work product |
| `POST /api/engage` | Agent-native engagement (sync plus webhook) |
| `GET /api/capabilities` | Report auth state, billing state, provider, version |
| `GET /.well-known/agent.json` | A2A agent card |

See [`.env.example`](.env.example) for full configuration. Key variables:

- `ANTHROPIC_API_KEY`. Anthropic API key. Optional in demo mode.
- `MISTRAL_API_KEY`. Mistral API key. Required if `LAVERN_PROVIDER=mistral`.
- `LAVERN_PROVIDER`. `anthropic` (default), `mistral`, or `local` (Ollama).
- `LAVERN_AUTH_ENABLED`. Set `true` to enable cookie auth, Stripe billing, and Google OAuth. Default: off.
- `SHEM_PORT`. Server port. Default: 3000.
- `SHEM_DEFAULT_BUDGET`. Per-session budget in USD. Default: 5.0.

## Clawern commands

```bash
npm run dev -- claw init       # Interactive setup
npm run dev -- claw validate   # Configuration health check
npm run dev -- claw start      # Start watching
npm run dev -- claw pause      # Pause processing
npm run dev -- claw resume     # Resume processing
```

Features: 30-minute heartbeat, Telegram bot, email alerts, weekly digest, scheduled re-review, change detection, cost forecasting, portfolio intelligence, hybrid local-plus-frontier processing, multi-client isolation, audit trail, Prometheus metrics. For maximum-confidentiality engagements, `claw start --ethical` enforces Mistral EU only with conservative risk posture.

## Development

```bash
npm test                  # 1,677 tests across 109 files
npm run typecheck:all     # TypeScript check (backend plus frontend)
npm run build             # Build backend
cd viz && npm run build   # Build dashboard
```

## Project structure

```
src/
├── agents/             67 agent prompts plus profiles plus definitions
├── api/                Fastify API server, WebSocket, middleware
├── assembly/           Document assembly, format conversion, fidelity check
├── claw/               Clawern: 28 modules (watch, plan, process, deliver,
│                       precedents, audit, backup, telegram, multi-client,
│                       hybrid analysis, anonymization)
├── db/                 SQLite persistence
├── documents/          Parser (PDF, DOCX, MD, TXT) plus sanitization
├── mcp/tools/          21 MCP tools
├── mcp/remote-bridge/  JSON-RPC bridge exposing Counsel tools to Anthropic
│                       Managed Agents (gated by env flag)
├── providers/          LLM provider abstraction (Claude, Mistral)
├── workflows/          9 templates plus executor
├── config.ts           Centralized config (env-var backed)
└── index.ts            Entry point

viz/                    React dashboard
site/                   Marketing site (static, Netlify)
menubar/                macOS menu bar app (SwiftUI)
tests/                  1,677 tests across 109 files
```

Full architectural detail in [CLAUDE.md](CLAUDE.md), the same context Claude Code reads when working on this repo.

## Connectors

Lavern's 21 MCP tools, 6 bundled legal datasets, 2 LLM providers, and the remote MCP bridge are documented in [CONNECTORS.md](CONNECTORS.md).

## Status

Lavern is at **v0.15.0**, the initial public open-source release. The codebase was developed privately for several months before this point and has been running in production-like environments throughout. The engine, Clawern daemon, and dashboard are stable. The remote MCP bridge for Anthropic Managed Agents is gated behind a feature flag and considered preview. The HTTP API is evolving. Expect non-breaking additions before a v1.0 freeze. Pin a tag if you depend on it.

Test coverage is 1,677 across 109 files. `npm run typecheck:all` is clean on both backend and frontend.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New agents, new MCP tools, and new workflow templates are all welcomed. The agent prompts are pure markdown, editable in any editor.

## Security

Found a vulnerability? See [SECURITY.md](SECURITY.md). Email `security@lavern.ai`. Please do not file public GitHub issues for security bugs.

## License

[Apache 2.0](LICENSE). Copyright 2025-2026 Antti Innanen.

See [NOTICE](NOTICE) for third-party attributions and dataset licenses.
