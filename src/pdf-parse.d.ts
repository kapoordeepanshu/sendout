// @types/pdf-parse only declares the package root, and the root entry point runs
// a debug harness that breaks under ESM. Declare the lib entry we actually import.
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    text: string
    numpages: number
    info: unknown
  }
  export default function pdfParse(buffer: Buffer): Promise<PdfParseResult>
}
