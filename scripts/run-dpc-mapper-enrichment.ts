import { dpcMapperEnricher } from '../apps/api/src/services/dpcMapperEnricher.service'

async function main() {
  const args = process.argv.slice(2)
  const limit = args[0] ? parseInt(args[0]) : undefined
  const startFrom = args[1] ? parseInt(args[1]) : 0

  console.log('DPC Mapper Provider Enrichment')
  console.log('================================\n')

  if (limit) {
    console.log(`Limit: ${limit} providers`)
  } else {
    console.log('Limit: ALL providers')
  }
  console.log(`Start from: ${startFrom}\n`)

  // Generate before report
  console.log('Before enrichment:')
  const beforeReport = await dpcMapperEnricher.generateReport()
  console.log(`Total providers: ${beforeReport.total}`)
  console.log(`Enriched providers: ${beforeReport.enriched}`)
  console.log(`Placeholder providers: ${beforeReport.placeholder}`)
  console.log(`With phone: ${beforeReport.withPhone}`)
  console.log(`With website: ${beforeReport.withWebsite}`)
  console.log(`Avg quality score: ${beforeReport.avgQualityScore.toFixed(2)}\n`)

  // Run enrichment
  await dpcMapperEnricher.enrichAllProviders({
    limit,
    startFrom,
    skipExisting: true, // Only enrich providers with placeholder names
  })

  // Generate after report
  console.log('\n\nAfter enrichment:')
  const afterReport = await dpcMapperEnricher.generateReport()
  console.log(`Total providers: ${afterReport.total}`)
  console.log(`Enriched providers: ${afterReport.enriched}`)
  console.log(`Placeholder providers: ${afterReport.placeholder}`)
  console.log(`With phone: ${afterReport.withPhone}`)
  console.log(`With website: ${afterReport.withWebsite}`)
  console.log(`Avg quality score: ${afterReport.avgQualityScore.toFixed(2)}\n`)

  // Show improvements
  console.log('Improvements:')
  console.log(`Newly enriched: ${afterReport.enriched - beforeReport.enriched}`)
  console.log(`New phones added: ${afterReport.withPhone - beforeReport.withPhone}`)
  console.log(`New websites added: ${afterReport.withWebsite - beforeReport.withWebsite}`)
  console.log(
    `Quality score improvement: ${(afterReport.avgQualityScore - beforeReport.avgQualityScore).toFixed(2)}`
  )
}

main()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
