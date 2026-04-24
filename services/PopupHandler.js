// ══════════════════════════════════════════════════════════
// PopupHandler.js — Promotional Popup Dismissal Service
// ══════════════════════════════════════════════════════════
// Handles Flipkart's login/promotional modals using a
// multi-strategy fallback chain for maximum resilience.

const { home } = require('../config/selectors');

class PopupHandler {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Attempt to dismiss any visible popup using 4 strategies.
   * @returns {Promise<boolean>} true if a popup was dismissed
   */
  async dismiss() {
    console.log('  🔍 Checking for promotional pop-ups...');

    // Strategies 1-3: Try known close button selectors
    const selectors = [
      { selector: home.popupClose, name: 'Primary close button' },
      { selector: home.popupCloseAlt, name: 'Alt close button (XPath)' },
      { selector: home.popupGenericClose, name: 'Generic close button' },
    ];

    for (const { selector, name } of selectors) {
      if (await this._tryCloseWith(selector, name)) return true;
    }

    // Strategy 4: Escape key as universal fallback
    return this._tryEscapeKey();
  }

  /**
   * Try closing a popup using a specific selector.
   * @param {string} selector - CSS/XPath selector
   * @param {string} name - Strategy label for logging
   * @returns {Promise<boolean>}
   * @private
   */
  async _tryCloseWith(selector, name) {
    try {
      const el = this.page.locator(selector).first();
      if (await el.isVisible({ timeout: 3000 })) {
        await el.click();
        await this.page.waitForTimeout(500);
        console.log(`  ✅ Pop-up dismissed using: ${name}`);
        return true;
      }
    } catch {
      // Strategy failed — fall through to next
    }
    return false;
  }

  /**
   * Press Escape key as a last-resort popup dismissal.
   * @returns {Promise<boolean>}
   * @private
   */
  async _tryEscapeKey() {
    try {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
      console.log('  ✅ Pop-up dismissed using: Escape key');
      return true;
    } catch {
      console.log('  ℹ️  No pop-up detected (or already dismissed)');
      return false;
    }
  }
}

module.exports = PopupHandler;
