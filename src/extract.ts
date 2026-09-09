import mammoth from "mammoth"
// pdf-parse's index.js runs a debug harness that reads a bundled test file and
// throws under ESM. The lib entry point is the actual parser.
import pdfParse from "pdf-parse/lib/pdf-parse.js"

export interface ExtractedCv {
  filename: string
  text: string
  error?: string
}

/** Pull plain text out of a PDF, DOCX or TXT CV. */
export async function extractCv(filename: string, buffer: Buffer): Promise<ExtractedCv> {
  const lower = filename.toLowerCase()
  try {
    if (lower.endsWith(".pdf")) {
      const parsed = await pdfParse(buffer)
      return { filename, text: clean(parsed.text) }
    }
    if (lower.endsWith(".docx")) {
      const parsed = await mammoth.extractRawText({ buffer })
      return { filename, text: clean(parsed.value) }
    }
    if (lower.endsWith(".txt") || lower.endsWith(".md")) {
      return { filename, text: clean(buffer.toString("utf8")) }
    }
    return { filename, text: "", error: `Unsupported file type. Send PDF, DOCX or TXT.` }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { filename, text: "", error: `Could not read this file: ${message}` }
  }
}

/** Collapse the whitespace soup that PDF extraction usually produces. */
function clean(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
