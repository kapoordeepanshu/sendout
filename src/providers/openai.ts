import { ProviderError, type Provider, type StructuredRequest, type TextRequest } from "./types.js"

/**
 * OpenAI adapter, over the REST API rather than the SDK.
 *
 * Deliberate: it adds no dependency and nothing to keep in step with SDK
 * releases. The Chat Completions shape used here has been stable for a long
 * time, and the whole adapter is two fetch calls.
 *
 * Structured output uses `response_format: json_schema` with `strict: true`.
 * The schema written for Anthropic ports across unchanged — OpenAI's strict
 * mode needs `additionalProperties: false` and every property listed in
 * `required`, both of which the schema already satisfies.
 *
 * Caching is automatic above a token threshold and cannot be placed explicitly,
 * so the job spec goes first in the system prompt where a prefix match can find
 * it.
 */
const ENDPOINT = "https://api.openai.com/v1/chat/completions"

export function openaiProvider(model: string): Provider {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new ProviderError("openai", "OPENAI_API_KEY is not set.")

  async function call(body: Record<string, unknown>): Promise<string> {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, ...body }),
    })

    if (!response.ok) {
      throw new ProviderError("openai", `${response.status}: ${await response.text()}`)
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string }; finish_reason?: string }[]
    }
    const choice = data.choices?.[0]
    if (choice?.finish_reason === "length") {
      throw new ProviderError("openai", "Response hit the token limit before finishing.")
    }
    const content = choice?.message?.content
    if (!content) throw new ProviderError("openai", "Empty response.")
    return content
  }

  // Stable instructions first, then the repeating job spec, then per-request
  // content — so the cacheable prefix is as long as possible.
  const system = (stable: string, context: string) => `${stable}\n\n${context}`

  return {
    id: "openai",
    model,

    async structured<T>(request: StructuredRequest): Promise<T> {
      const raw = await call({
        max_completion_tokens: request.maxTokens,
        messages: [
          { role: "system", content: system(request.systemStable, request.systemContext) },
          { role: "user", content: request.user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: request.schemaName, strict: true, schema: request.schema },
        },
      })

      try {
        return JSON.parse(raw) as T
      } catch {
        throw new ProviderError("openai", "The response was not valid JSON.")
      }
    },

    async text(request: TextRequest): Promise<string> {
      const raw = await call({
        max_completion_tokens: request.maxTokens,
        messages: [
          { role: "system", content: system(request.systemStable, request.systemContext) },
          { role: "user", content: request.user },
        ],
      })
      return raw.trim()
    },
  }
}
