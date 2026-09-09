import mammoth from "mammoth"
import { extractText, getDocumentProxy } from "unpdf"

/**
 * Pull plain text out of a CV.
 *
 * PDF is the format most CVs actually arrive in, so it matters more than the
 * others. It uses `unpdf`, which wraps a current pdf.js build and ships no
 * native dependencies, so it runs in a serverless function unchanged.
 *
 * The obvious choice, `pdf-parse`, bundles pdf.js v1.10.100 from 2018 and
 * failed on a perfectly valid PDF with "bad XRef entry". CVs come out of Word,
 * Google Docs, LaTeX and Canva, so a stale parser silently loses candidates.
 */

export interface ExtractedCv {
  filename: string
  text: string
  error?: string
}

export async function extractCv(filename: string, buffer: Buffer): Promise<ExtractedCv> {
  const lower = filename.toLowerCase()
  try {
    if (lower.endsWith(".pdf")) {
      const pdf = await getDocumentProxy(new Uint8Array(buffer))
      const { text } = await extractText(pdf, { mergePages: true })
      return { filename, text: clean(text) }
    }
    if (lower.endsWith(".docx")) {
      const parsed = await mammoth.extractRawText({ buffer })
      return { filename, text: clean(parsed.value) }
    }
    if (lower.endsWith(".txt") || lower.endsWith(".md")) {
      return { filename, text: clean(buffer.toString("utf8")) }
    }
    return { filename, text: "", error: "Unsupported file type. Send PDF, DOCX or TXT." }
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
