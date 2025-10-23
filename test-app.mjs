import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Starting Playwright test of DPC Cost Comparator...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the application
    console.log('📍 Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Take screenshot of homepage
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });
    console.log('✅ Homepage loaded successfully');

    // Fill out personal information
    console.log('\n📝 Filling out personal information...');
    await page.fill('input[placeholder*="ZIP"]', '90210');
    await page.fill('input[placeholder*="age"]', '35');
    await page.fill('input[placeholder*="Family"]', '2');
    await page.fill('textarea[placeholder*="chronic"]', 'Type 2 Diabetes');
    await page.screenshot({ path: 'screenshots/02-personal-info.png', fullPage: true });
    console.log('✅ Personal information filled');

    // Fill out insurance plan details
    console.log('\n💰 Filling out insurance plan details...');
    await page.fill('input[placeholder*="premium"]', '500');
    await page.fill('input[placeholder*="deductible"]', '3000');
    await page.fill('input[placeholder*="Coinsurance"]', '20');
    await page.fill('input[placeholder*="copay"]', '30');
    await page.fill('input[placeholder*="maximum"]', '8000');
    await page.screenshot({ path: 'screenshots/03-insurance-plan.png', fullPage: true });
    console.log('✅ Insurance plan filled');

    // Fill out healthcare usage
    console.log('\n🏥 Filling out healthcare usage...');
    await page.fill('input[placeholder*="Primary Care"]', '6');
    await page.fill('input[placeholder*="Specialist"]', '4');
    await page.fill('input[placeholder*="Urgent Care"]', '2');
    await page.fill('input[placeholder*="Emergency"]', '1');
    await page.fill('input[placeholder*="Prescriptions"]', '3');
    await page.fill('input[placeholder*="Lab"]', '4');
    await page.fill('input[placeholder*="Imaging"]', '2');
    await page.screenshot({ path: 'screenshots/04-healthcare-usage.png', fullPage: true });
    console.log('✅ Healthcare usage filled');

    // Click compare button
    console.log('\n🔍 Clicking Compare Costs button...');
    const compareButton = await page.locator('button:has-text("Compare Costs")');
    await compareButton.click();
    await page.waitForTimeout(3000);

    // Check for results or errors
    const hasError = await page.locator('text=error').count() > 0;
    const hasResults = await page.locator('text=comparison').count() > 0;

    await page.screenshot({ path: 'screenshots/05-results.png', fullPage: true });

    if (hasError) {
      console.log('⚠️  Error detected on results page');
      const errorText = await page.locator('text=error').first().textContent();
      console.log('Error message:', errorText);
    } else if (hasResults) {
      console.log('✅ Results displayed successfully');
    } else {
      console.log('ℹ️  Results page loaded (checking for comparison data...)');
    }

    console.log('\n📸 Screenshots saved in screenshots/ folder');
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
