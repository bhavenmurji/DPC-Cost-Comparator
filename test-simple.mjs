import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Testing DPC Cost Comparator - Watch the browser!\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down so you can see each action
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log('📍 Step 1: Opening http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('   ✅ Page loaded!\n');
    await page.waitForTimeout(2000);

    // Take screenshot of homepage with form
    await page.screenshot({ path: 'screenshots/01-form-ready.png', fullPage: true });
    console.log('📸 Screenshot saved: Form is visible with default values\n');

    // The form already has default values, so let's just update the ZIP code
    console.log('📝 Step 2: Entering ZIP code...');
    const zipInput = await page.locator('input').first();
    await zipInput.click();
    await zipInput.fill('90210');
    console.log('   ✅ ZIP Code entered: 90210\n');
    await page.waitForTimeout(1000);

    // Find and click the Compare Costs button
    console.log('🔍 Step 3: Looking for "Compare Costs" button...');
    const compareButton = await page.getByRole('button', { name: /compare costs/i });
    await compareButton.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'screenshots/02-before-click.png', fullPage: true });
    console.log('   ✅ Button found!\n');

    console.log('🖱️  Step 4: Clicking "Compare Costs" button...');
    await compareButton.click();
    console.log('   ✅ Button clicked! Waiting for results...\n');

    // Wait for response
    await page.waitForTimeout(3000);

    // Take screenshot after clicking
    await page.screenshot({ path: 'screenshots/03-after-click.png', fullPage: true });

    // Check what happened
    const pageContent = await page.content();
    const hasError = pageContent.toLowerCase().includes('error');
    const hasResults = pageContent.includes('scenario') || pageContent.includes('comparison') || pageContent.includes('savings');

    console.log('📊 Step 5: Checking results...');
    if (hasError) {
      console.log('   ❌ Error detected on page');
      const errorDiv = await page.locator('text=/error/i').first();
      const errorText = await errorDiv.textContent().catch(() => 'Could not read error');
      console.log('   Error message:', errorText);
    } else if (hasResults) {
      console.log('   ✅ SUCCESS! Results are showing!');
      console.log('   Look at the browser - you should see cost comparisons!');
    } else {
      console.log('   ⚠️  Page responded but checking for results tab...');
      // Try to click results tab
      try {
        const resultsTab = await page.getByRole('tab', { name: /view results/i });
        await resultsTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/04-results-tab.png', fullPage: true });
        console.log('   ✅ Switched to Results tab!');
      } catch (e) {
        console.log('   Could not find results tab');
      }
    }

    console.log('\n📸 Screenshots saved to screenshots/ folder');
    console.log('   • 01-form-ready.png - Form with default values');
    console.log('   • 02-before-click.png - Before clicking button');
    console.log('   • 03-after-click.png - After clicking button');
    console.log('   • 04-results-tab.png - Results tab (if found)');

    console.log('\n⏳ Browser will stay open for 30 seconds so you can review...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    console.log('\n👋 Closing browser...');
    await browser.close();
  }
})();
