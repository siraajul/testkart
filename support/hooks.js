// ══════════════════════════════════════════════
// hooks.js — Cucumber Lifecycle Hooks
// TestKart — BDD + POM Automation Framework
// ══════════════════════════════════════════════
// Before: Launch browser before each scenario
// After: Capture screenshot on failure + teardown browser
// AfterAll: Print summary banner

const { Before, After, AfterAll, Status } = require('@cucumber/cucumber');
const fs = require('fs');
require('dotenv').config();

// ──────────────────────────────────────────────
// Before Hook — Browser Launch
// ──────────────────────────────────────────────

Before({ timeout: 60000 }, async function () {
  await this.launchBrowser();
});

// ──────────────────────────────────────────────
// After Hook — Screenshot on Failure + Teardown
// ──────────────────────────────────────────────

After({ timeout: 30000 }, async function (scenario) {
  // Capture screenshot if scenario failed
  if (scenario.result.status === Status.FAILED) {
    const scenarioName = scenario.pickle.name.replace(/\s+/g, '_').toLowerCase();
    console.log(`\n  📸 Capturing failure screenshot for: ${scenario.pickle.name}`);

    try {
      if (this.page) {
        const screenshotPath = `screenshots/FAIL-${scenarioName}-${Date.now()}.png`;
        await this.page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
        console.log(`  📸 Screenshot saved: ${screenshotPath}`);

        // Attach screenshot to Cucumber report if attach function is available
        if (typeof this.attach === 'function') {
          const screenshotBuffer = fs.readFileSync(screenshotPath);
          await this.attach(screenshotBuffer, 'image/png');
        }
      }
    } catch (error) {
      console.error(`  ⚠️  Failed to capture screenshot: ${error.message}`);
    }
  }

  // Always tear down browser
  await this.closeBrowser();
});

// ──────────────────────────────────────────────
// AfterAll Hook — Final Summary
// ──────────────────────────────────────────────

AfterAll(function () {
  console.log('\n');
  console.log('  ══════════════════════════════════════════');
  console.log('  🏁 TestKart — Test Execution Complete');
  console.log('  ──────────────────────────────────────────');
  console.log('  📊 Reports: reports/cucumber-report.html');
  console.log('  📸 Screenshots: screenshots/');
  console.log('  ══════════════════════════════════════════');
  console.log('\n');
});
