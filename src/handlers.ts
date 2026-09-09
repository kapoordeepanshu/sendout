import { extractCv } from "./extract.js"
import { checkAccess } from "./auth.js"
import { buildSubmissionPack, screenCandidate, type Assessment } from "./screening.js"

/**
 * Request handlers as pure functions, so the Vercel serverless entry points in
 * `api/` and the local Express server in `server.ts` share one implementation.
 *
 * Note the shape: ONE CV per request. Serverless functions have a hard wall
 * clock limit, so the browser fans out and screens candidates in parallel. That
 * also means results appear one at a time instead of after a long silence.
 */

export interface HandlerResult {
  status: number
  body: unknown
}

export interface ScreenRequest {
  jobSpec?: string
  filename?: string
  /** The CV file, base64 encoded. Avoids multipart parsing in serverless. */
  fileBase64?: string
}

export async function handleScreen(
  input: ScreenRequest,
  password?: string,
): Promise<HandlerResult> {
  const access = checkAccess(password)
  if (!access.ok) return { status: access.status, body: { error: access.error } }

  const jobSpec = String(input.jobSpec ?? "").trim()
  const filename = String(input.filename ?? "cv")

  if (!jobSpec) return { status: 400, body: { error: "Paste the job spec first." } }
  if (!input.fileBase64) return { status: 400, body: { error: "No CV received." } }

  const buffer = Buffer.from(input.fileBase64, "base64")
  const cv = await extractCv(filename, buffer)

  if (cv.text.length <= 100) {
    return {
      status: 422,
      body: {
        filename,
        error:
          cv.error ?? "No readable text — this is probably a scanned CV with no text layer.",
      },
    }
  }

  try {
    const assessment = await screenCandidate(jobSpec, cv.text)
    // The CV text goes back to the browser, which returns it when building the
    // pack. Serverless functions share no memory between invocations, so there
    // is nowhere on the server to keep it.
    return { status: 200, body: { filename, cvText: cv.text, assessment } }
  } catch (err) {
    return { status: 500, body: { filename, error: messageFor(err) } }
  }
}

export interface PackRequest {
  jobSpec?: string
  cvText?: string
  assessment?: Assessment
  agencyName?: string
  consultantName?: string
  anonymise?: boolean
}

export async function handlePack(
  input: PackRequest,
  password?: string,
): Promise<HandlerResult> {
  const access = checkAccess(password)
  if (!access.ok) return { status: access.status, body: { error: access.error } }

  const { jobSpec, cvText, assessment } = input
  if (!jobSpec || !cvText || !assessment) {
    return { status: 400, body: { error: "Missing the spec, CV text or assessment." } }
  }

  try {
    const html = await buildSubmissionPack(jobSpec, cvText, assessment, {
      agencyName: String(input.agencyName || "Your agency"),
      consultantName: String(input.consultantName || ""),
      anonymise: Boolean(input.anonymise),
    })
    return { status: 200, body: { html } }
  } catch (err) {
    return { status: 500, body: { error: messageFor(err) } }
  }
}

function messageFor(err: unknown): string {
  const text = err instanceof Error ? err.message : String(err)
  if (/API_KEY is not set|authentication|invalid_api_key|401/i.test(text)) {
    return "The server has no valid model API key. Check the key for your chosen MODEL_PROVIDER in your Vercel project settings."
  }
  return text
}
