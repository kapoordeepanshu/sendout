import { ProviderError, type Provider, type StructuredRequest, type TextRequest } from "./types.js"
import { failureFrom, withRetry } from "./retry.js"

/**
 * Gemini adapter, over the REST API.
 *
 * Two things differ from the others and are worth knowing before you switch:
 *
 * 1. Gemini's response schema is an OpenAPI subset, not plain JSON Schema. It
 *    rejects `additionalProperties`, expects uppercase type names, and marks
 *    optional values with `nullable: true` rather than a `["string", "null"]`
 *    type union. `toGeminiSchema` translates ours, so one schema still serves
 *    all three providers.
 *
 * 2. Explicit context caching has a minimum size, and a job spec is usually
 *    well under it. So the spec is re-sent and re-charged on every CV, where
 *    Anthropic caches it once per batch. On a 30-CV run that is the single
 *    biggest cost difference between providers — measure before committing.
 */
const BASE = "https://generativelanguage.googleapis.com/v1beta/models"

/** Translate JSON Schema into the OpenAPI subset Gemini accepts. */
export function toGeminiSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toGeminiSchema)
  if (node === null || typeof node !== "object") return node

  const source = node as Record<string, unknown>
  const out: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(source)) {
    // Not part of Gemini's dialect; sending it is rejected.
    if (key === "additionalProperties") continue

    if (key === "type") {
      const types = Array.isArray(value) ? value : [value]
      const concrete = types.filter((t) => t !== "null")
      if (types.length !== concrete.length) out.nullable = true
      out.type = String(concrete[0] ?? "string").toUpperCase()
      continue
    }

    // `properties` is a map of field name to subschema, so recurse into each
    // value rather than the map itself — the keys are field names, not schema
    // keywords.
    if (key === "properties" && value && typeof value === "object") {
      out.properties = Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([field, sub]) => [
          field,
          toGeminiSchema(sub),
        ]),
      )
      continue
    }

    if (key === "items" || key === "anyOf") {
      out[key] = toGeminiSchema(value)
      continue
    }

    out[key] = value
  }

  return out
}

export function geminiProvider(model: string): Provider {
  if (!process.env.GEMINI_API_KEY) {
    throw new ProviderError("gemini", "GEMINI_API_KEY is not set.")
  }
  const key: string = process.env.GEMINI_API_KEY

  async function call(body: Record<string, unknown>): Promise<string> {
    return withRetry("Gemini", async () => {
      const response = await fetch(`${BASE}/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw await failureFrom("gemini", response)

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]
      }
      const candidate = data.candidates?.[0]
      if (candidate?.finishReason === "MAX_TOKENS") {
        throw new ProviderError("gemini", "Response hit the token limit before finishing.")
      }
      const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("")
      if (!text) throw new ProviderError("gemini", "Empty response.")
      return text
    })
  }

  const instruction = (stable: string, context: string) => ({
    parts: [{ text: `${stable}\n\n${context}` }],
  })

  return {
    id: "gemini",
    model,

    async structured<T>(request: StructuredRequest): Promise<T> {
      const raw = await call({
        systemInstruction: instruction(request.systemStable, request.systemContext),
        contents: [{ role: "user", parts: [{ text: request.user }] }],
        generationConfig: {
          maxOutputTokens: request.maxTokens,
          responseMimeType: "application/json",
          responseSchema: toGeminiSchema(request.schema),
        },
      })

      try {
        return JSON.parse(raw) as T
      } catch {
        throw new ProviderError("gemini", "The response was not valid JSON.")
      }
    },

    async text(request: TextRequest): Promise<string> {
      const raw = await call({
        systemInstruction: instruction(request.systemStable, request.systemContext),
        contents: [{ role: "user", parts: [{ text: request.user }] }],
        generationConfig: { maxOutputTokens: request.maxTokens },
      })
      return raw.trim()
    },
  }
}
