import { ProviderError } from "./types.js"

/**
 * Retry transient provider failures.
 *
 * Model APIs return 503 "high demand" and 429 rate limits routinely, especially
 * on newer models. Without this, screening a pile of thirty CVs quietly drops
 * whichever ones happened to land during a spike — which is worse than failing,
 * because the recruiter sees a shorter shortlist and no reason to distrust it.
 */

/** Transient: worth retrying. Anything else is a real error and fails fast. */
const RETRYABLE = new Set([408, 409, 429, 500, 502, 503, 504])

const MAX_ATTEMPTS = 4
const BASE_DELAY_MS = 1000

export interface HttpFailure {
  status: number
  /** Value of a Retry-After header, in seconds, when the provider sent one. */
  retryAfterSeconds?: number
}

export class TransientError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(message)
    this.name = "TransientError"
  }
}

export function isRetryable(status: number): boolean {
  return RETRYABLE.has(status)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Run `task`, retrying transient failures with exponential backoff and jitter.
 * Jitter matters here: the browser fans out four CVs at once, and without it
 * they would all retry on the same beat and hit the same spike together.
 */
export async function withRetry<T>(provider: string, task: () => Promise<T>): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await task()
    } catch (err) {
      lastError = err

      const transient =
        err instanceof TransientError ||
        // fetch throws a TypeError on a dropped connection.
        (err instanceof TypeError && /fetch failed|network/i.test(err.message))

      if (!transient || attempt === MAX_ATTEMPTS) break

      const retryAfter =
        err instanceof TransientError && err.retryAfterSeconds
          ? err.retryAfterSeconds * 1000
          : undefined

      const backoff = BASE_DELAY_MS * 2 ** (attempt - 1)
      const jitter = Math.random() * BASE_DELAY_MS
      await sleep(retryAfter ?? backoff + jitter)
    }
  }

  if (lastError instanceof TransientError) {
    throw new ProviderError(
      provider,
      lastError.status === 429
        ? `${provider} is rate limiting this account. Wait a minute and screen again, or reduce how many CVs you send at once.`
        : `${provider} is overloaded right now and did not recover after ${MAX_ATTEMPTS} attempts. This is temporary — try again in a minute, or switch MODEL_NAME to a less busy model.`,
    )
  }
  throw lastError
}

/** Turn a failed fetch Response into the right error type for `withRetry`. */
export async function failureFrom(provider: string, response: Response): Promise<Error> {
  const body = await response.text()
  const header = response.headers.get("retry-after")
  const retryAfterSeconds = header && /^\d+$/.test(header) ? Number(header) : undefined

  return isRetryable(response.status)
    ? new TransientError(response.status, `${response.status}: ${body}`, retryAfterSeconds)
    : new ProviderError(provider, `${response.status}: ${body}`)
}
