// ══════════════════════════════════════════════════════════
// BasePage.js — Abstract Base Page Object
// ══════════════════════════════════════════════════════════
// Provides shared navigation and wait helpers.
// All page objects inherit from this class.

const config = require('../config/env.config');

class BasePage {
  /**
   * @param {import('playwright').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a URL and wait for DOM to load.
   * @param {string} url
   */
  async navigate(url) {
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: config.navigationTimeout,
    });
  }

  /** @returns {Promise<string>} Current page title */
  async getTitle() {
    return this.page.title();
  }

  /** @returns {string} Current page URL */
  getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Wait for page load state.
   * Uses 'load' — not 'networkidle' (Flipkart analytics never idle).
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('load', {
      timeout: config.defaultTimeout,
    });
  }

  /**
   * Check if a selector is visible within a timeout.
   * @param {string} selector
   * @param {number} [timeout=3000]
   * @returns {Promise<boolean>}
   */
  async isVisible(selector, timeout = 3000) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Take a debug screenshot with timestamp.
   * @param {string} name - Descriptive label
   */
  async takeScreenshot(name) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `screenshots/${name}-${ts}.png`,
      fullPage: false,
    });
  }
}

module.exports = BasePage;
