# Launch posts — Wednesday 2026-05-20

Three pre-drafted posts: Hacker News (Show HN), X / Twitter thread, LinkedIn. Each calibrated to its audience.

**Before you post, do these in order:**

1. Drag `site/` to the production lavern.ai Netlify site. Wait for deploy.
2. Verify the OG card resolves: https://www.opengraph.xyz/?url=https%3A%2F%2Flavern.ai
3. Upload `site/img/og.png` as the GitHub repo Social Preview (Settings → General → Social preview).
4. Visit https://lavern.ai and click "Demo" — make sure the cinematic tour actually plays end-to-end.
5. `curl -fsSL lavern.ai/install.sh | sh -s -- /tmp/lavern-smoke` — confirm the install script clones and `npm install`s clean. Then `rm -rf /tmp/lavern-smoke`.
6. Confirm the latest commit on `main` shows green CI on github.com/AnttiHero/lavern.

Then ship.

---

## 1. Hacker News (Show HN)

**Title (80 chars):**

```
Show HN: Lavern – an agentic law firm, open source
```

(Alternative if the first feels too brand-y: `Show HN: Lavern – 67 AI agents that debate contracts before you sign them`)

**URL field:** `https://lavern.ai`

**Body** — paste this as the first comment immediately after the post lands (HN convention; explains why this exists in your own words):

```
Hi HN — I've been building Lavern in the open for the last eight months. The pitch in one
line: instead of asking a single LLM to review a contract, brief a multi-agent firm that
debates the document with evidence, gates the critical calls behind a human, and produces
an auditable artifact at the end.

What's in the box (Apache 2.0, github.com/AnttiHero/lavern):

· 67 agents — 59 domain specialists, 7 orchestrators, 1 base prompt. Each is a system
  prompt with its own MCP tool permissions and a defined slot in the debate protocol.
  Anyone can prompt Claude. The work isn't the prompts; it's the four loops around them.
· The debate protocol — every finding cites text from the parsed document. Findings
  without evidence don't enter the board. Other agents can challenge in turn; challenges
  also have to cite.
· Three-layer verification — evaluator gate (drops weak findings), adversarial debate
  (red-team / blue-team), 10-pass mechanical verification (clause grounding, defined-term
  integrity, monetary preservation, jurisdiction integrity, …). Each fails closed.
· Human gates — critical findings pause and wait for human approval. Auto-approve is a
  flag, not a default.
· Clawern — autonomous mode. Point it at a folder; it reviews on a schedule, files
  deliveries next to originals, and pings your phone when something matters.
· Two providers — Claude (frontier) or Mistral (EU sovereign, with all state on-disk).

What it isn't:

· Not legal advice. Disclaimer is on every output. Verify with a qualified lawyer.
· Not a Claude plugin pack. `claude-for-legal` is plugins; Lavern is a firm — agents
  that debate each other, gates that pause for you, dual artifacts that ship.
· Not autonomous in the "no human" sense. The gates are the architecture.

I'd love feedback on:

· The protocol (does evidence-backed debate actually produce better output than a single
  long prompt? My eval arc on 10 CUAD contracts said yes; eyeballs from people who've
  actually reviewed contracts at scale would mean more)
· The architecture (`lavern.ai/architecture/` has the deep-dive — Watchman → Reader →
  Curator + the precedent board lifecycle. Read it and roast it.)
· The local-first claim (one `npm install` away from a working firm on your laptop, no
  API key needed for the demo)

Happy to answer anything. Builds, tests, prompts, the eval data, why I went serif on
the marketing site — all fair game.
```

---

## 2. X / Twitter thread

Eight posts. Don't space them more than 90 seconds apart or the algorithm sees a stale thread. Pin to your profile.

**Tweet 1 / 8** (the post — include image: `site/img/og.png`):

```
Lavern is now open source.

An agentic law firm. 67 specialist AI agents that review documents
through evidence-backed debate, with mandatory human gates and a
10-pass verification loop.

Apache 2.0. Runs on your Mac Mini.

🧵 ↓
```

**Tweet 2 / 8:**

```
The thing I've been quietly working on for eight months.

The pitch in one line: instead of asking one LLM to review a contract,
brief a multi-agent firm that debates the document with evidence,
gates the critical calls behind a human, and produces an artifact
you could defend in a deposition.
```

**Tweet 3 / 8** (image: a screenshot of the working view with debate happening):

