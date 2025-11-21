import axios from 'axios'
import * as cheerio from 'cheerio'

async function extractFullDetails() {
  const testIds = ['aaetqgycsnre', 'aanbwfyumqga', 'aaubzigwvont']

  for (const testId of testIds) {
    const practiceUrl = `https://mapper.dpcfrontier.com/practice/${testId}`
    console.log(`\n${'='.repeat(80)}`)
    console.log(`Testing: ${practiceUrl}`)

    try {
      const response = await axios.get(practiceUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      })

      const $ = cheerio.load(response.data)

      // Extract JSON-LD
      const jsonLdScript = $('script[type="application/ld+json"]').html()
      let jsonLd: any = null
      if (jsonLdScript) {
        try {
          jsonLd = JSON.parse(jsonLdScript)
        } catch (e) {
          console.error('Could not parse JSON-LD')
        }
      }

      if (jsonLd) {
        console.log('\n📋 Basic Info:')
        console.log('  Name:', jsonLd.name || 'N/A')
        console.log('  Description:', jsonLd.description || 'N/A')
        console.log('  Website:', jsonLd.url || 'N/A')
        console.log('  Phone:', jsonLd.telephone || 'N/A')
        console.log('  Fax:', jsonLd.faxNumber || 'N/A')
        console.log('  Specialty:', jsonLd.medicalSpecialty || 'N/A')

        if (jsonLd.address) {
          console.log('\n📍 Address:')
          console.log('  Street:', jsonLd.address.streetAddress || 'N/A')
          console.log('  City:', jsonLd.address.addressLocality || 'N/A')
          console.log('  State:', jsonLd.address.addressRegion || 'N/A')
          console.log('  ZIP:', jsonLd.address.postalCode || 'N/A')
        }

        if (jsonLd.geo) {
          console.log('\n🗺️  Coordinates:')
          console.log('  Latitude:', jsonLd.geo.latitude)
          console.log('  Longitude:', jsonLd.geo.longitude)
        }
      }

      // Try to extract pricing from page content
      console.log('\n💰 Looking for pricing information...')

      // Look for common pricing patterns
      const bodyText = $('body').text()
      const allText = bodyText.replace(/\s+/g, ' ')

      // Try to find membership/monthly fees
      const monthlyFeePatterns = [
        /monthly[^$]*\$\s*(\d+)/i,
        /\$\s*(\d+)\s*(?:\/|\s)month/i,
        /membership[^$]*\$\s*(\d+)/i,
        /individual[^$]*\$\s*(\d+)/i,
      ]

      for (const pattern of monthlyFeePatterns) {
        const match = allText.match(pattern)
        if (match) {
          console.log(`  Found potential monthly fee: $${match[1]}`)
        }
      }

      // Try to find annual fees
      const annualFeePatterns = [
        /annual[^$]*\$\s*(\d+)/i,
        /\$\s*(\d+)\s*(?:\/|\s)year/i,
        /yearly[^$]*\$\s*(\d+)/i,
      ]

      for (const pattern of annualFeePatterns) {
        const match = allText.match(pattern)
        if (match) {
          console.log(`  Found potential annual fee: $${match[1]}`)
        }
      }

      // Look for enrollment/registration fees
      const enrollmentPatterns = [
        /enrollment[^$]*\$\s*(\d+)/i,
        /registration[^$]*\$\s*(\d+)/i,
        /sign(?:-|\s)?up[^$]*\$\s*(\d+)/i,
      ]

      for (const pattern of enrollmentPatterns) {
        const match = allText.match(pattern)
        if (match) {
          console.log(`  Found potential enrollment fee: $${match[1]}`)
        }
      }

      // Look for physician names
      console.log('\n👨‍⚕️ Looking for physicians...')
      const doctorPatterns = [
        /(?:Dr\.?|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:M\.?D\.?|D\.?O\.?|M\.?D\.?,?\s+Ph\.?D\.?)/gi,
      ]

      const foundDoctors = new Set<string>()
      for (const pattern of doctorPatterns) {
        let match
        while ((match = pattern.exec(allText)) !== null) {
          if (match[1]) {
            foundDoctors.add(match[1].trim())
          }
        }
      }

      if (foundDoctors.size > 0) {
        console.log('  Found physicians:', Array.from(foundDoctors))
      }

      // Look for email addresses
      console.log('\n📧 Looking for email...')
      const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
      const emails = new Set<string>()
      let emailMatch
      while ((emailMatch = emailPattern.exec(bodyText)) !== null) {
        // Filter out common junk emails
        const email = emailMatch[1].toLowerCase()
        if (!email.includes('example.com') && !email.includes('test.com')) {
          emails.add(email)
        }
      }
      if (emails.size > 0) {
        console.log('  Found emails:', Array.from(emails))
      }

      // Look for accepting patients status
      console.log('\n✅ Accepting new patients?')
      const acceptingPatterns = [
        /accepting\s+new\s+patients/i,
        /not\s+accepting/i,
        /waitlist/i,
      ]

      for (const pattern of acceptingPatterns) {
        if (pattern.test(allText)) {
          console.log(`  Match: ${pattern}`)
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error: any) {
      console.error('Error:', error.message)
    }
  }
}

extractFullDetails()
