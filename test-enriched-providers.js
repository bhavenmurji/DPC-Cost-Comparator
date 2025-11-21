import { chromium } from 'playwright';
import { setTimeout } from 'timers/promises';

(async () => {
  console.log('🎭 Starting Playwright test for enriched provider data...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800  // Slow down so we can see what's happening
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Navigate to the homepage
    console.log('📍 Step 1: Navigate to homepage');
    await page.goto('http://localhost:3000');
    await setTimeout(2000);

    // Take screenshot of homepage
    await page.screenshot({ path: '.playwright-mcp/01-homepage-loaded.png' });
    console.log('  ✅ Homepage loaded\n');

    // Navigate to Provider Search
    console.log('📍 Step 2: Navigate to Provider Search page');
    await page.click('a[href="/providers"]');
    await setTimeout(2000);
    await page.screenshot({ path: '.playwright-mcp/02-provider-search-page.png' });
    console.log('  ✅ Provider Search page loaded\n');

    // Fill in ZIP code and search
    console.log('📍 Step 3: Search for providers in Los Angeles (90210)');
    await page.fill('input[name="zipCode"], input[placeholder*="ZIP"], input[type="text"]', '90210');
    await setTimeout(500);

    // Select state if dropdown exists
    const stateSelect = await page.$('select[name="state"]');
    if (stateSelect) {
      await page.selectOption('select[name="state"]', 'CA');
      await setTimeout(500);
    }

    // Click search button
    await page.click('button:has-text("Search"), button:has-text("Find Providers")');
    console.log('  🔍 Searching for providers...');

    // Wait for results
    await setTimeout(3000);
    await page.screenshot({ path: '.playwright-mcp/03-search-results.png' });

    // Check for provider cards or list items
    console.log('\n📍 Step 4: Checking for real provider names...');

    const providerCards = await page.$$('[class*="provider"], [class*="card"], .provider-card, article');
    console.log(`  Found ${providerCards.length} potential provider elements\n`);

    // Look for real provider names in the page text
    const pageText = await page.textContent('body');

    const realProviderPatterns = [
      'Preferred Family Medicine',
      'Campbell Family Medicine',
      'Health',
      'Medical',
      'Care',
      'Clinic',
      'DPC',
      'Direct Primary',
      'Family Medicine'
    ];

    const mockPatternFound = pageText.includes('DPC Practice');
    const hasRealNames = realProviderPatterns.some(pattern =>
      pageText.includes(pattern) && !pageText.includes('DPC Practice')
    );

    console.log('  📊 Results Analysis:');
    console.log(`    - Mock provider names found: ${mockPatternFound ? '❌ YES (bad)' : '✅ NO (good)'}`);
    console.log(`    - Real provider names found: ${hasRealNames ? '✅ YES (good)' : '❌ NO (bad)'}`);

    // Look for contact info (phone numbers, websites)
    const hasPhoneNumbers = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(pageText);
    const hasWebsites = /https?:\/\/|www\./.test(pageText);

    console.log(`    - Phone numbers displayed: ${hasPhoneNumbers ? '✅ YES' : '❌ NO'}`);
    console.log(`    - Websites displayed: ${hasWebsites ? '✅ YES' : '❌ NO'}\n`);

    // Test the cost calculator with real provider recommendations
    console.log('📍 Step 5: Testing cost calculator with provider search');
    await page.goto('http://localhost:3000');
    await setTimeout(2000);

    // Fill out comparison form
    console.log('  📝 Filling out comparison form...');
    await page.fill('input[name="age"]', '35');
    await page.fill('input[name="zipCode"]', '90210');
    await page.selectOption('select[name="state"]', 'CA');
    await page.fill('input[name="annualDoctorVisits"]', '4');
    await page.fill('input[name="prescriptionCount"], input[name="monthlyPrescriptions"]', '2');

    await page.screenshot({ path: '.playwright-mcp/04-form-filled.png' });

    // Submit form and wait for results
    console.log('  ⏳ Submitting comparison...');
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/comparison/calculate') && response.status() === 200,
      { timeout: 10000 }
    );

    await page.click('button:has-text("Compare")');

    const apiResponse = await responsePromise;
    const responseData = await apiResponse.json();

    console.log('\n  ✅ API Response received!');
    console.log(`     Status: ${apiResponse.status()}`);
    console.log(`     Providers found: ${responseData.nearbyProviders?.length || 0}\n`);

    // Wait for results to render
    await setTimeout(3000);
    await page.screenshot({ path: '.playwright-mcp/05-comparison-results.png' });

    // Check if real provider names appear in results
    const resultsText = await page.textContent('body');
    const providersInResults = responseData.nearbyProviders || [];

    console.log('📍 Step 6: Verifying real provider data in results...');
    console.log(`  Providers returned by API: ${providersInResults.length}`);

    if (providersInResults.length > 0) {
      console.log('\n  Sample providers from API:');
      providersInResults.slice(0, 5).forEach((provider, i) => {
        console.log(`    ${i + 1}. ${provider.name}`);
        if (provider.phone) console.log(`       Phone: ${provider.phone}`);
        if (provider.website) console.log(`       Website: ${provider.website}`);
        if (provider.monthlyFee) console.log(`       Fee: $${provider.monthlyFee}/month`);
      });
    }

    // Final verification
    console.log('\n' + '='.repeat(60));
    console.log('FINAL VERIFICATION RESULTS');
    console.log('='.repeat(60));

    const hasRealProviderData = providersInResults.length > 0 &&
                                providersInResults.some(p => !p.name.startsWith('DPC Practice'));

    const hasContactInfo = providersInResults.some(p => p.phone || p.website);
    const hasPricing = providersInResults.some(p => p.monthlyFee && p.monthlyFee > 0);

    console.log(`✅ Real provider names: ${hasRealProviderData ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Contact information: ${hasContactInfo ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Pricing data: ${hasPricing ? 'PASS' : 'FAIL'}`);
    console.log('='.repeat(60));

    if (hasRealProviderData && hasContactInfo && hasPricing) {
      console.log('\n🎉 SUCCESS! Enriched provider data is working correctly!\n');
    } else {
      console.log('\n⚠️  WARNING: Some enriched data may not be displaying correctly.\n');
    }

    // Keep browser open for 10 seconds to review
    console.log('⏱️  Keeping browser open for 10 seconds for review...');
    await setTimeout(10000);

  } catch (error) {
    console.error('\n❌ Error during testing:');
    console.error(error.message);
    await page.screenshot({ path: '.playwright-mcp/error-enrichment-test.png' });
  } finally {
    await browser.close();
    console.log('\n✅ Test complete!');
  }
})();
