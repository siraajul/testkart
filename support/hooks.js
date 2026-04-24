// ══════════════════════════════════════════════════════════
// hooks.js — Cucumber Lifecycle Hooks
// ══════════════════════════════════════════════════════════
// Before: Launch browser
// After: Screenshot on failure + teardown
// AfterAll: Print summary banner

const { Before, After, AfterAll, Status } = require('@cucumber/cucumber');
const fs = require('fs');

// ── Before: Launch browser for each scenario ────────────
Before({ timeout: 60000 }, async function () {
  await this.launchBrowser();
});

// ── After: Capture failure screenshot + teardown ────────
After({ timeout: 30000 }, async function (scenario) {
  if (scenario.result.status === Status.FAILED) {
    await this._captureFailureScreenshot(scenario);
  }
  await this.closeBrowser();
});

// ── AfterAll: Print final summary banner ────────────────
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

// ── Helper: Screenshot on failure ───────────────────────
// Extends World prototype to keep hooks.js slim.

const CustomWorld = require('./world');

CustomWorld.prototype._captureFailureScreenshot = async function (scenario) {
  const name = scenario.pickle.name.replace(/\s+/g, '_').toLowerCase();
  console.log(`\n  📸 Capturing failure screenshot for: ${scenario.pickle.name}`);

  try {
    if (!this.page) return;
    const path = `screenshots/FAIL-${name}-${Date.now()}.png`;
    await this.page.screenshot({ path, fullPage: true });
    console.log(`  📸 Screenshot saved: ${path}`);

    if (typeof this.attach === 'function') {
      await this.attach(fs.readFileSync(path), 'image/png');
    }
  } catch (err) {
    console.error(`  ⚠️  Failed to capture screenshot: ${err.message}`);
  }
};
