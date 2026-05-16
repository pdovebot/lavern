# Quick Start

**60 seconds.** From clone to a law firm running on your laptop.

> **Disclaimer:** Lavern assists with document analysis and legal design. It does not provide legal advice. Always verify outputs with qualified legal professionals.

## Run it locally

You need Node.js 22+ and `npm`.

```bash
# 1. Clone
git clone https://github.com/AnttiHero/lavern.git
cd lavern

# 2. Install (backend + dashboard)
npm install
(cd viz && npm install)
```

Then run two processes:

```bash
# Terminal 1 — API server on :3000 (demo mode, no API key required)
npm run serve:dev

# Terminal 2 — dashboard on :5173 (Vite, hot reload)
cd viz && npm run dev
```

Open <http://localhost:5173>. You should see Lavern's landing page within a few seconds.

## ⚠️ Add your Anthropic key to actually process documents

Demo mode gets you the full UI — landing page, auth, Clawern dashboard, agent profiles, the works — but it cannot run real engagements without an API key.

1. Copy `.env.example` to `.env` (this happens automatically on first run).
2. Open `.env` and set `ANTHROPIC_API_KEY=sk-ant-...`.
3. Restart Terminal 1 (`npm run serve:dev`).

EU teams: set `LAVERN_PROVIDER=mistral` and `MISTRAL_API_KEY=...` to route every LLM call — orchestrator, agents, debate, verification, briefing analyser, partner-mode chat, agent-builder personality, Clawern processing — through Mistral instead of Anthropic. The Anthropic-streaming paths (briefing interview, partner consult) fall back to a one-shot completion that the route then SSE-emits as a single chunk, so the UI stays identical; no document content reaches `api.anthropic.com` when Mistral is the configured provider.

## First engagement

1. From the landing page, click **Start an engagement**.
2. Upload a contract (your own — or any sample contract you have lying around).
3. Answer the 3–5 intake questions in the Briefing chat.
4. Accept the suggested team and workflow, or customize.
5. Watch the **Working** view — agents analyze, post findings, debate, and resolve disputes in real time.
6. When a gate fires, approve or reject the team's critical findings.
7. Read the **Delivery** view: the user-facing document, the legal review package, the scorecard, the full audit trail.

## Who are you? Where to start.

| You're a… | First move |
|---|---|
| **Contracts lawyer reviewing one document** | The dashboard. Run the steps above. Briefing → Quick Counsel is the fastest path. |
| **GC managing a portfolio of contracts** | Clawern. Point Lavern at a folder; it watches, reviews, and surfaces critical findings to your phone. See [Clawern (autonomous mode)](#clawern-autonomous-mode) below. |
| **Engineer integrating Lavern into your stack** | The API. `npm run dev -- --serve`, then hit `POST /api/sessions`. See the [API section in README](README.md#api). |
| **Researcher / academic / OSS contributor** | The agents themselves. Open `src/agents/prompts/` — 67 markdown prompts, every one editable. Fork a workflow in `src/workflows/templates/`. No build step on the prompts. |
| **Lawyer-Twitter / curious onlooker** | Watch the demo at [lavern.ai](https://lavern.ai), then come back here when you have 60 seconds. |

## Clawern (autonomous mode)

Drop documents in a folder. Lavern reviews them overnight. Critical findings hit your phone.

```bash
npm run dev -- claw init       # 5-minute interactive setup
npm run dev -- claw validate   # Check configuration
npm run dev -- claw start      # Start watching
npm run dev -- claw pause      # Pause processing
npm run dev -- claw resume     # Resume processing
```

Heartbeat every 30 minutes · Telegram bot · email alerts · weekly digest · change detection on re-review · precedent board (institutional memory across documents) · hybrid local+frontier processing · multi-client isolation · audit trail · Prometheus metrics.

For maximum-confidentiality engagements, run `claw start --ethical` — Mistral EU only, all docs treated as confidential, conservative risk posture.

## What you're installing

Lavern is a firm, not a tool. When it boots:

- A team of **67 agents** is staffed (you pick the team, or accept the default).
- A **soul** — voice, principles, style — shapes how the team communicates.
- A **debate protocol** is enforced; specialists challenge each other before findings ship.
- A **human gate** fires before critical decisions. The system raises concerns; you decide.
- A **dual artifact** is produced for every engagement: user-facing deliverable + legal review package with the full chain of reasoning.

Customize:
- **Personality** — edit [SOUL.md](SOUL.md) (CLI/Claw mode), or set it in My Page → Lavern's Soul (browser).
- **Default team** — select agents on the Team view; save as a preset.
- **New agents** — drop a markdown prompt in `src/agents/prompts/`, register the profile + definition. See [CONTRIBUTING.md](CONTRIBUTING.md).

## What's in the box

**67 agents** · **21 MCP tools** · **9 workflows** · **5 legal datasets** (CUAD · MAUD · ACORD · UNFAIR-ToS · LEDGAR) · **2 LLM providers** (Claude · Mistral EU) · **1,695 tests** across 108 files.

Full reference: [README.md](README.md) · architecture deep-dive at [lavern.ai/architecture/](https://lavern.ai/architecture/).

## Stuck?

- **`npm install` fails on `better-sqlite3`** → you need a working C/C++ toolchain. macOS: `xcode-select --install`. Linux: `apt install build-essential`. Windows: WSL2 is easier than native.
- **Dashboard loads but shows "Connection lost"** → the API server didn't start, or stopped. Check the terminal where you ran `npm run dev -- --serve`. The dashboard talks to it over WebSocket.
- **An engagement won't start** → most often this means `ANTHROPIC_API_KEY` isn't set. Demo mode shows the UI; real processing needs the key (or `MISTRAL_API_KEY` if you're on the EU provider).
- **402 Payment Required when creating a session** → only fires when `LAVERN_AUTH_ENABLED=true`. In that mode Lavern enforces a per-session budget hold against your account's billable-hours balance. New accounts get 10 free trial hours (~2 quick engagements). To top up: My Page → Billing. In default LOCAL MODE there is no balance and no 402.
- **Agents are slow, or seem to stall** → Lavern auto-retries Claude API calls on transient 429/500s with exponential backoff (1s → 2s → 4s). Watch the terminal logs for retry events. Sustained retries mean your API key is rate-limited.
- **I want to try without installing** → there is no hosted demo right now. Watch the video at [lavern.ai](https://lavern.ai); the install above is 60 seconds.

---

Found a bug? [Open an issue.](https://github.com/AnttiHero/lavern/issues)
Want to contribute? See [CONTRIBUTING.md](CONTRIBUTING.md).
Security concern? See [SECURITY.md](SECURITY.md).
