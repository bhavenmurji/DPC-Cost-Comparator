import axios from 'axios'
import * as cheerio from 'cheerio'

async function testDPCFrontierAPI() {
  try {
    console.log('Testing DPC Frontier API access...\n')

    // Step 1: Get the homepage and extract buildId
    const baseUrl = 'https://mapper.dpcfrontier.com'
    console.log('Fetching homepage...')
    const homepageResponse = await axios.get(baseUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; DPC-Cost-Comparator/1.0; +https://github.com/bhavenmurji/DPC-Cost-Comparator)',
      },
    })

    const $ = cheerio.load(homepageResponse.data)
    const nextDataScript = $('script#__NEXT_DATA__').html()
    if (!nextDataScript) {
      throw new Error('Could not find __NEXT_DATA__ script tag')
    }

    const nextData = JSON.parse(nextDataScript)
    const buildId = nextData.buildId
    const inlineProps = nextData.props?.pageProps?.practices || []

    console.log(`Found buildId: ${buildId}`)
    console.log(`Found ${inlineProps.length} practices in inline data`)

    // Show sample inline practice
    if (inlineProps.length > 0) {
      console.log('\nSample inline practice:')
      console.log(JSON.stringify(inlineProps[0], null, 2))
    }

    // Step 2: Try the JSON API
    const apiUrl = `${baseUrl}/_next/data/${buildId}/index.json`
    console.log(`\nFetching JSON API: ${apiUrl}`)

    const apiResponse = await axios.get(apiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; DPC-Cost-Comparator/1.0; +https://github.com/bhavenmurji/DPC-Cost-Comparator)',
      },
    })

    const apiPractices = apiResponse.data?.pageProps?.practices || []
    console.log(`Found ${apiPractices.length} practices from JSON API`)

    // Show sample API practice
    if (apiPractices.length > 0) {
      console.log('\nSample API practice:')
      console.log(JSON.stringify(apiPractices[0], null, 2))
    }

    // Analyze data structure
    console.log('\nData structure analysis:')
    console.log('Available fields:', Object.keys(apiPractices[0] || {}))

    // Check if there's more detailed data available
    console.log('\nField mapping:')
    const sample = apiPractices[0] || {}
    console.log('- l (latitude):', sample.l)
    console.log('- g (longitude):', sample.g)
    console.log('- k (kind/type):', sample.k)
    console.log('- o (onsite):', sample.o)
    console.log('- i (id):', sample.i)
    console.log('- p (practice id?):', sample.p)

    // Count by type
    console.log('\nPractices by type:')
    const typeCount = apiPractices.reduce((acc: any, p: any) => {
      const type = p.k || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
    console.log(JSON.stringify(typeCount, null, 2))

    console.log('\n✅ API test complete!')
    console.log('\nConclusion:')
    console.log('The API only provides minimal data (coordinates, type, onsite status).')
    console.log('No detailed provider info (names, addresses, phone, website, pricing) available.')
    console.log('To get detailed data, we would need to find an alternative source.')
  } catch (error) {
    console.error('Error testing DPC Frontier API:', error)
  }
}

testDPCFrontierAPI()
