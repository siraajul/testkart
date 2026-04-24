// ══════════════════════════════════════════════
// world.js — Custom Cucumber World
// TestKart — BDD + POM Automation Framework
// ══════════════════════════════════════════════
// The World is the shared context object available in all step definitions.
// It holds the browser instance, page objects, and extracted data.

const { setWorldConstructor } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const HomePage = require('../pages/HomePage');
const SearchResultsPage = require('../pages/SearchResultsPage');

class CustomWorld {
  constructor() {
    // Browser instances
    this.browser = null;
    this.context = null;
    this.page = null;

    // Page Objects
    this.homePage = null;
    this.searchResultsPage = null;

    // Test data store — accumulates extracted product data across pages
    this.productsData = [];
  }

  /**
   * Launch the browser and create a fresh context/page.
   * Configured via .env variables for flexibility.
   */
  async launchBrowser() {
    const headless = process.env.HEADLESS === 'true';
    const slowMo = parseInt(process.env.SLOW_MO) || 0;

    console.log('\n  ══════════════════════════════════════════');
    console.log('  🚀 TestKart — Launching Browser');
    console.log(`  ── Mode: ${headless ? 'Headless' : 'Headed'}`);
    console.log('  ══════════════════════════════════════════\n');

    // Launch Chromium with realistic settings
    this.browser = await chromium.launch({
      headless,
      slowMo,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    // Create browser context with realistic viewport and user-agent
    this.context = await this.browser.newContext({
      viewport: {
        width: parseInt(process.env.VIEWPORT_WIDTH) || 1440,
        height: parseInt(process.env.VIEWPORT_HEIGHT) || 900,
      },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/122.0.0.0 Safari/537.36',
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
    });

    // Create a new page
    this.page = await this.context.newPage();

    // Set default timeouts
    this.page.setDefaultTimeout(parseInt(process.env.DEFAULT_TIMEOUT) || 30000);
    this.page.setDefaultNavigationTimeout(parseInt(process.env.NAVIGATION_TIMEOUT) || 45000);

    // Initialize Page Objects
    this.homePage = new HomePage(this.page);
    this.searchResultsPage = new SearchResultsPage(this.page);
  }

  /**
   * Properly tear down the browser — close page, context, and browser.
   */
  async closeBrowser() {
    console.log('\n  🧹 Tearing down browser...');

    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
    } catch (error) {
      console.error(`  ⚠️  Error closing page: ${error.message}`);
    }

    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
    } catch (error) {
      console.error(`  ⚠️  Error closing context: ${error.message}`);
    }

    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.error(`  ⚠️  Error closing browser: ${error.message}`);
    }

    console.log('  ✅ Browser teardown complete');
  }
}

setWorldConstructor(CustomWorld);

module.exports = CustomWorld;
