/**
 * Generate three demo CVs against the job spec the app opens with.
 *
 * One PDF, one DOCX and one TXT — deliberately, because that also exercises all
 * three extractors in src/extract.ts rather than just the easy path.
 *
 * The three are written to produce genuinely different verdicts, and each one
 * hides something a good screen should catch:
 *   Marcus  — ticks every requirement, but his notice period misses the window
 *   Sofia   — strong on the nice-to-haves, weak on the actual must-have
 *   Dan     — a plausible-looking CV with none of the core requirements
 *
 * They are not the same people as the worked example in public/sample.js, so a
 * real run produces visibly new results rather than looking like a replay.
 *
 *   npm run samples   ->   samples/*.pdf, *.docx, *.txt
 */
import { mkdir, writeFile } from "node:fs/promises"
import { createWriteStream } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import PDFDocument from "pdfkit"
import { Document, Packer, Paragraph, TextRun } from "docx"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const out = path.join(root, "samples")

/** Ticks every must-have — but the notice period misses the client's window. */
const marcus = [
  "MARCUS ELLERY",
  "Stockport, Greater Manchester  |  m.ellery@example.com  |  07700 900412",
  "",
  "PRINCIPAL BACKEND ENGINEER",
  "",
  "Nine years building and running backend systems, the last six in Go. Currently",
  "responsible for the order platform at a national parcel marketplace.",
  "",
  "EXPERIENCE",
  "",
  "Principal Backend Engineer — Kestrel Freight Exchange, Manchester",
  "March 2021 – present",
  "  Own the order and settlement platform: 11 Go services, roughly 40 million",
  "  events a day at peak.",
  "  Split the monolithic booking service into three Go services, taking checkout",
  "  p95 from 1.4s to 210ms and removing the Black Friday freeze entirely.",
  "  Designed the PostgreSQL partitioning strategy for the events table (now 4.2bn",
  "  rows) and rewrote the settlement queries, cutting nightly reconciliation from",
  "  6 hours to 25 minutes.",
  "  Line manage six engineers. Run the hiring loop and the internal Go guild.",
  "  Introduced the on-call rota and cut Sev-1s from 14 to 3 a year.",
  "",
  "Senior Software Engineer — Halden Freight Systems, Manchester",
  "June 2017 – February 2021",
  "  Built the carrier integration layer in Go and Python across 22 carrier APIs.",
  "  Owned PostgreSQL schema design and the migration tooling for the tracking",
  "  database.",
  "  Mentored two junior engineers through to mid-level.",
  "",
  "Software Engineer — Ardwick Digital, Manchester",
  "September 2016 – May 2017",
  "  Java and Spring work on retail integrations.",
  "",
  "TECHNICAL",
  "Go (6 years, primary), Python, PostgreSQL, Kafka, Terraform, AWS, Docker.",
  "Kubernetes — production since 2022, own the platform team's Helm charts.",
  "",
  "EDUCATION",
  "BEng Software Engineering, University of Sheffield, 2016. First class.",
  "",
  "OTHER",
  "Notice period: 3 months.",
  "Salary expectation: £88,000.",
  "Happy with hybrid working. Based 8 miles from central Manchester.",
]

/** Strong on the nice-to-haves, thin on the must-have. */
const sofia = [
  "SOFIA MARCHETTI",
  "Manchester, UK  |  sofia.marchetti@example.com  |  07700 900188",
  "",
  "SENIOR SOFTWARE ENGINEER — PAYMENTS",
  "",
  "EXPERIENCE",
  "",
  "Senior Software Engineer — Vantis Pay, Manchester",
  "January 2022 – present",
  "  Card processing platform inside PCI-DSS scope, handling around £2bn of",
  "  volume a year.",
  "  Lead engineer on the 3-D Secure 2 migration, delivered across four squads",
  "  and to the FCA deadline.",
  "  Built the reconciliation service in Kotlin. Added a Go service in 2024 for",
  "  the webhook fan-out — my first production Go.",
  "  Run the Kubernetes platform: 30-odd services on EKS, all our Helm charts,",
  "  and the migration off ECS.",
  "  Buddy for two graduate engineers on the payments squad.",
  "",
  "Software Engineer — Rowan & Fell Bank, Leeds",
  "August 2019 – December 2021",
  "  Java and Spring Boot on the open banking APIs.",
  "  PostgreSQL for the account aggregation store — wrote the queries, schema was",
  "  owned by the platform team.",
  "",
  "Junior Developer — Tessellate Software, Leeds",
  "July 2018 – July 2019",
  "",
  "TECHNICAL",
  "Kotlin, Java, Go (1 year), PostgreSQL, Kubernetes, EKS, Terraform, Kafka.",
  "",
  "EDUCATION",
  "BSc Computer Science, University of Leeds, 2018.",
  "",
  "OTHER",
  "Notice period: 1 month.",
  "Salary expectation: £95,000.",
  "Right to work: Italian citizen with UK settled status.",
]

/** Reads well, has almost none of what the spec asks for. */
const dan = [
  "DAN OKAFOR",
  "Birmingham, UK | dan.okafor@example.com | 07700 900733",
  "",
  "BACKEND DEVELOPER",
  "",
  "Passionate developer with a track record of delivering high-quality,",
  "scalable solutions and driving digital transformation.",
  "",
  "EXPERIENCE",
  "",
  "Backend Developer — Merrow Retail Group, Birmingham",
  "October 2023 – present",
  "  Maintain and extend the Laravel monolith behind the e-commerce site.",
  "  Delivered a full replatforming of the checkout journey.",
  "  Work closely with stakeholders to drive business value.",
  "",
  "Developer — Foldwell Agency, Birmingham",
  "February 2021 – August 2023",
  "  Node.js and Express APIs for agency clients across retail and hospitality.",
  "  MySQL and some MongoDB. Built dashboards in React.",
  "",
  "  [Career break February 2023 – August 2023]",
  "",
  "Junior Developer — Starling Lane Web, Coventry",
  "September 2020 – January 2021",
  "  WordPress and PHP.",
  "",
  "TECHNICAL",
  "PHP, Laravel, Node.js, TypeScript, MySQL, MongoDB, React, Docker.",
  "Familiar with cloud technologies and modern development practices.",
  "",
  "EDUCATION",
  "BSc Computing, Coventry University, 2020.",
  "",
  "OTHER",
  "Notice period: 2 weeks. Available immediately for the right role.",
]

async function writePdf(lines, file) {
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54, size: "A4" })
    const stream = createWriteStream(file)
    doc.pipe(stream)
    doc.font("Helvetica").fontSize(10)
    for (const line of lines) {
      if (line === "") doc.moveDown(0.5)
      else doc.text(line, { lineGap: 1 })
    }
    doc.end()
    stream.on("finish", resolve)
    stream.on("error", reject)
  })
}

async function writeDocx(lines, file) {
  const doc = new Document({
    sections: [
      {
        children: lines.map(
          (line) =>
            new Paragraph({
              children: [new TextRun({ text: line, font: "Calibri", size: 22 })],
            }),
        ),
      },
    ],
  })
  await writeFile(file, await Packer.toBuffer(doc))
}

await mkdir(out, { recursive: true })
await writePdf(marcus, path.join(out, "marcus-ellery-cv.pdf"))
await writeDocx(sofia, path.join(out, "sofia-marchetti-cv.docx"))
await writeFile(path.join(out, "dan-okafor-cv.txt"), dan.join("\n"), "utf8")

console.log("Wrote samples/marcus-ellery-cv.pdf, sofia-marchetti-cv.docx, dan-okafor-cv.txt")
