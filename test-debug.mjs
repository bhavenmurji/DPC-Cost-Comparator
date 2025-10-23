import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Debugging frontend results display\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  // Capture console logs
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[Browser ${type}]:`, text);
  });

  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`📤 API Request: ${request.method()} ${request.url()}`);
      if (request.postData()) {
        console.log(`   Body: ${request.postData().substring(0, 200)}`);
      }
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      console.log(`📥 API Response: ${response.status()} ${response.url()}`);
      try {
        const body = await response.text();
        console.log(`   Response: ${body.substring(0, 300)}`);
      } catch (e) {
        console.log('   Could not read response body');
      }
    }
  });

  try {
    console.log('Opening http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('\n📝 Filling form and clicking Compare Costs...\n');
    const zipInput = await page.locator('input').first();
    await zipInput.click();
    await zipInput.fill('90210');

    const compareButton = await page.getByRole('button', { name: /compare costs/i });
    await compareButton.click();

    console.log('\n⏳ Waiting 5 seconds for results...\n');
    await page.waitForTimeout(5000);

    // Check for results tab
    try {
      const resultsTab = await page.getByRole('tab', { name: /view results/i });
      console.log('✅ Found "View Results" tab, clicking it...');
      await resultsTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/05-results-shown.png', fullPage: true });
      console.log('📸 Screenshot saved: 05-results-shown.png');
    } catch (e) {
      console.log('⚠️  Could not find "View Results" tab');
      await page.screenshot({ path: 'screenshots/05-no-results-tab.png', fullPage: true });
      console.log('📸 Screenshot saved: 05-no-results-tab.png');
    }

    // Check page content
    const pageText = await page.textContent('body');
    console.log('\n📄 Page contains keywords:');
    console.log('  - "error":', pageText.toLowerCase().includes('error'));
    console.log('  - "results":', pageText.toLowerCase().includes('results'));
    console.log('  - "savings":', pageText.toLowerCase().includes('savings'));
    console.log('  - "comparison":', pageText.toLowerCase().includes('comparison'));

    console.log('\n⏳ Keeping browser open for 15 seconds...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/debug-error.png', fullPage: true });
  } finally {
    console.log('\n👋 Closing browser...');
    await browser.close();
  }
})();
