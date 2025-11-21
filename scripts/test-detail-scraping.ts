import axios from 'axios'
import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDetailScraping() {
  try {
    // Get 10 sample provider IDs
    const providers = await prisma.dPCProvider.findMany({
      select: { id: true, name: true },
      take: 10,
    })

    console.log(`Testing scraping for ${providers.length} providers...\n`)

    for (const provider of providers) {
      const practiceUrl = `https://mapper.dpcfrontier.com/practice/${provider.id}`
      console.log(`\n${'='.repeat(80)}`)
      console.log(`Provider ID: ${provider.id}`)
      console.log(`Current name: ${provider.name}`)
      console.log(`Testing URL: ${practiceUrl}`)

      try {
        const response = await axios.get(practiceUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          timeout: 10000,
          validateStatus: (status) => status < 500, // Accept 404s as valid responses
        })

        console.log(`Status Code: ${response.status}`)
        console.log(`Response Length: ${response.data.length} bytes`)

        if (response.status === 404) {
          console.log('❌ Page not found (404)')
          continue
        }

        // Parse HTML
        const $ = cheerio.load(response.data)

        // Try to find practice name
        const pageTitle = $('title').text()
        const h1 = $('h1').first().text()
        const h2 = $('h2').first().text()

        console.log(`\nPage Title: ${pageTitle}`)
        console.log(`First H1: ${h1}`)
        console.log(`First H2: ${h2}`)

        // Look for common patterns
        console.log(`\nSearching for data patterns...`)

        // Check for Next.js data
        const nextData = $('script#__NEXT_DATA__').html()
        if (nextData) {
          console.log('✅ Found __NEXT_DATA__ script')
          try {
            const data = JSON.parse(nextData)
            console.log('Next.js pageProps:', JSON.stringify(data.pageProps, null, 2).substring(0, 500))
          } catch (e) {
            console.log('Could not parse Next.js data')
          }
        }

        // Check for JSON-LD structured data
        const jsonLd = $('script[type="application/ld+json"]').html()
        if (jsonLd) {
          console.log('✅ Found JSON-LD structured data')
          try {
            const data = JSON.parse(jsonLd)
            console.log('JSON-LD data:', JSON.stringify(data, null, 2).substring(0, 500))
          } catch (e) {
            console.log('Could not parse JSON-LD')
          }
        }

        // Look for common class patterns
        const possibleNames = [
          $('.practice-name').text(),
          $('.provider-name').text(),
          $('[class*="name"]').first().text(),
          $('[class*="practice"]').first().text(),
        ]

        console.log(`\nPossible name elements:`, possibleNames.filter(Boolean))

        // Save a sample of the HTML
        console.log(`\nFirst 1000 chars of body:`)
        console.log($('body').html()?.substring(0, 1000))

        // Wait 2 seconds before next request (respectful scraping)
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error: any) {
        console.log(`❌ Error: ${error.message}`)
        if (error.response) {
          console.log(`Response status: ${error.response.status}`)
        }
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDetailScraping()
