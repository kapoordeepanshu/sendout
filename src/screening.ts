import { provider } from "./providers/index.js"

/**
 * The product: what we ask a model for, and how strictly.
 *
 * Provider-agnostic on purpose — every model call goes through the interface in
 * `providers/`, so switching between Anthropic, OpenAI and Gemini is an
 * environment variable. The prompts and the schema below are the part that
 * actually determines output quality, and they are the same whichever model
 * runs them.
 */

export interface Assessment {
  candidate_name: string
  contact: { email: string | null; phone: string | null; location: string | null }
  current_role: { title: string | null; employer: string | null; since: string | null }
  years_experience_total: number | null
  years_experience_relevant: number | null
  match_score: number
  recommendation: "submit" | "maybe" | "reject"
  headline: string
  strengths: { claim: string; evidence: string }[]
  gaps: { concern: string; severity: "blocker" | "significant" | "minor" }[]
  requirements: { requirement: string; met: "yes" | "partial" | "no"; note: string }[]
  screening_questions: string[]
  stated_details: {
    salary_expectation: string | null
    notice_period: string | null
    availability: string | null
    right_to_work: string | null
  }
}

/**
 * Written as plain JSON Schema, which Anthropic and OpenAI take unchanged and
 * the Gemini adapter translates. Every property is required and objects are
 * closed — both providers' strict modes demand it.
 */
const ASSESSMENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "candidate_name",
    "contact",
    "current_role",
    "years_experience_total",
    "years_experience_relevant",
    "match_score",
    "recommendation",
    "headline",
    "strengths",
    "gaps",
    "requirements",
    "screening_questions",
    "stated_details",
  ],
  properties: {
    candidate_name: {
      type: "string",
      description: "Full name as written on the CV. 'Unknown' if absent.",
    },
    contact: {
      type: "object",
      additionalProperties: false,
      required: ["email", "phone", "location"],
      properties: {
        email: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        location: { type: ["string", "null"], description: "Town/city and country if stated." },
      },
    },
    current_role: {
      type: "object",
      additionalProperties: false,
      required: ["title", "employer", "since"],
      properties: {
        title: { type: ["string", "null"] },
        employer: { type: ["string", "null"] },
        since: { type: ["string", "null"], description: "Start date of the current role as written." },
      },
    },
    years_experience_total: { type: ["number", "null"] },
    years_experience_relevant: {
      type: ["number", "null"],
      description: "Years of experience relevant to THIS spec, not total career length.",
    },
    match_score: {
      type: "number",
      description:
        "0-100. 80+ means submit today. 60-79 means worth a screening call. Below 60 means reject. Be strict — a shortlist that recommends everyone is worthless.",
    },
    recommendation: { type: "string", enum: ["submit", "maybe", "reject"] },
    headline: {
      type: "string",
      description:
        "One sentence a recruiter could read aloud to the client. No fluff, no adjectives like 'excellent'.",
    },
    strengths: {
      type: "array",
      description: "Up to 4. Every claim must be backed by a quote from the CV.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["claim", "evidence"],
        properties: {
          claim: { type: "string" },
          evidence: {
            type: "string",
            description: "A short verbatim quote from the CV supporting the claim.",
          },
        },
      },
    },
    gaps: {
      type: "array",
      description:
        "Up to 4. Real risks only — missing must-haves, unexplained employment gaps, job hopping, over/under-qualification.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["concern", "severity"],
        properties: {
          concern: { type: "string" },
          severity: { type: "string", enum: ["blocker", "significant", "minor"] },
        },
      },
    },
    requirements: {
      type: "array",
      description: "One row per stated requirement in the spec. This is what the client actually reads.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["requirement", "met", "note"],
        properties: {
          requirement: {
            type: "string",
            description: "The requirement, quoted or closely paraphrased from the spec.",
          },
          met: { type: "string", enum: ["yes", "partial", "no"] },
          note: {
            type: "string",
            description: "Short justification pointing at the CV. Say 'Not stated on CV' when it is absent.",
          },
        },
      },
    },
    screening_questions: {
      type: "array",
      description:
        "3-5 questions the recruiter must ask on the call. Target the actual unknowns for THIS candidate — never generic questions.",
      items: { type: "string" },
    },
    stated_details: {
      type: "object",
      additionalProperties: false,
      required: ["salary_expectation", "notice_period", "availability", "right_to_work"],
      properties: {
        salary_expectation: { type: ["string", "null"] },
        notice_period: { type: ["string", "null"] },
        availability: { type: ["string", "null"] },
        right_to_work: { type: ["string", "null"] },
      },
    },
  },
} as const

