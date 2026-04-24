// ══════════════════════════════════════════════════════════
// PaginationHandler.js — Search Results Pagination Service
// ══════════════════════════════════════════════════════════
// Navigates between search result pages using a 3-strategy
// fallback: direct link → Next button → URL parameter.

const config = require('../config/env.config');

class PaginationHandler {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a specific search results page number.
   * Uses 3 strategies in priority order.
   * @param {number} targetPage
   * @returns {Promise<boolean>}
   */
  async goToPage(targetPage) {
    console.log(`\n  📄 Navigating to Page ${targetPage}...`);

    return (
      (await this._clickPageNumber(targetPage)) ||
      (await this._clickNextButton(targetPage)) ||
      (await this._manipulateUrl(targetPage))
    );
  }

  /**
   * Get the current page number from the URL.
   * @returns {number}
   */
  getCurrentPageNumber() {
    try {
      const urlObj = new URL(this.page.url());
      return parseInt(urlObj.searchParams.get('page')) || 1;
    } catch {
      return 1;
    }
  }

  // ── Private Strategies ────────────────────

  /** Strategy 1: Click the page number link directly. */
  async _clickPageNumber(targetPage) {
    try {
      const link = this.page.locator(
        `nav a:has-text("${targetPage}"), a._1LKTO3:has-text("${targetPage}")`
      ).first();

      if (await link.isVisible({ timeout: 5000 })) {
        await link.click();
        await this._waitForPageTransition();
        console.log(`  ✅ Navigated to Page ${targetPage}`);
        return true;
      }
    } catch { /* fall through */ }
    return false;
  }

  /** Strategy 2: Click the "Next" navigation button. */
  async _clickNextButton(targetPage) {
    try {
      const btn = this.page.locator('a:has-text("Next"), span:has-text("Next")').first();
      if (await btn.isVisible({ timeout: 5000 })) {
        await btn.click();
        await this._waitForPageTransition();
        console.log(`  ✅ Navigated to Page ${targetPage} via "Next" button`);
        return true;
      }
    } catch { /* fall through */ }
    return false;
  }

  /** Strategy 3: Modify the URL ?page= parameter (most reliable). */
  async _manipulateUrl(targetPage) {
    try {
      const url = new URL(this.page.url());
      url.searchParams.set('page', targetPage.toString());
      await this.page.goto(url.toString(), {
        waitUntil: 'domcontentloaded',
        timeout: config.navigationTimeout,
      });
      await this._waitForPageTransition();
      console.log(`  ✅ Navigated to Page ${targetPage} via URL parameter`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to navigate to Page ${targetPage}: ${error.message}`);
      return false;
    }
  }

  /** Wait for the page transition to settle. */
  async _waitForPageTransition() {
    await this.page.waitForLoadState('load', { timeout: config.defaultTimeout });
    await this.page.waitForTimeout(2000);
  }
}

module.exports = PaginationHandler;
