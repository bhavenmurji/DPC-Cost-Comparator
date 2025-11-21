import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Create screenshots directory
  const screenshotDir = path.join(__dirname, '.playwright-mcp');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  console.log('Step 1: Navigate to homepage...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(screenshotDir, 'posthog-01-homepage.png'), fullPage: true });
  console.log('✓ Homepage loaded - pageview event should fire');

  console.log('\nStep 2: Fill comparison form...');
  // Wait for form to be visible
  await page.waitForSelector('text=Personal Information', { timeout: 10000 });

  // Age is already filled with 35, clear and refill
  const ageInput = page.locator('label:has-text("Age") + input, input[value="35"]').first();
  await ageInput.clear();
  await ageInput.fill('35');

  // Fill ZIP code
  const zipInput = page.locator('label:has-text("ZIP Code") + input').first();
  await zipInput.clear();
  await zipInput.fill('90210');

  // Select state - using the shadcn select component
  const stateButton = page.locator('#state').first();
  await stateButton.click();
  await page.waitForTimeout(500);
  // State is shown as "CA" not "California"
  await page.locator('[role="option"]:has-text("CA")').first().click();

  // Annual Doctor Visits is already filled with 4, clear and refill
  const visitsInput = page.locator('label:has-text("Annual Doctor Visits") + input').first();
  await visitsInput.clear();
  await visitsInput.fill('4');

  // Fill Monthly Prescriptions
  const prescriptionInput = page.locator('label:has-text("Monthly Prescriptions") + input').first();
  await prescriptionInput.clear();
  await prescriptionInput.fill('2');

  await page.screenshot({ path: path.join(screenshotDir, 'posthog-02-filled-form.png'), fullPage: true });
  console.log('✓ Form filled');

  console.log('\nStep 3: Submit form and wait for results...');
  const submitButton = page.locator('button:has-text("Compare Costs")').first();
  await submitButton.click();

  // Wait for results to load
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(screenshotDir, 'posthog-03-comparison-results.png'), fullPage: true });
  console.log('✓ Results loaded - comparison_calculated event should fire');

  console.log('\nStep 4: Navigate to Find Providers section...');
  // Look for provider search link or button
  const providerLink = await page.locator('a:has-text("Provider"), a:has-text("Find"), button:has-text("Provider")').first();
  await providerLink.click();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(screenshotDir, 'posthog-04-provider-search-page.png'), fullPage: true });
  console.log('✓ Provider search page loaded - pageview event should fire');

  console.log('\nStep 5: Search for providers with ZIP 90210...');
  // ZIP is already filled, just need to wait for search to complete
  // Wait for loading indicator to disappear and results to appear
  try {
    await page.waitForSelector('text=Searching for providers', { state: 'hidden', timeout: 15000 });
  } catch (e) {
    console.log('  (Search already completed)');
  }

  // Wait for results or "no results" message
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(screenshotDir, 'posthog-05-provider-results.png'), fullPage: true });
  console.log('✓ Provider results loaded - provider_search event should fire');

  console.log('\nStep 6: Looking for provider cards...');
  // Check if there are provider cards or if we need to switch to list view
  const hasProviders = await page.locator('[data-testid*="provider"], .provider-card, article').count();

  if (hasProviders > 0) {
    console.log(`  Found ${hasProviders} provider elements`);
    const firstProvider = page.locator('[data-testid*="provider"], .provider-card, article').first();
    await firstProvider.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, 'posthog-06-provider-details.png'), fullPage: true });
    console.log('✓ Provider details loaded - provider_viewed event should fire');
  } else {
    console.log('  No provider cards found - checking for list view or map view');
    await page.screenshot({ path: path.join(screenshotDir, 'posthog-06-no-providers.png'), fullPage: true });
  }

  console.log('\nStep 7: Check for contact buttons (phone/website)...');
  const contactButtons = await page.locator('a[href^="tel:"], a[href^="http"], button:has-text("Call"), button:has-text("Website")').count();
  if (contactButtons > 0) {
    await page.screenshot({ path: path.join(screenshotDir, 'posthog-07-contact-buttons.png'), fullPage: true });
    console.log('✓ Contact buttons found - provider_contact event would fire on click');
  }

  console.log('\n=== PostHog Analytics Test Complete ===');
  console.log('\nExpected Events Fired:');
  console.log('1. pageview (homepage)');
  console.log('2. comparison_calculated (after form submission)');
  console.log('3. pageview (provider search page)');
  console.log('4. provider_search (after searching providers)');
  console.log('5. provider_viewed (after clicking provider card)');
  console.log('6. provider_contact (if phone/website clicked)');

  console.log('\nScreenshots saved to:', screenshotDir);

  await browser.close();
})();
