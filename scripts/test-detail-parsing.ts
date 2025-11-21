import axios from 'axios'
import * as cheerio from 'cheerio'

async function testDetailParsing() {
  const testId = 'aaetqgycsnre' // Preferred Family Medicine
  const practiceUrl = `https://mapper.dpcfrontier.com/practice/${testId}`

  console.log(`Testing URL: ${practiceUrl}\n`)

  try {
    const response = await axios.get(practiceUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    // Extract and properly parse __NEXT_DATA__
    const nextDataScript = $('script#__NEXT_DATA__').html()
    if (nextDataScript) {
      try {
        // Clean the JSON - sometimes there are HTML entities
        const cleanedJson = nextDataScript
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')

        const nextData = JSON.parse(cleanedJson)
        console.log('=== NEXT.JS DATA ===')
        console.log(JSON.stringify(nextData.pageProps, null, 2))
      } catch (e: any) {
        console.error('Error parsing Next.js data:', e.message)
      }
    }

    // Extract JSON-LD
    const jsonLdScript = $('script[type="application/ld+json"]').html()
    if (jsonLdScript) {
      try {
        const jsonLd = JSON.parse(jsonLdScript)
        console.log('\n=== JSON-LD STRUCTURED DATA ===')
        console.log(JSON.stringify(jsonLd, null, 2))
      } catch (e: any) {
        console.error('Error parsing JSON-LD:', e.message)
      }
    }

    // Extract all visible text content in sections
    console.log('\n=== VISIBLE PAGE STRUCTURE ===')
    console.log('H1:', $('h1').first().text())
    console.log('H2 headings:', $('h2').map((i, el) => $(el).text()).get())

    // Look for pricing info
    const bodyText = $('body').text()
    const priceMatches = bodyText.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g)
    if (priceMatches) {
      console.log('\nFound potential prices:', priceMatches.slice(0, 20))
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

testDetailParsing()
