# Lavern

**A multi-agent legal system. Apache 2.0.**

A team of 67 agent prompts (specialists plus orchestrators) coordinating through a debate protocol. The system reads documents, posts findings with cited evidence, runs three layers of verification, and pauses at a human gate before critical decisions land. Runs against Anthropic, Mistral (EU), or fully local via Ollama.

Built by a law firm founder over six months because the prevailing "AI as a junior associate" framing felt like the wrong analogy to start from. Whether this is the right one is what we're publishing to find out.

[**Watch the demo →**](https://lavern.ai/demo/) · [**lavern.ai**](https://lavern.ai) · [**Architecture deep-dive →**](https://lavern.ai/architecture/) · [**Quick Start →**](QUICKSTART.md)

> **Disclaimer.** Lavern is **not a law firm** and does **not provide legal advice**. The "agentic law firm" framing in some of the docs is an analogy for the software's architecture — it's not a claim about what Lavern is. **You use it at your own risk.** Have qualified counsel verify anything that matters before relying on it.

> **What is and isn't stress-tested.** The architecture is real and the code is open. The pipeline runs, the agents debate, the verification loops fire, the precedent board persists, the tests pass. What hasn't been independently validated is the *quality bar* — whether all this machinery produces materially better outputs than a well-prompted single LLM on a representative sample of real legal work. We have internal evaluation; we don't have a public benchmark. Treat the engineering as the contribution and the legal-quality claims as a hypothesis.

## Install

```bash
curl -fsSL lavern.ai/install.sh | sh
```

Clones the repo, installs backend and frontend dependencies, and gives you a `lavern` command. The 60-second walkthrough is in [QUICKSTART.md](QUICKSTART.md).

By hand:

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

Demo mode runs the dashboard, the Clawern view, and the cinematic guided tour without an API key. To run real engagements, add `ANTHROPIC_API_KEY` (or `MISTRAL_API_KEY` for the EU provider) to `.env`. It's auto-created from `.env.example` on first run.

## What's in the box

- **67 agent prompts** (59 specialists, 7 orchestrators, 1 base)
- **21 MCP tools** for debate, scoring, verification, grounding, memory, knowledge base, quality checks
- **9 workflows** from a single-specialist counsel call to a full adversarial review
- **6 seeded legal datasets**: CUAD, MAUD, ACORD, UNFAIR-ToS, ContractNLI, LEDGAR (each under its own license; see NOTICE)
- **3 inference providers**: Anthropic Claude (US), Mistral AI (EU), or local via Ollama
- **1,677 tests** across 105 files. Clean `tsc --noEmit` on backend and frontend.

## Three modes

**Interactive.** Open the dashboard, brief the system in plain language, watch the agents work in a live activity feed, approve critical calls at human gates. Each engagement produces the deliverable plus an audit bundle: structured findings, debate resolutions, verification results, and a cost log.

**Clawern (autonomous).** Point it at a folder. Clawern processes new documents on a 30-minute heartbeat, accumulates a precedent board across past reviews, and pushes findings to Telegram, email, or macOS notifications. Includes weekly digest, multi-client isolation, audit trail, cost forecasting, hybrid local-plus-frontier processing.

**EU mode.** Set `LAVERN_PROVIDER=mistral` and the orchestrator, agents, debate, verification, briefing analyser, and Clawern processing all route through Mistral AI in Paris instead of Anthropic. A few non-essential streaming paths still touch Anthropic at the moment; closing them is tracked in the repo as issue #7. Use `claw start --ethical` to enforce Mistral-only with conservative risk posture.

## What "67 agents" actually means

Each agent is a specialised system prompt with its own role, MCP tool permissions, and slot in the debate protocol. All 67 run on the same underlying frontier LLM (Claude or Mistral, your choice), so yes — at the bottom of the stack, it's an LLM. 

The work isn't the prompts. The work is the four things wrapped around them:

- **The debate protocol.** Agents must cite specific text from the parsed document. Findings without citations don't enter the board. Agents can challenge each other; the challenger has to cite text too.
- **Three-layer verification.** Evaluator gate (drops weak findings) → adversarial debate (red team / blue team) → 10-pass verification pipeline (mechanical cross-checks: clause grounding, defined-term integrity, monetary preservation, jurisdiction integrity, etc.). Each layer fails closed independently.
- **Human gates.** Critical findings don't auto-deliver. The orchestrator surfaces the call and waits for a human to approve or override.
- **Precedent Board.** Persistent memory across engagements. Findings that recur across documents get reinforced; stale ones decay. A new pattern enters as "tentative" and gets promoted to "confirmed" once it recurs enough times with consistent verdicts.

Whether all of that actually adds up to materially better outputs than a single well-prompted LLM is an open empirical question. We have structures in place to test it; we don't claim to have settled it.

## How Lavern relates to Claude for Legal

Anthropic recently released [`claude-for-legal`](https://github.com/anthropics/claude-for-legal), a suite of practice-area plugins that ship inside Claude Cowork and Claude Code. If you want drop-in AI skills inside the tools you already use, start there.

Lavern is a different shape of thing. Not a plugin pack — a multi-agent system that borrows the structure of a law firm as its architectural analogy. End-to-end engagements with a team of agents, a debate protocol, a human gate before critical decisions, and an audit trail of how the output was reached. You don't invoke a skill; you brief a team.

The split, as honestly as we can put it:

- **Use Claude for Legal** if you want task-specific AI skills inside an existing workflow.
- **Use Lavern** if you want to experiment with an autonomous multi-agent legal system end-to-end, with a continuous-practice mode (Clawern) that watches folders and an EU-sovereign mode. Still software; still your responsibility to verify outputs.

They're compatible. Lavern runs on Claude (or Mistral) — the same models Claude for Legal runs on. A future release will let Lavern's orchestrator dispatch to `claude-for-legal` plugins as installable specialists.

## LOCAL MODE (the default in v0.15.0)

Out of the box Lavern runs single-user on your machine. No login, no signup, no cookies. Every request is the synthetic `local-user`. Account routes, Google OAuth, email verification, password reset, Stripe billing, and the referral system are all gated behind `LAVERN_AUTH_ENABLED=true` and don't register at startup.

Flip the flag if you want to host Lavern for a team. The database schema is unchanged; the v0.14 cookie-based multi-user flow comes back online with no migration.

## Dashboard

React SPA, editorial design language (Newsreader serif, Geist sans, cream paper). WCAG AA accessible, responsive across desktop, tablet, and phone.

**Flow:** Landing → Briefing → Strategy → Team → Working → Delivery.

The Working view shows agents posting findings, debating, and resolving disputes in real time. The Delivery view includes confidence scores, grounding indicators, and the audit trail.

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

Includes a 30-minute heartbeat, Telegram bot, email alerts, weekly digest, scheduled re-review, change detection, cost forecasting, portfolio intelligence, hybrid local-plus-frontier processing, multi-client isolation, audit trail, and Prometheus metrics. `claw start --ethical` runs in Mistral EU only with a conservative risk posture.

## Development

```bash
npm test                  # 1,677 tests across 105 files
npm run typecheck:all     # TypeScript check (backend plus frontend)
npm run build             # Build backend
cd viz && npm run build   # Build dashboard
```

## Project structure

```
src/
├── agents/             67 agent prompts plus profiles plus definitions
├── api/                Fastify API server, WebSocket, middleware
├── assembly/           Document assembly, format conversion
├── claw/               Clawern: 28 modules (watch, plan, process, deliver,
│                       precedents, audit, backup, telegram, multi-client,
│                       hybrid analysis, anonymization)
├── db/                 SQLite persistence
├── documents/          Parser (PDF, DOCX, MD, TXT) plus sanitization
├── mcp/tools/          21 MCP tools
├── mcp/remote-bridge/  JSON-RPC bridge exposing Counsel tools to Anthropic
│                       Managed Agents (gated by env flag)
├── providers/          LLM provider abstraction (Claude, Mistral, local)
├── workflows/          9 templates plus executor
├── config.ts           Centralised config (env-var backed)
└── index.ts            Entry point

viz/                    React dashboard
site/                   Marketing site (static, Netlify)
menubar/                macOS menu bar app (SwiftUI)
tests/                  1,677 tests across 105 files
```

Full architectural detail in [CLAUDE.md](CLAUDE.md) — the same context Claude Code reads when working on this repo.

## Connectors

The 21 MCP tools, 6 bundled legal datasets, 2 LLM providers, and the remote MCP bridge are documented in [CONNECTORS.md](CONNECTORS.md).

## Status and known limitations

Lavern is at **v0.15.0**, the initial public open-source release. The engine, Clawern daemon, and dashboard are stable enough to run end-to-end against real documents; the test suite passes; `tsc --noEmit` is clean on both backend and frontend.

Known limitations we're not hiding:

- **No public benchmark.** Internal evaluation only. The quality-of-output claim is a hypothesis; we'd welcome help building a defensible benchmark.
- **Multi-agent debate is imperfect.** Agents sometimes don't listen to each other. Sometimes one dominates. Sometimes they swing to the opposite extreme when challenged — not because the challenge was stronger, only newer. We've built structure around the problem (evidence requirements, confidence thresholds, adversarial roles, escalation protocols), not solved it.
- **67 agents is probably more than needed.** Started with about a dozen, kept finding gaps. If you fork it and find that 20 of them do 90% of the work, please tell us which 20.
- **EU mode has a known gap.** Three streaming paths still touch Anthropic; tracked as issue #7.
- **Remote MCP bridge is preview.** Gated behind a feature flag.
- **The HTTP API is evolving.** Expect non-breaking additions before a v1.0 freeze; pin a tag if you depend on it.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New agents, new MCP tools, new workflow templates are all welcomed. The agent prompts are pure markdown, editable in any editor.

## Security

Found a vulnerability? See [SECURITY.md](SECURITY.md). Email `security@lavern.ai`. Please don't file public GitHub issues for security bugs.

## License

[Apache 2.0](LICENSE). Copyright 2025–2026 Antti Innanen.

See [NOTICE](NOTICE) for third-party attributions and dataset licenses.
