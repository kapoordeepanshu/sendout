/**
 * The model provider interface.
 *
 * Everything the product needs from a model is two calls: return JSON matching
 * a schema, or return prose. Each provider adapter implements those two and
 * nothing else, so switching is an environment variable rather than a rewrite.
 *
 * `systemContext` is separated from `systemStable` on purpose. It carries the
 * job spec, which repeats across every CV in a batch, and each provider caches
 * it in its own way — or, in Gemini's case, may not be able to at all.
 */

export interface StructuredRequest {
  /** Instructions that never change. Same for every request. */
  systemStable: string
  /** The job spec. Repeats across a batch, so providers cache it where they can. */
  systemContext: string
  user: string
  /** JSON Schema the response must satisfy. */
  schema: Record<string, unknown>
  schemaName: string
  maxTokens: number
}

export interface TextRequest {
  systemStable: string
  systemContext: string
  user: string
  maxTokens: number
}

export interface Provider {
  /** For logs and error messages. */
  readonly id: string
  readonly model: string
  structured<T>(request: StructuredRequest): Promise<T>
  text(request: TextRequest): Promise<string>
}

export class ProviderError extends Error {
  constructor(
    readonly provider: string,
    message: string,
  ) {
    super(message)
    this.name = "ProviderError"
  }
}
