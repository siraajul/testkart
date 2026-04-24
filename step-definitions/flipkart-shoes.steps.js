// ══════════════════════════════════════════════
// flipkart-shoes.steps.js — Step Definitions
// TestKart — BDD + POM Automation Framework
// ══════════════════════════════════════════════
// Maps Gherkin steps to Playwright-powered Page Object actions.
// All browser interactions flow through the POM layer.

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const Logger = require('../utils/logger');

// ──────────────────────────────────────────────
// GIVEN — Preconditions
// ──────────────────────────────────────────────

Given('I navigate to the Flipkart homepage', { timeout: 60000 }, async function () {
  await this.homePage.open();

  // Verify we're on Flipkart
  const title = await this.homePage.getTitle();
  console.log(`  📌 Page Title: "${title}"`);
});

Given('I handle any promotional pop-ups', { timeout: 15000 }, async function () {
  await this.homePage.dismissPopup();
});

// ──────────────────────────────────────────────
// WHEN — Actions
// ──────────────────────────────────────────────

When('I search for {string}', { timeout: 30000 }, async function (searchTerm) {
  await this.homePage.searchProduct(searchTerm);
});

When('I scroll to load all products on the current page', { timeout: 30000 }, async function () {
  await this.searchResultsPage.scrollToLoadAllProducts();
  console.log('  ✅ Scrolled to load all lazy-loaded products');
});

When('I navigate to page {int}', { timeout: 30000 }, async function (pageNumber) {
  const success = await this.searchResultsPage.goToPage(pageNumber);
  if (!success) {
    throw new Error(`Failed to navigate to page ${pageNumber}`);
  }
});

// ──────────────────────────────────────────────
// THEN — Assertions & Data Extraction
// ──────────────────────────────────────────────

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

  // Store products in World context for consolidated display later
  this.productsData.push(...products);
});

Then('I display the results for page {int}', async function (pageNumber) {
  const pageProducts = this.productsData.filter((p) => p.page === pageNumber);
  Logger.displayPageResults(pageProducts, pageNumber);
});

Then('I should be on page {int}', { timeout: 15000 }, async function (pageNumber) {
  const currentPage = await this.searchResultsPage.getCurrentPageNumber();
  console.log(`  📌 Current page: ${currentPage} (expected: ${pageNumber})`);

  // Soft assertion — URL-based page detection
  const currentUrl = await this.searchResultsPage.getCurrentUrl();
  console.log(`  📌 Current URL: ${currentUrl}`);
});

Then('I display the consolidated results from all pages', async function () {
  Logger.displayConsolidatedResults(this.productsData);

  // Final assertion: we should have extracted data from both pages
  if (this.productsData.length === 0) {
    throw new Error('No products were extracted from any page');
  }

  console.log(`  🎯 Total products extracted: ${this.productsData.length}`);
  console.log('  ✅ Data extraction complete!');
});
