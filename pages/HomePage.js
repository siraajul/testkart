// ══════════════════════════════════════════════════════════
// HomePage.js — Flipkart Home Page Object
// ══════════════════════════════════════════════════════════
// Responsibilities: Navigate to homepage, search for products.
// Popup logic is delegated to services/PopupHandler.

const BasePage = require('./BasePage');
const PopupHandler = require('../services/PopupHandler');
const config = require('../config/env.config');
const { home, searchResults } = require('../config/selectors');

class HomePage extends BasePage {
  /** @param {import('playwright').Page} page */
  constructor(page) {
    super(page);
    this.popupHandler = new PopupHandler(page);
  }

  /** Navigate to the Flipkart homepage. */
  async open() {
    console.log(`\n  🌐 Navigating to: ${config.baseUrl}`);
    await this.navigate(config.baseUrl);
    await this.waitForPageLoad();
    console.log(`  ✅ Page loaded: ${await this.getTitle()}`);
  }

  /** Delegate popup dismissal to PopupHandler service. */
  async dismissPopup() {
    return this.popupHandler.dismiss();
  }

  /**
   * Search for a product using the Flipkart search bar.
   * @param {string} searchTerm
   */
  async searchProduct(searchTerm) {
    console.log(`  🔎 Searching for: "${searchTerm}"`);

    // Resolve which search input is visible
    const input = (await this.isVisible(home.searchInput))
      ? home.searchInput
      : home.searchInputAlt;

    // Type and submit
    await this.page.click(input);
    await this.page.fill(input, searchTerm);
    await this._submitSearch(input);

    // Wait for results to appear
    await this._waitForResults();
    console.log(`  ✅ Search results loaded for: "${searchTerm}"`);
  }

  // ── Private ─────────────────────────────────

  /** Submit search via button click or Enter key. */
  async _submitSearch(inputSelector) {
    try {
      if (await this.isVisible(home.searchButton, 2000)) {
        await this.page.click(home.searchButton);
      } else {
        await this.page.press(inputSelector, 'Enter');
      }
    } catch {
      await this.page.press(inputSelector, 'Enter');
    }
  }

  /** Wait for product cards to appear after search. */
  async _waitForResults() {
    // Guard: don't block on domcontentloaded — it may have already fired
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    } catch {
      // Already past domcontentloaded — safe to continue
    }

    // The real wait: product cards appearing on screen
    try {
      await this.page.waitForSelector(
        `${searchResults.productCard}, ${searchResults.productCardAlt}`,
        { state: 'visible', timeout: 20000 }
      );
    } catch {
      console.log('  ℹ️  Product cards selector not matched, continuing...');
    }
    await this.page.waitForTimeout(2000);
  }
}

module.exports = HomePage;
