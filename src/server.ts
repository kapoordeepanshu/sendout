import "dotenv/config"
import express from "express"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { handlePack, handleScreen } from "./handlers.js"

/**
 * Local development server. It exists only to serve `public/` and mount the
 * same handlers the Vercel functions in `api/` use, so local and deployed
 * behaviour cannot drift. In production, Vercel serves `public/` itself and
 * calls `api/*` directly — this file is never deployed.
 */

const here = path.dirname(fileURLToPath(import.meta.url))

const app = express()
// Base64-encoded CVs travel in the JSON body. Vercel caps request bodies at
// 4.5MB, so match that here rather than discovering the limit in production.
app.use(express.json({ limit: "4.5mb" }))
app.use(express.static(path.join(here, "..", "public")))

const passwordOf = (req: express.Request) => {
  const header = req.headers["x-sendout-password"]
  return typeof header === "string" ? header : undefined
}

app.post("/api/screen", async (req, res) => {
  const result = await handleScreen(req.body ?? {}, passwordOf(req))
  res.status(result.status).json(result.body)
})

app.get("/api/health", async (req, res) => {
  const { default: health } = await import("../api/health.js")
  health(req as never, res as never)
})

app.post("/api/pack", async (req, res) => {
  const result = await handlePack(req.body ?? {}, passwordOf(req))
  res.status(result.status).json(result.body)
})

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => {
  console.log(`Sendout running at http://localhost:${port}`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("Warning: ANTHROPIC_API_KEY is not set — screening will fail until you add it to .env")
  }
})
