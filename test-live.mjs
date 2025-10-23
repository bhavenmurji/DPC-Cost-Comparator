import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Testing DPC Cost Comparator - You can watch in the browser!\n');

  // Launch browser in non-headless mode so you can see it
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down actions so you can see them
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('📍 Step 1: Opening http://localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });
    console.log('   ✅ Homepage loaded\n');
    await page.waitForTimeout(1000);

    // Fill out personal information
    console.log('📝 Step 2: Filling out personal information...');
    await page.fill('input[placeholder*="ZIP"]', '90210');
    console.log('   • ZIP Code: 90210');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="age"]', '35');
    console.log('   • Age: 35');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Family"]', '2');
    console.log('   • Family Size: 2');
    await page.waitForTimeout(500);

    await page.fill('textarea[placeholder*="chronic"]', 'Type 2 Diabetes');
    console.log('   • Chronic Conditions: Type 2 Diabetes');
    await page.screenshot({ path: 'screenshots/02-personal-info.png', fullPage: true });
    console.log('   ✅ Personal info complete\n');
    await page.waitForTimeout(1000);

    // Fill out insurance plan
    console.log('💰 Step 3: Filling out insurance plan details...');
    await page.fill('input[placeholder*="premium"]', '500');
    console.log('   • Monthly Premium: $500');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="deductible"]', '3000');
    console.log('   • Annual Deductible: $3,000');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Coinsurance"]', '20');
    console.log('   • Coinsurance: 20%');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="copay"]', '30');
    console.log('   • Average Copay: $30');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="maximum"]', '8000');
    console.log('   • Out-of-Pocket Max: $8,000');
    await page.screenshot({ path: 'screenshots/03-insurance-plan.png', fullPage: true });
    console.log('   ✅ Insurance plan complete\n');
    await page.waitForTimeout(1000);

    // Fill out healthcare usage
    console.log('🏥 Step 4: Filling out healthcare usage...');
    await page.fill('input[placeholder*="Primary Care"]', '6');
    console.log('   • Primary Care Visits: 6');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Specialist"]', '4');
    console.log('   • Specialist Visits: 4');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Urgent Care"]', '2');
    console.log('   • Urgent Care Visits: 2');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Emergency"]', '1');
    console.log('   • Emergency Room Visits: 1');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Prescriptions"]', '3');
    console.log('   • Prescriptions: 3');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Lab"]', '4');
    console.log('   • Lab Tests: 4');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Imaging"]', '2');
    console.log('   • Imaging Studies: 2');
    await page.screenshot({ path: 'screenshots/04-healthcare-usage.png', fullPage: true });
    console.log('   ✅ Healthcare usage complete\n');
    await page.waitForTimeout(1000);

    // Click compare button
    console.log('🔍 Step 5: Clicking "Compare Costs" button...');
    const compareButton = page.locator('button:has-text("Compare Costs")');
    await compareButton.click();
    console.log('   • Button clicked, waiting for results...\n');

    // Wait for response
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/05-results.png', fullPage: true });

    // Check for results or errors
    const pageContent = await page.content();
    const hasError = pageContent.toLowerCase().includes('error occurred');
    const hasComparison = pageContent.includes('comparison') || pageContent.includes('scenario');

    if (hasError) {
      console.log('❌ ERROR DETECTED!');
      const errorElement = page.locator('text=/error/i').first();
      const errorText = await errorElement.textContent().catch(() => 'Could not read error');
      console.log('   Error message:', errorText);
      console.log('\n📋 Checking backend logs for details...');
    } else if (hasComparison) {
      console.log('✅ SUCCESS! Cost comparison results displayed!');
      console.log('   • Results are showing on the page');
      console.log('   • Check the browser window to see the comparison');
    } else {
      console.log('⚠️  Page loaded but checking for data...');
      console.log('   • The page responded');
      console.log('   • Check the browser to see what\'s displayed');
    }

    console.log('\n📸 Screenshots saved:');
    console.log('   • screenshots/01-homepage.png');
    console.log('   • screenshots/02-personal-info.png');
    console.log('   • screenshots/03-insurance-plan.png');
    console.log('   • screenshots/04-healthcare-usage.png');
    console.log('   • screenshots/05-results.png');

    console.log('\n✨ Test complete! Browser will stay open for 30 seconds so you can review...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('   Stack:', error.stack);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
    console.log('\n📸 Error screenshot saved to: screenshots/error.png');
  } finally {
    console.log('\n👋 Closing browser...');
    await browser.close();
  }
})();
