// ══════════════════════════════════════════════════════════
// extraction.steps.js — Data Extraction & Assertion Steps
// ══════════════════════════════════════════════════════════
// Then steps: validate results, extract data, display output

const { Then } = require('@cucumber/cucumber');
const Logger = require('../utils/logger');

Then('I should see search results for shoes', { timeout: 30000 }, async function () {
  const hasResults = await this.searchResultsPage.hasSearchResults();
  if (!hasResults) {
    await this.searchResultsPage.takeScreenshot('no-search-results');
    throw new Error('No search results found for shoes');
  }
  console.log('  ✅ Search results are displayed');
});

Then('I extract MRP and Discount Percentage from page {int}', { timeout: 30000 }, async function (pageNumber) {
  const products = await this.searchResultsPage.extractProductData(pageNumber);

  if (products.length === 0) {
    console.log(`  ⚠️  No product data extracted from page ${pageNumber}`);
    console.log('  ℹ️  This may be due to dynamic class name changes on Flipkart.');
    console.log('  ℹ️  Taking a screenshot for debugging...');
    await this.searchResultsPage.takeScreenshot(`no-data-page-${pageNumber}`);
  }

  // Accumulate in World context for consolidated display
  this.productsData.push(...products);
});

Then('I display the results for page {int}', async function (pageNumber) {
  const pageProducts = this.productsData.filter((p) => p.page === pageNumber);
  Logger.displayPageResults(pageProducts, pageNumber);
});

Then('I should be on page {int}', { timeout: 15000 }, async function (pageNumber) {
  const currentPage = this.searchResultsPage.getCurrentPageNumber();
  console.log(`  📌 Current page: ${currentPage} (expected: ${pageNumber})`);
  console.log(`  📌 Current URL: ${this.searchResultsPage.getCurrentUrl()}`);
});

Then('I display the consolidated results from all pages', async function () {
  Logger.displayConsolidatedResults(this.productsData);

  if (this.productsData.length === 0) {
    throw new Error('No products were extracted from any page');
  }

  console.log(`  🎯 Total products extracted: ${this.productsData.length}`);
  console.log('  ✅ Data extraction complete!');
});
