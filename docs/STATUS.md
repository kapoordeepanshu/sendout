# Where this is up to

Last updated: 9 September 2026.

## Working

Live at **https://sendout-dk.vercel.app**, running on **Gemini**. A real run screened three
CVs and produced sensible verdicts — Sofia Marchetti scored 68 / maybe, correctly identifying
strong fintech and Kubernetes experience against only one year of Go where the spec asks for
five. PDF, DOCX and TXT extraction all confirmed working in production.

The page opens on a worked example with no API call and no password, so a demo link shows real
output immediately.

## Environment variables on Vercel

All three must be scoped to **Production**, not only Development, and a change needs a
**redeploy** — Vercel does not apply env changes to an existing deployment.

| Variable | Value |
| --- | --- |
| `MODEL_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | from aistudio.google.com/apikey |
| `APP_PASSWORD` | the shared demo password |

`PORT` and `COMPANIES_HOUSE_API_KEY` are not used by the deployment and can be removed from it.

## Not built yet

No accounts, no usage metering, no persistence — a shortlist lives in the browser tab and
disappears on refresh. The shared password is fine for demo links but is not a user system.
**Add usage metering before charging anyone**, since every agency runs on one API key.

## Traps already hit — please don't reintroduce

- **`pdf-parse` cannot read valid PDFs.** It bundles pdf.js from 2018 and failed with "bad XRef
  entry". Replaced with `unpdf`. PDF is the format most CVs arrive in, and the failure was
  silent — CVs just vanished into the skipped list.
- **Vercel detected an Express server** and looked for a server entrypoint instead of a static
  site. `express` and `dotenv` must stay in devDependencies, the script is `serve` not `start`,
  and `"framework": null` is pinned in `vercel.json`.
- **`outputDirectory` only works when a build creates it.** `scripts/build.mjs` copies `public/`
  into `dist/`. Serving the repo root would also work but would publish `src/screening.ts`, and
  the prompts are the product.
- **`@anthropic-ai/sdk` belongs in `dependencies`.** It once slipped into devDependencies and
  would have broken the deployed functions at runtime.

## The next step is not code

The premise has never been tested with a real agency. Before building anything else, send 20
emails — the full method and copy are in [OUTREACH.md](OUTREACH.md).

The question: *"When one of your consultants formats a candidate's CV into your template before
it goes to a client, roughly how long does that take?"*

- **6+ of 10 say 20–40 minutes and sound irritated** → real, keep building.
- **2–3 of 10** → the pain exists but is not sharp enough to sell against.
- **"We just forward the CV"** → the premise is wrong. Good outcome for two weeks' work.

Ask everyone what they use today. At least a dozen vendors already sell CV formatting — Talent
Veil, FormaCV, RemakeCV, Saply, Allsorter, HireAra. If most name a tool they are happy with,
that is the most valuable thing you can learn, and it costs one question.

## One open technical question

Do the scores match your own judgement? Run the three CVs in `samples/`:

- **Marcus** should score high, with his 3-month notice flagged as a gap against the client's
  8-week window. That is the demo moment — a CV that ticks every box while hiding a dealbreaker.
- **Dan** should be a clear reject.

If those land, the prompt is good enough to show someone. If not, tune `src/screening.ts` — that
file is where output quality lives.
