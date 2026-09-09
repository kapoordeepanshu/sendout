# Sendout

Spec in, shortlist out. Paste a client's job spec, drop in a pile of CVs, get back a ranked
shortlist with evidence — then one click to a client-ready submission pack in the agency's
own template, anonymised if they want it.

Built for small UK recruitment agencies. The pain it removes is the 20–40 minutes per CV
that goes into formatting and writing up a candidate before submission, and the placements
lost to whoever submitted first.

## Run it

```bash
npm install
cp .env.example .env      # then add your Anthropic key
npm run dev
```

Open http://localhost:3000.

## What it does

**Screening** (`src/claude.ts` → `screenCandidate`) — one Claude call per CV, returning a
strict schema: match score out of 100, submit/maybe/reject, evidenced strengths with verbatim
quotes from the CV, gaps with severity, a requirement-by-requirement table taken from the
spec, and the screening questions the recruiter should actually ask on the call.

The prompt is deliberately strict about two things: it never infers anything the CV does not
say, and it is told that a shortlist recommending everyone is worthless. Both exist because
generic CV scoring tools fail on exactly those points.

**Submission packs** (`buildSubmissionPack`) — turns an assessment plus the raw CV into a
client-facing profile: summary, a requirements table, relevant experience, honest gaps, and
availability. **Anonymisation is on by default** — it strips the name, contact details and
employer names so the client cannot go around the agency and approach the candidate directly.
That is a real agency need, not a privacy nicety.

The job spec is cached across every CV in a batch (`cache_control`), so a 30-CV run pays for
the spec once.

## Cost

Screening uses `claude-opus-5` at high effort, because match quality *is* the product. If
per-CV cost becomes the binding constraint, `claude-sonnet-5` is the step down — but measure
it against a set of CVs you have already judged by hand before switching. Change `MODEL` in
`src/claude.ts`.

## Deploy to Vercel

Push to a private GitHub repo, then import it at vercel.com/new. Vercel redeploys
on every push, and preview URLs per branch are free. Or from the CLI:

```bash
npm i -g vercel
vercel                                    # first deploy, links the project
vercel env add ANTHROPIC_API_KEY          # your key, all environments
vercel env add APP_PASSWORD               # a password you give to demo users
vercel --prod
```

**Both variables are required in production.** Without `APP_PASSWORD` the deployed
app refuses every request with a 503 rather than serving openly — a public URL with
no gate spends your Anthropic key for anyone who finds it.

`vercel dev` runs the same thing locally against the real serverless routes.

Two things about the architecture exist specifically because of serverless, and
matter if you change them:

- **One CV per request.** Functions have a hard wall-clock limit, so the browser
  fans out (4 at a time) instead of asking the server to loop over a batch.
  Results also render as they land rather than after one long silence.
- **No server state.** Functions share no memory between invocations, so the
  extracted CV text goes back to the browser and returns when building the pack.
  Request bodies are capped at 4.5MB, which is why the UI rejects files over 3MB
  (base64 inflates a file by about a third).

The API key lives in Vercel's environment variables and never reaches the browser.
**Customers never supply a key** — every agency runs through your account, and you
meter them.

Set a hard monthly spend limit in the Anthropic Console as well. The password gate
stops strangers; the spend limit is what stops a bug or a shared password from
running up a bill you did not agree to.

## Layout

```
api/               Vercel serverless routes (thin wrappers)
src/handlers.ts    Request handling, shared by Vercel and local dev
src/claude.ts      The prompts and schemas. This is the product.
src/extract.ts     PDF / DOCX / TXT text extraction
src/server.ts      Local dev server only — never deployed
public/index.html  The whole UI, one file, no build step
scripts/           Companies House prospect-list builder
data/              Prospect CSVs
```

Nothing is persisted — a shortlist lives in the browser tab and disappears on refresh. A
database is the first thing to add once someone pays.

## Known limits

- **Scanned CVs with no text layer are skipped.** They are reported in the UI rather than
  silently dropped. OCR is the fix if agencies actually hit this.
- No auth, no multi-tenancy, no persistence, no usage metering. This is a demo you can put
  in front of an agency owner, not a product you can charge for yet. **Do not leave a public
  deployment unauthenticated** — it runs on your API key.

---

# Building the prospect list

## The list itself

Companies House publishes every registered UK company for free, and SIC code **78109**
("other activities of employment placement agencies") plus **78200** (temporary employment
agencies) is the recruitment industry. That is a verifiable list of thousands of real
companies.

```bash
# free key: https://developer.company-information.service.gov.uk
# add COMPANIES_HOUSE_API_KEY to .env
npm run prospects
```

This writes `data/prospects-uk-agencies.csv` with company name, number, incorporation date
and registered address, filtered to active companies incorporated 2012–2023 — a rough proxy
for "established but still small". Adjust the constants at the top of
`scripts/companies-house.ts` to widen or narrow it.

`data/prospects-seed.csv` has a handful of real agencies to start with today, in the same
column layout, if you want to send a few emails before running the script.

## Getting contacts

Companies House does not publish email addresses, and neither should anyone else invent them
for you — a list of guessed addresses bounces, and bounces wreck your sending domain before
you have sent anything real. Fill the `email` column with one of these:

- **The agency's own website.** Small agencies publish a `hello@` or the owner's direct
  address on the contact page. Highest quality, slowest.
- **LinkedIn.** Search the company, find the founder or director. Recruiters are unusually
  responsive on LinkedIn because it is their own channel.
- **An email finder** (Hunter, Apollo, Clay, Findymail). Verify before sending — most tools
  return a confidence score, and anything below "verified" should be dropped, not guessed.

Two other directories worth mining: the **REC member directory** (rec.uk.com) lists
accredited agencies, and **agencycentral.co.uk** lists agencies by region and sector.

## Before you send

UK B2B cold email is governed by PECR, not just UK GDPR. Emailing a **limited company's**
business address without prior consent is permitted; **sole traders and partnerships** are
treated as individuals and need more care — the `company_number` column tells you which is
which. Every email needs a genuine opt-out and your real business identity. Keep volume low
and personal at the start: fifty well-researched emails beat a thousand generic ones, and
they will not burn your domain.

## Working the list

The CSV has `status`, `sent_on`, `reply` and `notes` columns. Fill them in. What matters is
not the reply rate — it is what people say in `notes` when they reply. Ten agency owners
telling you what actually wastes their time is worth more than the product you have right
now.

The question to ask, in their words:

> When your team formats a candidate CV into your own template before sending it to a
> client, how long does that take?

If most say 20–40 minutes and sound annoyed about it, build. If they say "we don't do that,
we just forward the CV", stop and find out what they do instead.