const SCREEN_SYSTEM = `You are screening candidates on behalf of a recruitment agency that will put its own name and reputation on the submission.

How to judge:
- Score against the spec in front of you, not against a general idea of a good CV.
- Distinguish what the CV evidences from what it merely asserts. "Led digital transformation" with no detail is an assertion; a named system, a team size, or a measurable outcome is evidence.
- Never invent, infer or round up. If the CV does not say it, the answer is "Not stated on CV".
- Be strict with the score. An agency that submits everyone loses the client. Most CVs in a real inbound pile are a reject.
- Flag employment gaps over six months, and rapid job changes, as gaps to probe — not as automatic rejections.
- Write screening questions that close the specific unknowns for this person. If they are missing a must-have, ask about it directly.

Record your assessment using the required structure. Do not reply with prose.`

/** Screen one CV against one job spec. */
export async function screenCandidate(jobSpec: string, cvText: string): Promise<Assessment> {
  return provider().structured<Assessment>({
    systemStable: SCREEN_SYSTEM,
    systemContext: `<job_spec>\n${jobSpec}\n</job_spec>`,
    user: `Assess this candidate against the job spec above.\n\n<cv>\n${cvText}\n</cv>`,
    schema: ASSESSMENT_SCHEMA as unknown as Record<string, unknown>,
    schemaName: "record_assessment",
    maxTokens: 16000,
  })
}

export interface PackOptions {
  agencyName: string
  consultantName: string
  anonymise: boolean
}

const PACK_SYSTEM = `You write client-ready candidate submission profiles for a recruitment agency.

The client is busy and decides in under a minute. Write for that reader.

Rules:
- Lead with why this person fits THIS role. No generic career summaries.
- Every achievement must trace to something on the CV. Do not embellish. Do not add adjectives the CV does not earn.
- Use the client's own language from the spec where the CV supports it.
- Keep the whole profile under 500 words.
- Where a requirement is not evidenced, say so plainly in the gaps section. An agency that hides gaps gets caught at interview.
- Write in British English. Third person. No first-person recruiter voice, no "I am delighted to present".

Return clean semantic HTML only — a sequence of <section>, <h3>, <p>, <ul>, <li>, <table> elements. No <html>, <head> or <body> tags, no CSS, no markdown fences.`

/** Turn an assessment plus the raw CV into a client-ready submission profile. */
export async function buildSubmissionPack(
  jobSpec: string,
  cvText: string,
  assessment: Assessment,
  options: PackOptions,
): Promise<string> {
  const anonymityRule = options.anonymise
    ? `ANONYMISE THIS PROFILE. Refer to the candidate only as "${initials(assessment.candidate_name)}". Remove every email address, phone number, full address and personal URL. Replace named current and former employers with a description — for example "a FTSE 250 retail bank" or "a Manchester-based logistics SME". The client must not be able to identify or approach this person directly.`
    : `Include the candidate's name. Do not include their email address or phone number — the agency controls contact.`

  const html = await provider().text({
    systemStable: PACK_SYSTEM,
    systemContext: `<job_spec>\n${jobSpec}\n</job_spec>`,
    maxTokens: 8000,
    user: `${anonymityRule}

Write the submission profile with these sections, in this order:
1. <h3>Summary</h3> — two or three sentences on the fit.
2. <h3>Against your requirements</h3> — a table with columns Requirement, Evidence, and a Met column reading Yes / Partial / No.
3. <h3>Relevant experience</h3> — the roles that matter for this spec, most recent first, with what they actually did.
4. <h3>Worth knowing</h3> — the honest gaps and anything the client should probe at interview.
5. <h3>Availability</h3> — notice period, salary expectation and availability where stated; "To be confirmed" where not.

<assessment>
${JSON.stringify(assessment, null, 2)}
</assessment>

<cv>
${cvText}
</cv>`,
  })

  return stripFences(html)
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "The candidate"
  return parts.map((part) => part[0]!.toUpperCase()).join(".") + "."
}

/** Models sometimes wrap HTML in a markdown fence despite instructions. */
function stripFences(text: string): string {
  return text
    .replace(/^```(?:html)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim()
}
