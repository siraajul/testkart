// ══════════════════════════════════════════════════════════
// SearchResultsPage.js — Search Results Page Object
// ══════════════════════════════════════════════════════════
// Responsibilities: Validate results, scroll to load products.
// Extraction → services/DataExtractor
// Pagination → services/PaginationHandler

const BasePage = require('./BasePage');
const DataExtractor = require('../services/DataExtractor');
const PaginationHandler = require('../services/PaginationHandler');
const { searchResults } = require('../config/selectors');

class SearchResultsPage extends BasePage {
  /** @param {import('playwright').Page} page */
  constructor(page) {
    super(page);
    this.extractor = new DataExtractor(page);
    this.pagination = new PaginationHandler(page);
  }

  /**
   * Verify that search results are displayed.
   * @returns {Promise<boolean>}
   */
  async hasSearchResults() {
    return (
      (await this.isVisible(searchResults.productCard)) ||
      (await this.isVisible(searchResults.productCardAlt, 5000))
    );
  }

  /**
   * Extract product data from the current page.
   * Delegates to DataExtractor service.
   * @param {number} pageNumber
   */
  async extractProductData(pageNumber) {
    return this.extractor.extract(pageNumber);
  }

  /**
   * Navigate to a specific page number.
   * Delegates to PaginationHandler service.
   * @param {number} targetPage
   */
  async goToPage(targetPage) {
    return this.pagination.goToPage(targetPage);
  }

  /**
   * Get the current page number from the URL.
   * @returns {number}
   */
  getCurrentPageNumber() {
    return this.pagination.getCurrentPageNumber();
  }

  /**
   * Scroll to the bottom to trigger lazy-loading, then back to top.
   */
  async scrollToLoadAllProducts() {
    await this.page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(1000);
  }
}

module.exports = SearchResultsPage;
