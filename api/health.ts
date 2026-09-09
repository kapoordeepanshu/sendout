import type { VercelRequest, VercelResponse } from "@vercel/node"
import { checkAccess } from "../src/auth.js"

/**
 * Tells you what this deployment is actually configured with, so a
 * misconfiguration is one request away from being obvious rather than a guess.
 *
 * Password-gated and reports only booleans — never a key, never a prefix.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const supplied = req.headers["x-sendout-password"]
  const access = checkAccess(typeof supplied === "string" ? supplied : undefined)
  if (!access.ok) return res.status(access.status).json({ error: access.error })

  const providerId = (process.env.MODEL_PROVIDER ?? "anthropic").toLowerCase().trim()
  const expectedKey =
    providerId === "openai"
      ? "OPENAI_API_KEY"
      : providerId === "gemini"
        ? "GEMINI_API_KEY"
        : "ANTHROPIC_API_KEY"

  res.status(200).json({
    deployed: Boolean(process.env.VERCEL),
    modelProvider: providerId,
    modelProviderSetExplicitly: Boolean(process.env.MODEL_PROVIDER),
    modelName: process.env.MODEL_NAME || "(provider default)",
    expectedKey,
    expectedKeyPresent: Boolean(process.env[expectedKey]),
    otherKeysPresent: {
      ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
      OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
      GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
    },
  })
}
