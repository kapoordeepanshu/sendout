import type { VercelRequest, VercelResponse } from "@vercel/node"
import { handleScreen } from "../src/handlers.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." })
  const password = req.headers["x-sendout-password"]
  const result = await handleScreen(req.body ?? {}, typeof password === "string" ? password : undefined)
  res.status(result.status).json(result.body)
}
