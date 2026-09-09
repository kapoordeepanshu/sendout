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
