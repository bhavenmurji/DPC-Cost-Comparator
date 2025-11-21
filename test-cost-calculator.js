import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Starting Playwright test for Cost Calculator...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture request body
  let requestBody = null;
  page.on('request', request => {
    if (request.url().includes('/api/comparison/calculate')) {
      requestBody = request.postData();
      console.log('📤 Request:', request.method(), request.url());
      console.log('📦 Request Body:', requestBody);
    }
  });

  // Capture response
  page.on('response', async response => {
    if (response.url().includes('/api/comparison/calculate')) {
      console.log('📥 Response:', response.status(), response.url());
      try {
        const data = await response.json();
        if (response.status() !== 200) {
          console.log('❌ Error Response:', JSON.stringify(data, null, 2));
        }
      } catch (e) {
        // Ignore
      }
    }
  });

  try {
    console.log('1️⃣ Navigating to http://localhost:3002...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

    console.log('2️⃣ Waiting for form to be ready...');
    await page.waitForSelector('button:has-text("Compare Costs")', { timeout: 5000 });

    console.log('\n3️⃣ Filling out the form...');

    // Get all inputs in order
    const inputs = await page.$$('input[type="number"], input[type="text"]');
    console.log(`Found ${inputs.length} input fields`);

    // Age input
    await inputs[0].click({ clickCount: 3 });
    await inputs[0].fill('32');
    console.log('  ✓ Age: 32');

    // ZIP code input
    await inputs[1].click({ clickCount: 3 });
    await inputs[1].fill('08000');
    console.log('  ✓ ZIP: 08000');

    // State select
    await page.selectOption('select', 'NJ');
    console.log('  ✓ State: NJ');

    // Annual doctor visits
    await inputs[2].click({ clickCount: 3 });
    await inputs[2].fill('4');
    console.log('  ✓ Doctor visits: 4');

    // Monthly prescriptions
    await inputs[3].click({ clickCount: 3 });
    await inputs[3].fill('1');
    console.log('  ✓ Prescriptions: 1');

    // DON'T check any chronic conditions - submit without them
    console.log('  ⏭️  Skipping chronic conditions (testing without)');

    console.log('\n4️⃣ Taking screenshot of filled form...');
    await page.screenshot({ path: '.playwright-mcp/02-filled-form.png', fullPage: true });

    console.log('\n5️⃣ Clicking "Compare Costs" button...');

    // Wait for API response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/comparison/calculate'),
      { timeout: 10000 }
    );

    // Click the button
    await page.click('button:has-text("Compare Costs")');
    console.log('  ✓ Button clicked');

    // Wait for response
    console.log('  ⏳ Waiting for API response...');
    const apiResponse = await responsePromise;
    console.log(`  ✅ API responded with status: ${apiResponse.status()}`);

    if (apiResponse.status() === 200) {
      const data = await apiResponse.json();
      console.log('\n✅ SUCCESS! Cost comparison completed');
      console.log(`💰 Annual Savings: $${data.comparison.annualSavings.toFixed(2)}`);
      console.log(`📊 Traditional: $${data.comparison.traditionalTotalAnnual}/year`);
      console.log(`📊 DPC + Catastrophic: $${data.comparison.dpcTotalAnnual}/year`);
      console.log(`🏥 Providers Found: ${data.providers.length}`);
    } else {
      console.log('\n❌ API returned error status:', apiResponse.status());
    }

    // Wait for UI to update
    await page.waitForTimeout(2000);

    console.log('\n6️⃣ Taking screenshot of results...');
    await page.screenshot({ path: '.playwright-mcp/03-results.png', fullPage: true });

    // Check page for results or errors
    const pageText = await page.textContent('body');

    if (pageText.includes('Error')) {
      const errorMatch = pageText.match(/Error[:\s]+([^\n]+)/);
      console.log('\n⚠️  Error message on page:', errorMatch ? errorMatch[1] : 'Unknown');
    }

    if (pageText.includes('Traditional Insurance') || pageText.includes('Marketplace Plan')) {
      console.log('\n✅ Results UI rendered successfully');
    }

    console.log('\n✅ Test complete! Screenshots saved to .playwright-mcp/');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: '.playwright-mcp/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
