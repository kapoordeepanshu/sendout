/**
 * Build a UK recruitment-agency prospect list from Companies House.
 *
 * Companies House publishes every registered UK company for free. SIC code
 * 78109 is "Other activities of employment placement agencies" — recruitment
 * agencies. That is a real, verifiable list of thousands of companies, which
 * beats any list someone invents for you.
 *
 * Setup:
 *   1. Register a free key: https://developer.company-information.service.gov.uk
 *   2. Put it in .env as COMPANIES_HOUSE_API_KEY
 *   3. npm run prospects
 *
 * What you get: company name, number, incorporation date, and registered
 * address. What you do NOT get is an email — Companies House does not publish
 * them. See the "Getting contacts" section of the README for that step.
 */
import "dotenv/config"
import { writeFileSync } from "node:fs"

// 78109 = employment placement agencies. 78200 = temporary employment agencies
// (staffing / contract), which is the other half of the market.
const SIC_CODES = ["78109", "78200"]
const PAGE_SIZE = 100
const MAX_PER_CODE = 1000

// Micro-agencies are the target: the owner decides, and there is no procurement.
// Companies incorporated very recently are usually pre-revenue; very old ones
// are usually large. This window is a rough filter for "established but small".
const INCORPORATED_FROM = "2012-01-01"
const INCORPORATED_TO = "2023-12-31"

interface Company {
  company_name: string
  company_number: string
  company_status: string
  date_of_creation: string
  registered_office_address?: {
    address_line_1?: string
    locality?: string
    region?: string
    postal_code?: string
  }
}

async function fetchPage(sic: string, startIndex: number, key: string): Promise<Company[]> {
  const url = new URL("https://api.company-information.service.gov.uk/advanced-search/companies")
  url.searchParams.set("sic_codes", sic)
  url.searchParams.set("company_status", "active")
  url.searchParams.set("incorporated_from", INCORPORATED_FROM)
  url.searchParams.set("incorporated_to", INCORPORATED_TO)
  url.searchParams.set("size", String(PAGE_SIZE))
  url.searchParams.set("start_index", String(startIndex))

  const res = await fetch(url, {
    headers: { Authorization: "Basic " + Buffer.from(`${key}:`).toString("base64") },
  })

  if (res.status === 429) {
    // Companies House allows 600 requests per 5 minutes. Back off and retry.
    console.log("  rate limited — waiting 30s")
    await new Promise((r) => setTimeout(r, 30_000))
    return fetchPage(sic, startIndex, key)
  }
  if (!res.ok) {
    throw new Error(`Companies House returned ${res.status}: ${await res.text()}`)
  }

  const body = (await res.json()) as { items?: Company[] }
  return body.items ?? []
}

function csvCell(value: string | undefined): string {
  const text = (value ?? "").replace(/"/g, '""')
  return /[",\n]/.test(text) ? `"${text}"` : text
}

async function main() {
  const key = process.env.COMPANIES_HOUSE_API_KEY
  if (!key) {
    console.error("Set COMPANIES_HOUSE_API_KEY in .env first.")
    console.error("Free key: https://developer.company-information.service.gov.uk")
    process.exit(1)
  }

  const rows: string[] = [
    [
      "company_name",
      "company_number",
      "incorporated",
      "address",
      "town",
      "postcode",
      "website",
      "contact_name",
      "contact_role",
      "email",
      "linkedin",
      "specialism",
      "status",
      "sent_on",
      "reply",
      "notes",
    ].join(","),
  ]

  const seen = new Set<string>()

  for (const sic of SIC_CODES) {
    console.log(`SIC ${sic}…`)
    for (let start = 0; start < MAX_PER_CODE; start += PAGE_SIZE) {
      const items = await fetchPage(sic, start, key)
      if (items.length === 0) break

      for (const company of items) {
        if (seen.has(company.company_number)) continue
        seen.add(company.company_number)

        const address = company.registered_office_address ?? {}
        rows.push(
          [
            csvCell(company.company_name),
            csvCell(company.company_number),
            csvCell(company.date_of_creation),
            csvCell(address.address_line_1),
            csvCell(address.locality ?? address.region),
            csvCell(address.postal_code),
            "", // website — enrich
            "", // contact_name — enrich
            "", // contact_role — enrich
            "", // email — enrich
            "", // linkedin — enrich
            "", // specialism — fill in from their website
            "not contacted",
            "", // sent_on
            "", // reply
            "",
          ].join(","),
        )
      }
      console.log(`  ${seen.size} companies so far`)
    }
  }

  const outPath = `data/prospects-uk-agencies.csv`
  writeFileSync(outPath, rows.join("\n"), "utf8")
  console.log(`\nWrote ${rows.length - 1} companies to ${outPath}`)
  console.log("Next: fill in website, contact_name and email — see README, 'Getting contacts'.")
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
