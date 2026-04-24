// ══════════════════════════════════════════════════════════
// browser.config.js — Playwright Browser Configuration
// ══════════════════════════════════════════════════════════
// Encapsulates all browser launch and context settings.
// Keeps world.js clean by externalizing config details.

const config = require('./env.config');

/** Chromium launch options */
const launchOptions = {
  headless: config.headless,
  slowMo: config.slowMo,
  args: [
    '--start-maximized',
    '--disable-blink-features=AutomationControlled',
  ],
};

/** Browser context options (anti-detection + viewport) */
const contextOptions = {
  viewport: {
    width: config.viewportWidth,
    height: config.viewportHeight,
  },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/122.0.0.0 Safari/537.36',
  locale: 'en-IN',
  timezoneId: 'Asia/Kolkata',
};

module.exports = { launchOptions, contextOptions };
