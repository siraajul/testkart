// ══════════════════════════════════════════════════════════
// selectors.js — Centralized Selector Registry
// ══════════════════════════════════════════════════════════
// All CSS selectors, XPaths, and patterns in one place.
// When Flipkart changes class names, update ONLY this file.

/** Home page selectors */
const home = {
  // Login / promotional popup close buttons
  popupClose: 'button._2KpZ6l._2doB4z',
  popupCloseAlt: '//*[contains(@class, "_2KpZ6l")]',
  popupGenericClose: 'button:has-text("✕")',

  // Search bar
  searchInput: 'input[name="q"]',
  searchInputAlt: 'input[title="Search for Products, Brands and More"]',
  searchButton: 'button[type="submit"]',
};

/** Search results page selectors */
const searchResults = {
  // Product card containers
  productCard: 'div[data-id]',
  productCardAlt: 'div._1AtVbE, div[class*="slAVV4"]',

  // Results count header
  resultsHeader: 'div._36Tock span, h1._2whKao',
};

/** Regex patterns for content-based extraction */
const patterns = {
  /** Matches "₹1,299" format */
  price: /^₹[\d,]+$/,

  /** Matches "80% off" format */
  discount: /^\d+%\s*off$/i,

  /** Extracts "XX% off" from longer text */
  discountCapture: /(\d+%\s*off)/i,
};

module.exports = { home, searchResults, patterns };
