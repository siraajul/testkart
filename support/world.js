// ══════════════════════════════════════════════════════════
// world.js — Custom Cucumber World
// ══════════════════════════════════════════════════════════
// Shared context across all step definitions.
// Holds browser instances, page objects, and test data.

const { setWorldConstructor } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { launchOptions, contextOptions } = require('../config/browser.config');
const config = require('../config/env.config');
const HomePage = require('../pages/HomePage');
const SearchResultsPage = require('../pages/SearchResultsPage');

class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.homePage = null;
    this.searchResultsPage = null;
    this.productsData = []; // Accumulated product data across pages
  }

  /** Launch browser, create context/page, initialize page objects. */
  async launchBrowser() {
    console.log('\n  ══════════════════════════════════════════');
    console.log('  🚀 TestKart — Launching Browser');
    console.log(`  ── Mode: ${config.headless ? 'Headless' : 'Headed'}`);
    console.log('  ══════════════════════════════════════════\n');

    this.browser = await chromium.launch(launchOptions);
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();

    // Apply timeouts
    this.page.setDefaultTimeout(config.defaultTimeout);
    this.page.setDefaultNavigationTimeout(config.navigationTimeout);

    // Initialize page objects
    this.homePage = new HomePage(this.page);
    this.searchResultsPage = new SearchResultsPage(this.page);
  }

  /** Tear down browser — close page → context → browser. */
  async closeBrowser() {
    console.log('\n  🧹 Tearing down browser...');
    for (const resource of ['page', 'context', 'browser']) {
      try {
        if (this[resource]) {
          await this[resource].close();
          this[resource] = null;
        }
      } catch (err) {
        console.error(`  ⚠️  Error closing ${resource}: ${err.message}`);
      }
    }
    console.log('  ✅ Browser teardown complete');
  }
}

setWorldConstructor(CustomWorld);
module.exports = CustomWorld;
