// ══════════════════════════════════════════════
// HomePage.js — Flipkart Home Page Object
// TestKart — BDD + POM Automation Framework
// ══════════════════════════════════════════════
// Handles: Navigation, Popup Dismissal, Product Search

const BasePage = require('./BasePage');

class HomePage extends BasePage {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    super(page);

    // ── Locators ────────────────────────────
    // Login/Promotional popup close button
    this.popupCloseButton = 'button._2KpZ6l._2doB4z';
    this.popupCloseButtonAlt = '//*[contains(@class, "_2KpZ6l")]';
    this.popupOverlay = '._1kfTjn';
    this.popupGenericClose = 'button:has-text("✕")';

    // Search bar
    this.searchInput = 'input[name="q"]';
    this.searchInputAlt = 'input[title="Search for Products, Brands and More"]';
    this.searchButton = 'button[type="submit"]';
    this.searchIcon = 'svg._34RNph';
  }

  // ──────────────────────────────────────────
  // Navigation
  // ──────────────────────────────────────────

  /**
   * Navigate to Flipkart homepage.
   */
  async open() {
    const baseUrl = process.env.BASE_URL || 'https://www.flipkart.com/';
    console.log(`\n  🌐 Navigating to: ${baseUrl}`);
    await this.navigate(baseUrl);
    await this.waitForPageLoad();
    console.log(`  ✅ Page loaded: ${await this.getTitle()}`);
  }

  // ──────────────────────────────────────────
  // Popup Handling
  // ──────────────────────────────────────────

  /**
   * Dismiss any promotional or login pop-ups that appear.
   * Flipkart frequently shows login modals on page load.
   * Uses multiple selector strategies for resilience.
   */
  async dismissPopup() {
    console.log('  🔍 Checking for promotional pop-ups...');

    // Strategy 1: Close button with known class
    const strategies = [
      { selector: this.popupCloseButton, name: 'Primary close button' },
      { selector: this.popupCloseButtonAlt, name: 'Alt close button (XPath)' },
      { selector: this.popupGenericClose, name: 'Generic close button' },
    ];

    for (const { selector, name } of strategies) {
      try {
        const isVisible = await this.isElementVisible(selector, 3000);
        if (isVisible) {
          await this.click(selector);
          console.log(`  ✅ Pop-up dismissed using: ${name}`);

          // Wait for popup to disappear
          await this.page.waitForTimeout(500);
          return true;
        }
      } catch {
        // Strategy failed, try next one
        continue;
      }
    }

    // Strategy 4: Press Escape key as last resort
    try {
      await this.page.keyboard.press('Escape');
      console.log('  ✅ Pop-up dismissed using: Escape key');
      await this.page.waitForTimeout(500);
      return true;
    } catch {
      // No popup found — that's fine
    }

    console.log('  ℹ️  No pop-up detected (or already dismissed)');
    return false;
  }

  // ──────────────────────────────────────────
  // Search
  // ──────────────────────────────────────────

  /**
   * Search for a product using the Flipkart search bar.
   * @param {string} searchTerm - Product search query
   */
  async searchProduct(searchTerm) {
    console.log(`  🔎 Searching for: "${searchTerm}"`);

    // Try primary search input first, fall back to alt
    let inputSelector = this.searchInput;
    const isPrimaryVisible = await this.isElementVisible(this.searchInput, 3000);
    if (!isPrimaryVisible) {
      inputSelector = this.searchInputAlt;
    }

    // Clear any existing text and type search term
    await this.page.click(inputSelector);
    await this.page.fill(inputSelector, '');
    await this.page.fill(inputSelector, searchTerm);

    // Submit search — try button click, fall back to Enter key
    try {
      const buttonVisible = await this.isElementVisible(this.searchButton, 2000);
      if (buttonVisible) {
        await this.click(this.searchButton);
      } else {
        await this.page.press(inputSelector, 'Enter');
      }
    } catch {
      await this.page.press(inputSelector, 'Enter');
    }

    // Wait for search results to load — wait for product containers
    // instead of networkidle (Flipkart never goes idle due to analytics)
    await this.page.waitForLoadState('domcontentloaded');
    try {
      // Wait for product cards to appear (primary or alt selector)
      await this.page.waitForSelector(
        'div[data-id], div._1AtVbE, div[class*="slAVV4"]',
        { state: 'visible', timeout: 15000 }
      );
    } catch {
      // Even if specific selectors don't match, the page may have loaded
      // with a different layout — continue and let extraction handle it
      console.log('  ℹ️  Product cards selector not matched, continuing...');
    }
    await this.page.waitForTimeout(2000); // Let dynamic content settle
    console.log(`  ✅ Search results loaded for: "${searchTerm}"`);
  }
}

module.exports = HomePage;
