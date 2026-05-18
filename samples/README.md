# Sample documents

A few short, public-domain-style documents you can use to exercise Lavern end-to-end without supplying anything sensitive of your own.

| File | What it is | Try it with |
|---|---|---|
| `sample-terms-of-service.txt` | A typical SaaS Terms of Service. Auto-renewal, late-payment penalties, broad data licence, indemnification, 90-day data retention. Plenty for a contract review to find. | `lavern samples/sample-terms-of-service.txt --workflow review` |

These are fabricated documents for testing. They are not legal advice and the entities named in them are not real.

## Run it

```bash
# Full contract review (debate protocol, three-layer verification)
lavern samples/sample-terms-of-service.txt --workflow review

# Quick legal counsel question
lavern --request "What are the user's termination rights under standard SaaS terms?" --workflow counsel

# Force a specific workflow
lavern samples/sample-terms-of-service.txt --workflow legal-design --moment signup --audience consumer --jurisdiction EU
```

Requires `ANTHROPIC_API_KEY` (or `MISTRAL_API_KEY` if `LAVERN_PROVIDER=mistral`) in `.env`. Demo mode works for the UI without a key but cannot run real engagements.

## In the dashboard

1. Start the servers (`npm run serve:dev` plus `cd viz && npm run dev`).
2. Open <http://localhost:5173>.
3. From the landing page, click **Step In**.
4. On the briefing screen, upload `samples/sample-terms-of-service.txt` (or paste its contents).
5. Answer the intake questions. The team reviews the document live in the Working view.

## Adding your own samples

Drop any plain-text, Markdown, PDF, or DOCX into this folder. Lavern's parser (`src/documents/parser.ts`) handles all four. The cleaner the source text, the better the agents read it. PDFs with heavy scanning artefacts work but feed the agents noisier evidence.
