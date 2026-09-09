/**
 * A worked example, shown on first load.
 *
 * Anyone opening a demo link should see what the tool produces before they
 * upload anything or type a password. This is local data — no API call, no key,
 * no cost. It is labelled as an example in the interface so nobody mistakes it
 * for their own results.
 */
window.SAMPLE = {
  spec: `Senior Backend Engineer — Manchester (hybrid, 2 days on site)
£75,000–90,000 + benefits

Must have:
- 5+ years commercial backend engineering
- Strong Go, in production, at scale
- PostgreSQL — schema design and query optimisation
- Experience leading or mentoring engineers

Nice to have:
- Kubernetes
- Fintech or regulated-industry background

Notice period: we need someone who can start within 8 weeks.`,

  candidates: [
    {
      id: "sample-1",
      filename: "priya-raman-cv.pdf",
      cvText: "",
      assessment: {
        candidate_name: "Priya Raman",
        contact: { email: null, phone: null, location: "Manchester, UK" },
        current_role: { title: "Lead Backend Engineer", employer: "Northgate Logistics", since: "Jan 2021" },
        years_experience_total: 8,
        years_experience_relevant: 8,
        match_score: 88,
        recommendation: "submit",
        headline:
          "Eight years backend, currently leading a team of four on a Go and Postgres platform in Manchester — meets every must-have.",
        strengths: [
          {
            claim: "Go in production at meaningful scale, with a measured outcome",
            evidence: "Rebuilt the consignment tracking service in Go, cutting p99 latency from 800ms to 90ms",
          },
          {
            claim: "Owns PostgreSQL schema design rather than just querying it",
            evidence: "Owned Postgres schema design and migration strategy",
          },
          {
            claim: "Already leading engineers, so the mentoring requirement is evidenced not assumed",
            evidence: "Led a team of four engineers",
          },
          {
            claim: "Local to the role, so the hybrid requirement is not a risk",
            evidence: "Manchester, UK",
          },
        ],
        gaps: [
          { concern: "No fintech or regulated-industry background — logistics and health only", severity: "minor" },
          { concern: "Notice period not stated; must confirm the 8-week window", severity: "significant" },
        ],
        requirements: [
          { requirement: "5+ years commercial backend engineering", met: "yes", note: "Eight years across two employers since 2018." },
          { requirement: "Strong Go in production at scale", met: "yes", note: "Rebuilt a core service in Go with a measured latency improvement." },
          { requirement: "PostgreSQL schema design and optimisation", met: "yes", note: "Explicitly owned schema design and migrations." },
          { requirement: "Leading or mentoring engineers", met: "yes", note: "Currently leads four engineers." },
          { requirement: "Kubernetes (nice to have)", met: "partial", note: "Listed under skills but no project evidence." },
          { requirement: "Fintech or regulated industry (nice to have)", met: "no", note: "Logistics and healthcare. Health data is regulated, which may partly count." },
        ],
        screening_questions: [
          "What is your notice period, and could you start within eight weeks?",
          "The CV lists Kubernetes under skills but no project uses it — where have you run it in production?",
          "What was your actual scope leading the four engineers: hiring, performance, architecture, or delivery only?",
          "You are on £? currently — does £75–90k work, and what would move you?",
        ],
        stated_details: {
          salary_expectation: null,
          notice_period: null,
          availability: null,
          right_to_work: null,
        },
      },
    },
    {
      id: "sample-2",
      filename: "tom-whitfield-cv.docx",
      cvText: "",
      assessment: {
        candidate_name: "Tom Whitfield",
        contact: { email: null, phone: null, location: "Leeds, UK" },
        current_role: { title: "Backend Engineer", employer: "Fairhaven Payments", since: "Sep 2022" },
        years_experience_total: 6,
        years_experience_relevant: 3,
        match_score: 64,
        recommendation: "maybe",
        headline:
          "Six years backend and strong fintech exposure, but Go is recent and there is no evidence of leading anyone.",
        strengths: [
          {
            claim: "Genuine regulated-industry background, which the client listed as desirable",
            evidence: "Backend Engineer, Fairhaven Payments — PCI-DSS scoped card processing",
          },
          {
            claim: "Kubernetes in production, not just on the skills list",
            evidence: "Migrated 14 services to EKS and owned the Helm chart repository",
          },
        ],
        gaps: [
          { concern: "Go only since 2022 — roughly three of six years, against a 5+ requirement read strictly", severity: "significant" },
          { concern: "No leadership or mentoring evidence anywhere on the CV", severity: "significant" },
          { concern: "Leeds-based; hybrid is two days on site in Manchester", severity: "minor" },
        ],
        requirements: [
          { requirement: "5+ years commercial backend engineering", met: "yes", note: "Six years total since 2020." },
          { requirement: "Strong Go in production at scale", met: "partial", note: "Go since Sep 2022 only; earlier roles were Java." },
          { requirement: "PostgreSQL schema design and optimisation", met: "partial", note: "Postgres listed and used, but no schema ownership described." },
          { requirement: "Leading or mentoring engineers", met: "no", note: "Not stated on CV." },
          { requirement: "Kubernetes (nice to have)", met: "yes", note: "Migrated 14 services to EKS." },
          { requirement: "Fintech or regulated industry (nice to have)", met: "yes", note: "Card payments, PCI-DSS scope." },
        ],
        screening_questions: [
          "How much of your day-to-day is Go now versus Java, and would you call yourself strong in it?",
          "Have you mentored or led anyone, formally or informally? The client weights this heavily.",
          "Manchester is two days a week on site — does that commute from Leeds work long term?",
          "Which parts of the Postgres schema at Fairhaven did you design rather than inherit?",
        ],
        stated_details: {
          salary_expectation: "£80,000",
          notice_period: "1 month",
          availability: null,
          right_to_work: "British citizen",
        },
      },
    },
    {
      id: "sample-3",
      filename: "a-osei-cv.pdf",
      cvText: "",
      assessment: {
        candidate_name: "Adjoa Osei",
        contact: { email: null, phone: null, location: "London, UK" },
        current_role: { title: "Full Stack Developer", employer: "Brightmoor Studio", since: "Mar 2023" },
        years_experience_total: 4,
        years_experience_relevant: 1,
        match_score: 31,
        recommendation: "reject",
        headline:
          "Four years mostly front-end at an agency, with no Go and no evidence of backend work at scale.",
        strengths: [
          {
            claim: "Solid modern front-end delivery record",
            evidence: "Shipped 20+ client sites in React and Next.js",
          },
        ],
        gaps: [
          { concern: "No Go anywhere on the CV, which is a hard must-have", severity: "blocker" },
          { concern: "Roughly one year of backend work against a 5+ year requirement", severity: "blocker" },
          { concern: "Agency project work rather than owning a system at scale", severity: "significant" },
        ],
        requirements: [
          { requirement: "5+ years commercial backend engineering", met: "no", note: "Four years total, and predominantly front-end." },
          { requirement: "Strong Go in production at scale", met: "no", note: "Not stated on CV." },
          { requirement: "PostgreSQL schema design and optimisation", met: "partial", note: "Postgres listed; usage described as 'queries for client dashboards'." },
          { requirement: "Leading or mentoring engineers", met: "no", note: "Not stated on CV." },
          { requirement: "Kubernetes (nice to have)", met: "no", note: "Not stated on CV." },
          { requirement: "Fintech or regulated industry (nice to have)", met: "no", note: "Agency clients in retail and hospitality." },
        ],
        screening_questions: [
          "Worth a courtesy call to keep the relationship — is backend the direction you want, and would a mid-level backend role interest you?",
        ],
        stated_details: {
          salary_expectation: null,
          notice_period: "2 weeks",
          availability: null,
          right_to_work: null,
        },
      },
    },
  ],

  pack: `<h3>Summary</h3>
<p>A backend engineer with eight years' commercial experience, currently leading a team of four
on a Go and PostgreSQL platform in Manchester. Meets every stated must-have with evidence on
the CV rather than assertion, and is local to the role.</p>

<h3>Against your requirements</h3>
<table>
  <tr><th>Requirement</th><th>Evidence</th><th>Met</th></tr>
  <tr><td>5+ years commercial backend</td><td>Eight years across two employers since 2018</td><td>Yes</td></tr>
  <tr><td>Strong Go at scale</td><td>Rebuilt a consignment tracking service in Go, p99 latency 800ms &rarr; 90ms</td><td>Yes</td></tr>
  <tr><td>PostgreSQL schema design</td><td>Owned schema design and migration strategy</td><td>Yes</td></tr>
  <tr><td>Leading or mentoring</td><td>Currently leads four engineers</td><td>Yes</td></tr>
  <tr><td>Kubernetes</td><td>Listed under skills; no project evidence</td><td>Partial</td></tr>
  <tr><td>Fintech or regulated industry</td><td>Logistics and healthcare; health data is regulated</td><td>No</td></tr>
</table>

<h3>Relevant experience</h3>
<p><strong>Lead Backend Engineer, a national logistics operator</strong> (Jan 2021 &ndash; present).
Rebuilt the consignment tracking service in Go, taking p99 latency from 800ms to 90ms. Owns
PostgreSQL schema design and the migration strategy. Leads a team of four engineers.</p>
<p><strong>Backend Engineer, a digital health provider</strong> (Mar 2018 &ndash; Dec 2020). Built
HL7 ingestion pipelines in Python handling around two million messages a day.</p>

<h3>Worth knowing</h3>
<ul>
  <li>No fintech background. The closest equivalent is regulated health data, which may or may
      not satisfy your requirement &mdash; worth probing at interview.</li>
  <li>Kubernetes appears under skills but is not evidenced in any project on the CV.</li>
  <li>Notice period is not stated. We are confirming this and will update you before interview.</li>
</ul>

<h3>Availability</h3>
<p>Notice period: to be confirmed. Salary expectation: to be confirmed. Located in Manchester,
so the two-day hybrid pattern presents no relocation or commute risk.</p>`,
}
