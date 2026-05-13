# Contributing to Lavern

Thanks for your interest in contributing. This guide is short on style and long on the one thing that matters: the design principle that defines how Lavern's agents have to behave. Read that part even if you skip the rest.

## Getting started

```bash
git clone https://github.com/AnttiHero/lavern.git
cd lavern
npm install
(cd viz && npm install)
```

Then run two processes — the API server and the dashboard:

```bash
# Terminal 1 — API server on :3000 (demo mode, no API key required)
npm run serve:dev

# Terminal 2 — dashboard on :5173 (Vite, hot reload)
cd viz && npm run dev
```

The dashboard opens at <http://localhost:5173>. Demo mode works without an API key — see [QUICKSTART.md](QUICKSTART.md) for the full first-engagement walkthrough.

## Design principle: every agent must be challengeable

In Lavern, no agent ships an answer alone. Findings are posted to a debate board. Other agents on the panel can challenge. A formal protocol resolves disagreements. The user sees the disagreement — and the resolution — in the audit trail.

This is not a quirk of the implementation. It's the architecture. Most AI legal tools optimize for a confident-sounding single answer. Lavern optimizes for a *defensible* answer, which means showing the work, including the disagreements.

If you're adding a new agent, a new MCP tool, or a new workflow template, this principle reshapes what "done" means:

- **Findings must cite.** Every finding includes `evidence` — specific text from the parsed document. The `grounding-verifier` MCP tool mechanically cross-references citations against the parsed document; findings that fail grounding do not ship. If your agent posts a finding without evidence, the verifier will catch it; if it cites text that isn't in the document, the verifier will catch it too. Don't try to outsmart the verifier — fix the agent.
- **Findings must be challengeable.** Write agents that post findings and survive challenge. Don't write agents that "produce a recommendation." If your agent's output can't meaningfully be challenged by another specialist on the same panel, you've designed a monologue, not a finding.
- **Agents must be able to decline.** The `decline_to_find` tool exists because silence is a valid answer. If the document is silent on the thing your agent is supposed to find, declining is correct. Inventing is malpractice.
- **Humans gate the critical calls.** If your agent's output affects a Non-Negotiable Preservation Category (monetary amounts, time periods, jurisdiction, dispute resolution, defined terms, insurance, regulatory language — see [CLAUDE.md](CLAUDE.md)), the call must surface a human gate. The system raises the concern; the human decides.

**Rule of thumb: if a finding can't survive being asked "where in the document does it say that?", it should not have shipped.** Every other rule in this file is downstream of that one.

A few concrete things that follow:

- Don't write a "summarize" agent that drops citations. Pass-through summarization that strips evidence pointers is a bug, not a feature.
- Don't write a workflow template that bypasses the debate board for "obvious" findings. Challenge counts even when the answer seems clear; that's where the audit trail comes from.
- Don't relax confidence thresholds to "improve hit rate." Low confidence is the system asking for human review. Bypassing it is a permissions escalation.
- If a quality-gate test passes only because a downstream verifier caught a problem the agent itself should have avoided, fix the agent. The verifier stays (belt and suspenders), but the agent now carries the knowledge it needs on its own.

## Development workflow

1. Create a branch from `main`. Conventional names work: `feat/new-agent-x`, `fix/grounding-edge-case`, `docs/quickstart-polish`.
2. Make your changes.
3. Run checks: `npm run typecheck:all && npm test`. Both must be clean.
4. Commit with conventional-commit style: `feat(agents): add finland-employment specialist`, `fix(claw): handle SIGINT during heartbeat`, `docs(readme): refresh dataset counts`.
5. Open a pull request against `main`. Describe what changed, why, and what you tested.

## Code standards

