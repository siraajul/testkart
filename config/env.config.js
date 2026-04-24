// ══════════════════════════════════════════════════════════
// env.config.js — Centralized Environment Configuration
// ══════════════════════════════════════════════════════════
// Single source of truth for all environment variables.
// All other files import config from here instead of
// accessing process.env directly.

require('dotenv').config();

/** @type {Readonly<AppConfig>} */
const config = Object.freeze({
  /** Flipkart base URL */
  baseUrl: process.env.BASE_URL || 'https://www.flipkart.com/',

  /** Search term for the test scenario */
  searchTerm: process.env.SEARCH_TERM || 'Shoes for Men',

  /** Run browser in headless mode (CI/CD) */
  headless: process.env.HEADLESS === 'true',

  /** Delay between Playwright actions (ms) */
  slowMo: parseInt(process.env.SLOW_MO) || 0,

  /** Browser viewport dimensions */
  viewportWidth: parseInt(process.env.VIEWPORT_WIDTH) || 1440,
  viewportHeight: parseInt(process.env.VIEWPORT_HEIGHT) || 900,

  /** Maximum pages to scrape */
  maxPages: parseInt(process.env.MAX_PAGES) || 2,

  /** Default element wait timeout (ms) */
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT) || 30000,

  /** Page navigation timeout (ms) */
  navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT) || 45000,
});

module.exports = config;
