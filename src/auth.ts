/**
 * A shared-password gate.
 *
 * The Anthropic key is never the exposure — it lives in a server environment
 * variable and never reaches the browser. The exposure is that an open endpoint
 * spends that key on behalf of anyone who finds the URL. This closes that.
 *
 * It is deliberately simple: one password, set as APP_PASSWORD, for handing
 * demo links to agency owners. It is not a user system. Before you charge
 * anyone, replace it with real accounts and per-account usage limits.
 *
 * Leave APP_PASSWORD unset for local development and the gate is skipped —
 * but the deployed app refuses to run without it, so a public deployment
 * cannot accidentally ship open.
 */

export interface AccessCheck {
  ok: boolean
  status: number
  error?: string
}

export function checkAccess(supplied: string | undefined): AccessCheck {
  const expected = process.env.APP_PASSWORD
  const isDeployed = Boolean(process.env.VERCEL)

  if (!expected) {
    if (isDeployed) {
      return {
        ok: false,
        status: 503,
        error:
          "This deployment has no APP_PASSWORD set, so it is refusing requests. Add one in your Vercel environment variables and redeploy.",
      }
    }
    return { ok: true, status: 200 } // local dev
  }

  if (!supplied || !timingSafeEqual(supplied, expected)) {
    return { ok: false, status: 401, error: "Wrong password." }
  }

  return { ok: true, status: 200 }
}

/** Compare without leaking length or position through timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
