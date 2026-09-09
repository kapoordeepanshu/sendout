# Finding agencies, and what to send them

The goal of the first thirty emails is **not** to sell anything. It is to find out whether the
20–40 minute formatting problem is real for the people you'd be charging. If it isn't, you want
to know that in a fortnight, not after six months of building.

---

## Finding them

In rough order of how well they work.

### 1. LinkedIn — the best channel, not email

Recruiters answer unsolicited messages for a living. It is literally their job, which makes them
the most reachable audience in B2B. Search **People** with:

- Title: `Director` OR `Managing Director` OR `Founder` OR `Owner`
- Industry: `Staffing and Recruiting`
- Location: your target city — start with Manchester, Leeds, Birmingham or Bristol rather than
  London, which is saturated with vendors

Filter for companies with **2–20 employees**. At that size the person you're messaging is the
person who decides, there is no procurement, and they still do desk work themselves — so they
feel the problem personally.

### 2. Companies House — volume, with the script in this repo

```bash
# free key from https://developer.company-information.service.gov.uk
npm run prospects
```

Pulls active companies under SIC **78109** (employment placement) and **78200** (temporary
employment agencies), incorporated 2012–2023 as a rough proxy for "established but still
small". Thousands of rows with names, numbers and registered addresses. Companies House does not
publish emails — see [PROSPECTING.md](PROSPECTING.md) for enrichment.

### 3. Directories

- **rec.uk.com** — REC member directory, accredited agencies, searchable by sector
- **agencycentral.co.uk** — agencies by region and specialism, good for niching down

### Who to contact

At a 2–20 person agency: the founder, director or managing director. Not "Head of Talent", not
an operations manager. You want the person whose own money is on the line.

### Where to start

Pick **one specialism** — engineering, finance, healthcare, construction — and do thirty in
that niche rather than thirty scattered across the market. You learn faster because the answers
are comparable, and your second email can cite what the first ten told you.

---

## What to send

Four rules behind all the drafts below.

**No link in the first email.** A link from an unknown sender reads as phishing, hurts
deliverability, and gives them something to ignore instead of something to answer. The demo goes
in your *reply*, once they have written back.

**Ask, don't pitch.** A question about their day gets answered. A product announcement gets
deleted. You genuinely do not know yet whether your assumption is right, so ask honestly.

**Lead with the credential.** Four years building recruitment software is the reason an agency
owner reads past your first line. It is unusual, verifiable, and it says you understand their
world. Do not bury it.

**Send from Gmail at first.** A brand-new domain has no sending reputation and lands in spam. For
the first thirty, a personal address with a real name outperforms a shiny new one. Buy the domain
later, once you know there's a business.

---

### Email 1 — the opener

> **Subject:** 40 minutes per CV?
>
> Hi [Name],
>
> Quick question, and I'm genuinely asking rather than selling.
>
> When one of your consultants formats a candidate's CV into your template before it goes to a
> client — stripping contact details, writing the summary, laying it out — roughly how long does
> that take them?
>
> I spent four years building an applicant tracking system, and formatting kept coming up as the
> thing recruiters actually hated. I'm trying to work out whether that's still true or whether
> I'm remembering a solved problem.
>
> If you've got a number off the top of your head, I'd be glad of it. And if that isn't the part
> that wastes your team's time, I'd find it just as useful to hear what is.
>
> Deepanshu

Why it works: one question, answerable in ten seconds, no attachment, no link, no ask for a
meeting. The second question gives someone who disagrees a reason to reply anyway — and those
replies are the most valuable ones you'll get.

---

### Email 2 — the single follow-up

Send once, four or five working days later. Reply on the same thread. Never send a third.

> **Subject:** re: 40 minutes per CV?
>
> Hi [Name] — just floating this back up in case it got buried.
>
> One line is plenty: is CV formatting a real time sink for your team, or not really?
>
> Either answer helps, and I'll leave you alone after this.
>
> Deepanshu

---

### Email 3 — the reply, when they engage

**This is where the demo link goes.** Only after they've written back.

> Thanks [Name], that's useful — and [20 minutes / half a day a week] is roughly what I keep
> hearing.
>
> I've built something that takes the job spec and a pile of CVs and gives back a ranked
> shortlist with the evidence for each call, then writes the client-ready profile on your
> letterhead. Anonymised by default, so a client can read it without being able to go direct.
>
> It's here if you want a look — it opens on a worked example, so you can see what it produces
> without signing up for anything:
>
> [your URL]
>
> If you'd rather see it against a real spec of yours, send one over with a few CVs and I'll run
> it and send you back what it produces. Takes me five minutes and you'd be telling me whether
> it's any good.
>
> Deepanshu

The last paragraph is the important one. **Doing it for them beats asking them to try it** — it
costs them nothing, and their real spec against their real CVs is the only test that tells you
whether the output is good enough to submit.

---

### LinkedIn version

Shorter register, no subject line, no sign-off.

> Hi [Name] — I spent four years building an ATS, and CV formatting kept coming up as the thing
> recruiters hated most. Trying to work out if that's still true. When your consultants format a
> CV onto your template before sending it to a client, how long does that take? Genuinely
> asking, not selling.

---

## Working the list

Thirty emails, not three hundred. Personal beats volume at this stage, and a cold domain sending
hundreds of near-identical messages gets filtered before anyone reads it.

Track it in the CSV columns the prospect script generates: `status`, `sent_on`, `reply`, `notes`.

**The metric that matters is not the reply rate.** It's what people write in `notes`. Ten agency
owners telling you what actually wastes their time is worth more than the product as it stands.

Read the answers honestly:

- **Six or more of ten** describe 20–40 minutes and sound irritated → the problem is real, keep building.
- **Two or three of ten** → the pain exists but isn't sharp enough to sell against. Find out what
  is, before writing more code.
- **"We just forward the CV"** → the premise is wrong. That is a good outcome for a fortnight's
  work. Ask what they'd pay to fix instead.

Also worth knowing: at least a dozen vendors already sell CV formatting — Talent Veil, FormaCV,
RemakeCV, Saply, Allsorter, HireAra among them. Ask what people already use. If everyone names
a tool they're happy with, that is the single most useful thing you can learn, and it costs you
one question.

---

## Before you send

UK B2B cold email falls under PECR as well as UK GDPR. Emailing a **limited company's** business
address without prior consent is permitted; **sole traders and partnerships** count as
individuals and need more care — the `company_number` column tells you which is which. Every
email needs a real opt-out and your genuine identity. One line does it:

> If you'd rather I didn't email again, just say and I won't.
