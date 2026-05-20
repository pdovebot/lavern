# Quick Start

**60 seconds.** From clone to a multi-agent legal system running on your laptop.

> **Disclaimer.** Lavern is **not a law firm** and does **not provide legal advice**. The "agentic law firm" framing used in places throughout these docs is an analogy for the software's architecture, not a description of what Lavern is. Lavern is software that assists with document analysis and legal design. **You use it at your own risk.** Always have qualified legal counsel verify anything that matters before relying on it.

## Run it locally

You need Node.js 20+ and `npm`.

```bash
# 1. Clone
git clone https://github.com/AnttiHero/lavern.git
cd lavern

# 2. One-shot setup — installs deps, picks a provider, writes .env
npm run setup
```

`npm run setup` walks you through:

- Installing root + `viz/` (dashboard) dependencies
- Picking an inference provider (see below)
- Writing `.env` (mode 0600), backing up any existing one
- Creating `data/`, `audit-logs/`, `.shem/`
- Optionally launching the dev server at the end

When it finishes, the API server runs on `http://localhost:3000` and serves the dashboard from the same port.

### Pick a provider

The setup prompts you to choose one:

| Provider | What it is | Cost | Needs |
|---|---|---|---|
| **Anthropic Cloud** *(default, recommended)* | Claude via Anthropic API. Best capability. The agents, debate, and verification loop were tuned for Claude. | Paid per call | `sk-ant-...` key from [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| **Local (Ollama)** | On-device inference via `gemma3:4b` (or any model you pull). Nothing leaves the host. Quality drops noticeably vs Claude — use for offline tinkering and privacy demos, not serious matters. | $0 | Ollama installed; setup will offer to `brew install` (macOS) or `curl \| sh` (Linux). ~3 GB model pull. |
| **Mistral (EU Sovereign)** | EU-hosted inference for GDPR-bound matters. | Paid per call | Key from [console.mistral.ai](https://console.mistral.ai/api-keys) |

To change provider later: edit `.env` or re-run `npm run setup`.

## Hacking on the dashboard (hot reload)

If you're editing `viz/` and want Vite's hot reload, run two processes instead:

```bash
# Terminal 1 — API server on :3000
npm run serve:dev

# Terminal 2 — dashboard on :5173 with hot reload
cd viz && npm run dev
```

Open <http://localhost:5173>. You should see Lavern's landing page within a few seconds.

## ⚠️ Add your Anthropic key to actually process documents

Demo mode gets you the full UI — landing page, auth, Clawern dashboard, agent profiles, the works — but it cannot run real engagements without an API key.

1. Run `npm run setup` (or copy `.env.example` to `.env` manually — `setup` runs on first launch).
2. Choose your provider and set the matching key (`ANTHROPIC_API_KEY=sk-ant-...` or `MISTRAL_API_KEY=...`).
3. Restart Terminal 1 (`npm run serve:dev`).

EU teams: set `LAVERN_PROVIDER=mistral` and `MISTRAL_API_KEY=...` to route every LLM call — orchestrator, agents, debate, verification, briefing analyser, partner-mode chat, agent-builder personality, Clawern processing — through Mistral instead of Anthropic. The Anthropic-streaming paths (briefing interview, partner consult) fall back to a one-shot completion that the route then SSE-emits as a single chunk, so the UI stays identical; no document content reaches `api.anthropic.com` when Mistral is the configured provider.

## Verify the install

```bash
npx lavern doctor          # Health check: Node version, deps, ports, .env, API key
npx lavern --help          # Usage banner + option list
```

`doctor` runs a first-90-seconds preflight: Node version, native sqlite binding, dashboard deps, ports 3000 and 5173, `.env` state, and (informational) whether `ANTHROPIC_API_KEY` is set. If anything is red, fix it before starting the servers.

## First engagement (CLI)

A short, fabricated SaaS Terms of Service ships in `samples/`. With your `ANTHROPIC_API_KEY` set:

```bash
npx lavern samples/sample-terms-of-service.txt --workflow review
```

The team picks itself, opens a debate, runs three-layer verification, and lands at a gate before the final deliverable.

## First engagement (dashboard)

1. From the landing page, click **Step In**.
2. Upload `samples/sample-terms-of-service.txt` (or paste its contents). Bring your own contract if you prefer.
3. Answer the 3–5 intake questions in the Briefing chat.
4. Accept the suggested team and workflow, or customize.
5. Watch the **Working** view. Agents analyze, post findings, debate, and resolve disputes in real time.
6. When a gate fires, approve or reject the team's critical findings.
7. Read the **Delivery** view: the user-facing document, the structured findings, the scorecard, and the audit trail.

## Who are you? Where to start.

| You're a… | First move |
|---|---|
| **Contracts lawyer reviewing one document** | The dashboard. Run `npm run setup`, pick Local or Anthropic. Briefing → Quick Counsel is the fastest path. |
| **GC managing a portfolio of contracts** | Clawern. Point Lavern at a folder; it watches, reviews, and surfaces critical findings. See [Clawern (autonomous mode)](#clawern-autonomous-mode) below. |
| **Engineer integrating Lavern into your stack** | The API. `npm run serve:dev`, then hit `POST /api/sessions`. See the [API section in README](README.md#api). |
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

You can also run the API server and Claw together: `npm run dev -- --serve --claw`.

Heartbeat every 30 minutes · Telegram bot · email alerts · weekly digest · change detection on re-review · precedent board (institutional memory across documents) · hybrid local+frontier processing · multi-client isolation · audit trail · Prometheus metrics.

For maximum-confidentiality engagements, run `claw start --ethical` — Mistral EU only, all docs treated as confidential, conservative risk posture.

## What you're installing

Lavern is a multi-agent system, not a single tool. When it boots:

- A team of **67 agents** is staffed (you pick the team, or accept the default).
- A **soul** — voice, principles, style — shapes how the team communicates.
- A **debate protocol** is enforced; specialists challenge each other before findings ship.
- A **human gate** fires before critical decisions. The system raises concerns; you decide.
- An **audit bundle** ships with every engagement: the user-facing deliverable plus structured findings, debate resolutions, verification results, and a cost log.

Customize:
- **Personality** — edit [SOUL.md](SOUL.md) (CLI/Claw mode), or set it in My Page → Lavern's Soul (browser).
- **Default team** — select agents on the Team view; save as a preset.
- **New agents** — drop a markdown prompt in `src/agents/prompts/`, register the profile + definition. See [CONTRIBUTING.md](CONTRIBUTING.md).

## What's in the box

**67 agent prompts** · **21 MCP tools** · **9 workflows** · **5 legal datasets** (CUAD · MAUD · ACORD · UNFAIR-ToS · LEDGAR) · **3 inference providers** (Local Ollama · Anthropic · Mistral EU) · **1,677 tests** across 105 files.

Full reference: [README.md](README.md) · architecture deep-dive at [lavern.ai/architecture/](https://lavern.ai/architecture/).

## Stuck?

- **`npm install` fails on `better-sqlite3`** → you need a working C/C++ toolchain. macOS: `xcode-select --install`. Linux: `apt install build-essential`. Windows: WSL2 is easier than native.
- **Ollama daemon not reachable** → setup pings `http://localhost:11434`. Start it with `ollama serve` (or open Ollama.app on macOS), then re-run `npm run setup`.
- **Dashboard loads but shows "Connection lost"** → the API server didn't start, or stopped. Check the terminal where you ran `npm run dev -- --serve` (or `npm run serve:dev`). The dashboard talks to it over WebSocket.
- **An engagement won't start with no provider configured** → Lavern boots in demo mode (UI works, processing doesn't) until `.env` is filled in. Re-run `npm run setup` or set `LAVERN_PROVIDER` plus the matching key (`ANTHROPIC_API_KEY` or `MISTRAL_API_KEY`) directly in `.env`.
- **Agents are slow, or seem to stall** → Lavern auto-retries cloud API calls on transient 429/500s with exponential backoff (1s → 2s → 4s). Watch the terminal logs for retry events. Sustained retries mean your API key is rate-limited. On Local, slow generation usually means the model is CPU-only — check Ollama is using your GPU.
- **I want to try without installing** → there is no hosted demo right now. Watch the video at [lavern.ai](https://lavern.ai); the install above is 60 seconds.

---

Found a bug? [Open an issue.](https://github.com/AnttiHero/lavern/issues)
Want to contribute? See [CONTRIBUTING.md](CONTRIBUTING.md).
Security concern? See [SECURITY.md](SECURITY.md).
