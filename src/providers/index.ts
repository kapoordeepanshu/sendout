import { anthropicProvider } from "./anthropic.js"
import { geminiProvider } from "./gemini.js"
import { openaiProvider } from "./openai.js"
import { ProviderError, type Provider } from "./types.js"

export type { Provider, StructuredRequest, TextRequest } from "./types.js"
export { ProviderError } from "./types.js"

/**
 * Pick the provider from the environment.
 *
 *   MODEL_PROVIDER = anthropic | openai | gemini      (default: anthropic)
 *   MODEL_NAME     = override the default model for that provider
 *
 * Anthropic is the default because screening judgement is the product and the
 * prompts were written and tuned against it. Before switching, build a set of
 * CVs you have already judged by hand and compare — "the output looks fine" is
 * not a measurement, and this is the one decision that changes what customers
 * are paying for.
 */
const DEFAULT_MODEL: Record<string, string> = {
  anthropic: "claude-opus-5",
  openai: "gpt-5",
  // Gemini 3 Flash is billed at Flash rates with Pro-level reasoning, which is
  // the right trade for per-CV screening. gemini-3.1-pro-preview is the step up
  // if judgement quality measures short.
  gemini: "gemini-3.7-flash",
}

let cached: Provider | undefined

export function provider(): Provider {
  if (cached) return cached

  const id = (process.env.MODEL_PROVIDER ?? "anthropic").toLowerCase().trim()
  const model = process.env.MODEL_NAME?.trim() || DEFAULT_MODEL[id]

  if (!model) {
    throw new ProviderError(
      id,
      `Unknown MODEL_PROVIDER "${id}". Use anthropic, openai or gemini.`,
    )
  }

  switch (id) {
    case "anthropic":
      cached = anthropicProvider(model)
      break
    case "openai":
      cached = openaiProvider(model)
      break
    case "gemini":
      cached = geminiProvider(model)
      break
    default:
      throw new ProviderError(
        id,
        `Unknown MODEL_PROVIDER "${id}". Use anthropic, openai or gemini.`,
      )
  }

  return cached
}

/** Test seam — lets a test swap the provider without touching the environment. */
export function setProvider(replacement: Provider | undefined): void {
  cached = replacement
}