```
The protocol matters more than the model.

Every finding has to cite specific text from the document.
Other agents can challenge in turn — challenges also have to cite.
Findings without evidence don't enter the board.

Anyone can prompt Claude. The work is the loops around it.
```

**Tweet 4 / 8** (image: architecture page or precedent board screenshot):

```
Three verification layers, each fails closed:

1. Evaluator gate — drops findings the agent can't defend
2. Adversarial debate — a red-team agent attacks; a blue-team
   agent defends; a synthesizer resolves
3. 10-pass mechanical verification — clause grounding, monetary
   preservation, jurisdiction integrity, defined-term integrity, …
```

**Tweet 5 / 8** (image: gate dialog UI):

```
Human gates are mandatory. Not "auto-approve unless you reject" —
the workflow literally pauses, surfaces the decision, and waits
for a real human to weigh in.

Auto-approve exists as a CLI flag. It is not a default.

The autonomy isn't the point. The auditable artifact is.
```

**Tweet 6 / 8** (image: Clawern dashboard or Mac Mini hero):

```
Clawern — autonomous mode.

Point Lavern at a folder. It watches, reviews on a schedule,
files deliveries next to the originals, and pings your phone
when something actually matters.

A law firm in your Mac Mini. Telegram, email, macOS notifications.
EU-sovereign mode via Mistral, all state on-disk.
```

**Tweet 7 / 8:**

```
One thing I want to be honest about:

Lavern is built on frontier LLMs (Claude or Mistral). At the bottom
of the stack, it's a model anyone can call.

The breakthrough isn't model choice. It's debate, verification loops,
gates, and a precedent board that compounds across engagements.

The product is the protocol.
```

**Tweet 8 / 8** (image: install command on cream paper, or the GitHub repo):

```
Try it:

  curl -fsSL lavern.ai/install.sh | sh

→ lavern.ai
→ github.com/AnttiHero/lavern (Apache 2.0)
→ Demo runs in your browser, no API key needed.

I'd love thoughts — DMs open. Build something with it.
```

---

## 3. LinkedIn

Different audience: GCs, in-house counsel, BigLaw partners. Lean editorial, less protocol nerdery, more "what does this do for the work."

```
After eight months of quiet building, Lavern is open source today.

It's a law firm staffed with AI agents. Sixty-seven of them. They
review documents, debate the findings with each other, surface the
critical calls to a human, and deliver an auditable artifact at the
end. The protocol — evidence required, debate before delivery,
gates on the decisions that matter — was the part that took the
eight months. Anyone can prompt a frontier model. The work is what
you put around it.

It runs in two shapes:

· Interactively, in a browser. You brief it; it works. You watch the
  agents debate in real time, approve the critical findings, receive
  a user-facing deliverable plus a complete legal review package.
· Autonomously. Point it at a folder of contracts. Lavern reviews
  them overnight and pings you when something genuinely matters.
  Mostly: silence. That's the design. Lawyers don't need more noise.

What it is not:

· Not legal advice. The disclaimer is on every output. Verify with
  qualified counsel.
· Not a replacement for a lawyer. The mandatory human gates are the
  architecture, not a footnote. The autonomy isn't the value. The
  audit trail is.

What it gives you:

· Defensible analysis. Every finding cites the clause it came from.
  Disputes between agents are recorded and resolved with reasoning.
· Institutional memory. The Precedent Board reinforces what recurs
  and decays what doesn't. The thirtieth review is sharper than the
  first.
· EU sovereignty (if you need it). A one-flag switch routes the
  core engagement workflow through Mistral; all state stays on-disk.
  Three auxiliary routes are still Anthropic in v0.15.0; disclosed
  in QUICKSTART and tracked for the next release.

Free, Apache 2.0, https://lavern.ai. Architecture deep-dive on the
same domain.

I'd love feedback from people who actually do this work at scale.

#LegalTech #LegalAI #OpenSource #ContractReview
```

---

## After-launch — first 24 hours

- Monitor the HN thread; reply substantively to top comments, especially the technical ones. Don't argue; engage.
- Watch the install script logs (Plausible: `/install.sh` page view as a custom event already wired? If not, just `grep install.sh` on Netlify access logs).
- Watch the demo's drop-off — if 80%+ are bailing on slide 1, the cinematic intro isn't doing its job.
- Note any Issue or Discussion that lands; respond within an hour during waking hours of launch day.
- Don't ship code on launch day unless something is broken. Resist the urge to "polish in real time" — the polish was last week.

Good luck.
