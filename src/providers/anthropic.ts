import Anthropic from "@anthropic-ai/sdk"
import { ProviderError, type Provider, type StructuredRequest, type TextRequest } from "./types.js"

/**
 * Anthropic adapter — the default.
 *
 * Structured output comes from a tool with `strict: true`, which guarantees the
 * arguments validate against the schema. `tool_choice` is left on auto with an
 * explicit instruction to call it, rather than forcing the call, because forced
 * tool use is rejected on some current models.
 *
 * The job spec carries `cache_control`, so a 30-CV batch pays for it once.
 */
export function anthropicProvider(model: string): Provider {
  // The SDK already retries 429s and 5xx; the default of 2 is thin when a model
  // is under load, and a dropped CV is worse than a slow one.
  const client = new Anthropic({ maxRetries: 4 })

  const system = (stable: string, context: string): Anthropic.TextBlockParam[] => [
    { type: "text", text: stable },
    { type: "text", text: context, cache_control: { type: "ephemeral" } },
  ]

  return {
    id: "anthropic",
    model,

    async structured<T>(request: StructuredRequest): Promise<T> {
      const response = await client.messages.create({
        model,
        max_tokens: request.maxTokens,
        thinking: { type: "adaptive" },
        output_config: { effort: "high" },
        system: system(request.systemStable, request.systemContext),
        tools: [
          {
            name: request.schemaName,
            description: "Record the structured result. Call this exactly once.",
            strict: true,
            input_schema: request.schema as Anthropic.Tool["input_schema"],
          },
        ],
        messages: [{ role: "user", content: request.user }],
      })

      const call = response.content.find(
        (block): block is Anthropic.ToolUseBlock =>
          block.type === "tool_use" && block.name === request.schemaName,
      )
      if (!call) {
        throw new ProviderError("anthropic", "The model replied without calling the tool.")
      }
      return call.input as T
    },

    async text(request: TextRequest): Promise<string> {
      const response = await client.messages.create({
        model,
        max_tokens: request.maxTokens,
        thinking: { type: "adaptive" },
        output_config: { effort: "medium" },
        system: system(request.systemStable, request.systemContext),
        messages: [{ role: "user", content: request.user }],
      })

      return response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim()
    },
  }
}
