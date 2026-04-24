// ══════════════════════════════════════════════
// BasePage.js — Abstract Base Page Object
// TestKart — BDD + POM Automation Framework
// ══════════════════════════════════════════════
// All page objects inherit from this class.
// Contains shared navigation, wait, and utility methods.

class BasePage {
  /**
   * @param {import('playwright').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;
    this.defaultTimeout = parseInt(process.env.DEFAULT_TIMEOUT) || 30000;
  }

  // ──────────────────────────────────────────
  // Navigation
  // ──────────────────────────────────────────

  /**
   * Navigate to a URL and wait for the page to fully load.
   * @param {string} url
   */
  async navigate(url) {
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: parseInt(process.env.NAVIGATION_TIMEOUT) || 45000,
    });
  }

  /**
   * Get the current page title.
   * @returns {Promise<string>}
   */
  async getTitle() {
    return this.page.title();
  }

  /**
   * Get the current page URL.
   * @returns {Promise<string>}
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  // ──────────────────────────────────────────
  // Wait Helpers
  // ──────────────────────────────────────────

  /**
   * Wait for the page to finish loading.
   * Uses 'load' instead of 'networkidle' because e-commerce sites
   * like Flipkart continuously fire analytics/tracking requests,
   * causing 'networkidle' to never resolve.
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('load', {
      timeout: this.defaultTimeout,
    });
  }

  /**
   * Wait for a specific selector to be visible.
   * @param {string} selector
   * @param {number} [timeout]
   */
  async waitForElement(selector, timeout = this.defaultTimeout) {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout,
    });
  }

  /**
   * Check if an element is visible on the page.
   * @param {string} selector
   * @param {number} [timeout=3000] - Short timeout for visibility check
   * @returns {Promise<boolean>}
   */
  async isElementVisible(selector, timeout = 3000) {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  // ──────────────────────────────────────────
  // Interaction Helpers
  // ──────────────────────────────────────────

  /**
   * Click an element with auto-wait.
   * @param {string} selector
   */
  async click(selector) {
    await this.page.click(selector, { timeout: this.defaultTimeout });
  }

  /**
   * Type text into an input field.
   * @param {string} selector
   * @param {string} text
   */
  async type(selector, text) {
    await this.page.fill(selector, text, { timeout: this.defaultTimeout });
  }

  /**
   * Get text content of an element.
   * @param {string} selector
   * @returns {Promise<string>}
   */
  async getText(selector) {
    const element = this.page.locator(selector);
    return (await element.textContent()) || '';
  }

  /**
   * Get all matching elements' text content.
   * @param {string} selector
   * @returns {Promise<string[]>}
   */
  async getAllTexts(selector) {
    const elements = this.page.locator(selector);
    return elements.allTextContents();
  }

  /**
   * Take a screenshot with a descriptive name.
   * @param {string} name
   */
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `screenshots/${name}-${timestamp}.png`,
      fullPage: false,
    });
  }
}

module.exports = BasePage;
