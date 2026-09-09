/**
 * Assemble the static site into dist/.
 *
 * Vercel only honours `outputDirectory` when a build actually produces it, so
 * "no build step, just serve public/" leaves it looking into an output folder
 * that was never created. This makes the build real.
 *
 * It also keeps src/ off the public internet. Serving the repository root would
 * expose src/screening.ts — the prompts, which are the actual product.
 */
import { cp, mkdir, rm, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const from = path.join(root, "public")
const to = path.join(root, "dist")

await rm(to, { recursive: true, force: true })
await mkdir(to, { recursive: true })
await cp(from, to, { recursive: true })

const files = await readdir(to)
if (!files.includes("index.html")) {
  console.error(`No index.html in ${to} — the static build produced nothing usable.`)
  process.exit(1)
}

console.log(`Built ${files.length} file(s) into dist/: ${files.join(", ")}`)
