import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Take screenshot of initial page
    await page.screenshot({ path: '.playwright-mcp/shadcn-initial.png', fullPage: true });
    console.log('Screenshot saved: shadcn-initial.png');
    
    // Fill out the form with your ZIP code
    console.log('Filling out form...');
    await page.fill('input#age', '35');
    await page.fill('input#zipCode', '08080');
    
    // Click the state select
    await page.click('button[id="state"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.playwright-mcp/shadcn-state-dropdown.png' });
    console.log('Screenshot saved: shadcn-state-dropdown.png');
    
    // Select NJ
    await page.click('text=NJ');
    await page.waitForTimeout(500);
    
    // Fill health information
    await page.fill('input#doctorVisits', '4');
    await page.fill('input#prescriptions', '2');
    
    // Check some chronic conditions
    await page.click('label:has-text("Diabetes")');
    await page.click('label:has-text("Hypertension")');
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '.playwright-mcp/shadcn-form-filled.png', fullPage: true });
    console.log('Screenshot saved: shadcn-form-filled.png');
    
    // Click Compare Costs button
    console.log('Submitting form...');
    await page.click('button[type="submit"]');
    
    // Wait for results
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '.playwright-mcp/shadcn-results.png', fullPage: true });
    console.log('Screenshot saved: shadcn-results.png');
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: '.playwright-mcp/shadcn-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
