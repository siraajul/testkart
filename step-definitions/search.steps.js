// ══════════════════════════════════════════════════════════
// search.steps.js — Search & Pagination Steps
// ══════════════════════════════════════════════════════════
// When steps: search, scroll, navigate pages

const { When } = require('@cucumber/cucumber');

When('I search for {string}', { timeout: 45000 }, async function (searchTerm) {
  await this.homePage.searchProduct(searchTerm);
});

When('I scroll to load all products on the current page', { timeout: 30000 }, async function () {
  await this.searchResultsPage.scrollToLoadAllProducts();
  console.log('  ✅ Scrolled to load all lazy-loaded products');
});

When('I navigate to page {int}', { timeout: 30000 }, async function (pageNumber) {
  const success = await this.searchResultsPage.goToPage(pageNumber);
  if (!success) throw new Error(`Failed to navigate to page ${pageNumber}`);
});