- **TypeScript** for all backend (`src/`) and frontend (`viz/`) code.
- **Zero TSC errors** required — `npm run typecheck:all` must be clean.
- **All tests must pass** before merging — `npm test` runs the full 1,695-test suite in a few seconds.
- **Inline styles** in React components (project convention; we don't use CSS modules or styled-components).
- **No em dashes in dashboard UI microcopy** (button labels, toasts, form hints — prose and docs are fine).
- **Imports first, types second, code third** within a file. No reordering across that boundary.
- **Sentry breadcrumbs on silent-failure paths.** If your code can fail in a way that mutates billing, archives, or persistent state without throwing, add `Sentry.captureException` with tag context.

## Adding a new agent

1. **Prompt** — create `src/agents/prompts/your-agent.ts`. Markdown, structured as a system prompt. State the agent's scope, the evidence it must cite, and the conditions under which it declines.
2. **Profile** — add an entry in `src/agents/profiles.ts`: skill ratings, personality, cost tier, DiceBear avatar seed.
3. **Definition** — add an entry in `src/agents/definitions.ts`: prompt reference, allowed tools, model choice (Opus 4.7 for primary work, Sonnet 4.5 for lighter passes), max turns.
4. **Workflow** — add the agent to the `requiredAgents` array of at least one template in `src/workflows/templates/`.
5. **Tests** — at minimum: the agent's output, on a fixture, contains valid evidence pointers; the agent declines when given a fixture that's silent on its concern.

## Adding a new MCP tool

Follow the factory pattern in `src/mcp/tools/verification-engine.ts`:

- Tool factory takes `SessionState` as closure (debate state, event bus, audit log).
- Emit events via `session.events.emitEvent()` so the dashboard and audit trail stay in sync.
- Return `{ content: [{ type: 'text', text: '...' }] }` — the Anthropic MCP shape.
- Add to phase-based permissions in `src/permissions/` so the tool is only available where it should be.
- Add to the remote-bridge allowlist (`src/mcp/remote-bridge/`) if it should be reachable from Managed Agents.

## Non-negotiable rules

These apply to every contribution. No exceptions, no overrides, no flag-toggle workarounds.

- **Human gates cannot be skipped or auto-approved.**
- **Confidence thresholds cannot be relaxed.**
- **Preservation categories are absolute** (monetary amounts, time periods, jurisdiction, defined terms, insurance, regulatory language).
- **Every finding must include evidence.**
- **The `decline_to_find` tool must remain available** to every agent.
- **Live document always outranks stored precedent.** A precedent never overrides a clause in the document being reviewed.

## Running tests

```bash
npm test                    # All 1,695 tests
npm run test:watch          # Watch mode
npm run test:integration    # Integration tests only (9 files)
```

If you're touching the dashboard, also run:

```bash
cd viz && npm run build     # Frontend build must pass
```

## Pre-commit secret scanning

Before committing, run:

```bash
npm run protect
```

This scans your staged changes for secrets. Requires gitleaks installed locally (`brew install gitleaks` on macOS, or grab the latest release from [gitleaks/gitleaks](https://github.com/gitleaks/gitleaks/releases)). CI re-runs the scan on every PR — the local hook is fast-feedback convenience, not the security boundary.

Optional auto-run via husky:

```bash
npm install --save-dev husky
npx husky init
echo "npm run protect" > .husky/pre-commit
```

The allowlist for known-benign test-fixture matches lives in [`.gitleaks.toml`](.gitleaks.toml) at repo root. If a new false positive surfaces, add a tight path or regex entry there rather than disabling the rule globally.

## Licensing of contributions

Lavern is distributed under the [Apache License, Version 2.0](LICENSE). When you submit a contribution — code, docs, agent prompts, anything in this repo — you agree that it will be licensed under those same terms. This follows from Apache 2.0 §5 ("Submission of Contributions"), which states that any contribution intentionally submitted for inclusion is licensed under the Apache License unless you explicitly say otherwise. By opening a pull request, you confirm that you have the right to make the contribution and to license it this way.

If your contribution includes patented techniques you hold, the Apache 2.0 license grants users a license to those patents for use within the work — but only to the extent of your contribution. The patent-retaliation clause (§3) protects everyone: anyone who initiates patent litigation against the project loses their patent license.

We don't require a separate CLA. The license itself is the agreement.

## Questions

Open an issue at [github.com/AnttiHero/lavern/issues](https://github.com/AnttiHero/lavern/issues). We're happy to help — and "is this the right shape for a Lavern agent?" is a perfectly good first question.
