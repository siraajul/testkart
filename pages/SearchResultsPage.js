// ══════════════════════════════════════════════
// SearchResultsPage.js — Search Results Page Object
// TestKart — BDD + POM Automation Framework
// ══════════════════════════════════════════════
// Handles: Product Data Extraction, Pagination, Results Validation

const BasePage = require('./BasePage');

class SearchResultsPage extends BasePage {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    super(page);

    // ── Locators ────────────────────────────
    // Product cards container
    this.productCard = 'div[data-id]';
    this.productCardAlt = 'div._1AtVbE';

    // Price selectors — Flipkart uses dynamic class names, so we use
    // multiple strategies and structural selectors for resilience.
    this.sellingPrice = 'div._30jeq3';
    this.originalMRP = 'div._3I9_wc';
    this.discountPercent = 'div._3Ay6Sb';

    // Alternative selectors (Flipkart UI variations)
    this.sellingPriceAlt = 'div[class*="Nx9bqj"]';
    this.originalMRPAlt = 'div[class*="yRaY8j"]';
    this.discountPercentAlt = 'div[class*="UkUFwK"]';

    // Product title/name
    this.productTitle = 'a.IRpwTa, a.s1Q9rs, div._4rR01T, a._2rpwqI';
    this.productTitleAlt = 'a[class*="wjcEIp"], a[class*="WKTcLC"]';

    // Pagination
    this.paginationContainer = 'nav._1ypTlJ, nav[class*="pagination"]';
    this.nextPageButton = 'a._1LKTO3:has-text("Next"), a:has-text("Next"), nav a span:has-text("Next")';
    this.pageNumberLink = 'nav a._1LKTO3';
    this.activePageNumber = 'span._2UxVDX, nav span[class*="active"]';

    // Search results count/header
    this.resultsHeader = 'div._36Tock span, h1._2whKao, div[class*="resultHeader"]';
  }

  // ──────────────────────────────────────────
  // Validation
  // ──────────────────────────────────────────

  /**
   * Verify that search results are displayed.
   * @returns {Promise<boolean>}
   */
  async hasSearchResults() {
    try {
      // Wait for at least one product card to appear
      await this.page.waitForSelector(this.productCard, {
        state: 'visible',
        timeout: this.defaultTimeout,
      });
      return true;
    } catch {
      // Try alternative selector
      try {
        await this.page.waitForSelector(this.productCardAlt, {
          state: 'visible',
          timeout: 5000,
        });
        return true;
      } catch {
        return false;
      }
    }
  }

  // ──────────────────────────────────────────
  // Data Extraction
  // ──────────────────────────────────────────

  /**
   * Extract MRP and Discount data from all visible products on the current page.
   * Uses multiple selector strategies for resilience against Flipkart UI changes.
   * @param {number} pageNumber - Current page number (for labeling)
   * @returns {Promise<Array<{index: number, page: number, title: string, sellingPrice: string, mrp: string, discount: string}>>}
   */
  async extractProductData(pageNumber = 1) {
    console.log(`\n  📦 Extracting product data from Page ${pageNumber}...`);

    // Wait for products to fully render
    await this.page.waitForTimeout(3000);

    const products = [];

    // ═══════════════════════════════════════════════════════════════
    // Content-Based Extraction Strategy
    // ═══════════════════════════════════════════════════════════════
    // Flipkart frequently changes CSS class names (obfuscated hashes).
    // Instead of relying on class selectors, we detect product data
    // by CONTENT PATTERNS:
    //   - Prices: elements containing "₹" followed by digits
    //   - MRP: price elements with strikethrough styling
    //   - Discount: elements containing "% off"
    //   - Product cards: parent containers holding all three
    // ═══════════════════════════════════════════════════════════════

    const extractedData = await this.page.evaluate(() => {
      const results = [];

      // Step 1: Find all discount elements ("XX% off") — most unique identifier
      const allElements = document.querySelectorAll('div, span');
      const discountEls = [];

      allElements.forEach((el) => {
        const text = el.textContent.trim();
        // Match "XX% off" pattern and ensure it's a leaf/small element
        if (/^\d+%\s*off$/i.test(text) && el.children.length === 0) {
          discountEls.push(el);
        }
      });

      // Step 2: For each discount element, walk UP to find the product card container
      const processedCards = new Set();

      discountEls.forEach((discountEl) => {
        // Walk up the DOM to find the product card container
        // The card is typically a div with a data-id or a link-heavy container
        let card = discountEl.parentElement;
        for (let i = 0; i < 10 && card; i++) {
          // Check if this container has multiple price-like children
          const cardText = card.textContent || '';
          const priceMatches = cardText.match(/₹[\d,]+/g);
          const hasImage = card.querySelector('img') !== null;

          if (hasImage && priceMatches && priceMatches.length >= 1) {
            // Check if the card is reasonably sized (not the whole page)
            if (card.offsetHeight < 800 && card.offsetHeight > 100) {
              break;
            }
          }
          card = card.parentElement;
        }

        if (!card || processedCards.has(card)) return;
        processedCards.add(card);

        // Step 3: Extract data from this card

        // Title: find <a> tags with substantial text (product name)
        let title = 'N/A';
        const links = card.querySelectorAll('a');
        for (const link of links) {
          const linkText = link.textContent.trim();
          // Product titles are typically 10+ characters and not just prices
          if (linkText.length > 10 && !linkText.match(/^₹/) && !linkText.match(/^\d+%/)) {
            title = linkText.substring(0, 50);
            break;
          }
        }
        // Fallback: try div/span with substantial text
        if (title === 'N/A') {
          const textEls = card.querySelectorAll('a, div, span');
          for (const el of textEls) {
            const t = el.textContent.trim();
            if (t.length > 15 && t.length < 200 && !t.match(/^₹/) && !t.match(/^\d+%/) && el.children.length < 3) {
              title = t.substring(0, 50);
              break;
            }
          }
        }

        // Selling Price: the prominent ₹ price (usually largest font)
        let sellingPrice = 'N/A';
        let mrp = 'N/A';
        const priceElements = card.querySelectorAll('div, span');

        for (const el of priceElements) {
          const text = el.textContent.trim();
          if (/^₹[\d,]+$/.test(text) && el.children.length === 0) {
            const computedStyle = window.getComputedStyle(el);
            const isStrikethrough = computedStyle.textDecorationLine.includes('line-through')
              || el.closest('s') !== null
              || el.closest('strike') !== null;

            if (isStrikethrough) {
              mrp = text;
            } else if (sellingPrice === 'N/A') {
              sellingPrice = text;
            }
          }
        }

        // Discount
        const discount = discountEl.textContent.trim();

        if (sellingPrice !== 'N/A') {
          results.push({
            index: results.length + 1,
            title,
            sellingPrice,
            mrp: mrp !== 'N/A' ? mrp : sellingPrice,
            discount,
          });
        }
      });

      // ═══════════════════════════════════════════════════════════════
      // Fallback Strategy: If discount-based approach found nothing,
      // try finding product cards by price pattern alone
      // ═══════════════════════════════════════════════════════════════
      if (results.length === 0) {
        const priceEls = [];
        allElements.forEach((el) => {
          const text = el.textContent.trim();
          if (/^₹[\d,]+$/.test(text) && el.children.length === 0) {
            const style = window.getComputedStyle(el);
            if (!style.textDecorationLine.includes('line-through')) {
              priceEls.push(el);
            }
          }
        });

        const fallbackCards = new Set();
        priceEls.forEach((priceEl) => {
          let card = priceEl.parentElement;
          for (let i = 0; i < 8 && card; i++) {
            if (card.querySelector('img') && card.offsetHeight > 100 && card.offsetHeight < 800) {
              break;
            }
            card = card.parentElement;
          }
          if (!card || fallbackCards.has(card)) return;
          fallbackCards.add(card);

          const cardText = card.textContent || '';

          // Extract price
          const sellingPrice = priceEl.textContent.trim();

          // Find MRP (strikethrough price)
          let mrp = 'N/A';
          card.querySelectorAll('div, span, s, strike').forEach((el) => {
            const text = el.textContent.trim();
            if (/^₹[\d,]+$/.test(text)) {
              const style = window.getComputedStyle(el);
              if (style.textDecorationLine.includes('line-through') || el.tagName === 'S' || el.tagName === 'STRIKE') {
                mrp = text;
              }
            }
          });

          // Find discount
          let discount = 'No Discount';
          const discMatch = cardText.match(/(\d+%\s*off)/i);
          if (discMatch) discount = discMatch[1];

          // Find title
          let title = 'N/A';
          const links = card.querySelectorAll('a');
          for (const link of links) {
            const t = link.textContent.trim();
            if (t.length > 10 && !t.match(/^₹/) && !t.match(/^\d+%/)) {
              title = t.substring(0, 50);
              break;
            }
          }

          results.push({
            index: results.length + 1,
            title,
            sellingPrice,
            mrp: mrp !== 'N/A' ? mrp : sellingPrice,
            discount,
          });
        });
      }

      return results;
    });

    // Tag each product with the page number
    extractedData.forEach((product) => {
      product.page = pageNumber;
      products.push(product);
    });

    console.log(`  ✅ Extracted ${products.length} products from Page ${pageNumber}`);
    return products;
  }

  // ──────────────────────────────────────────
  // Pagination
  // ──────────────────────────────────────────

  /**
   * Navigate to a specific page number in the search results.
   * @param {number} targetPage - Page number to navigate to
   * @returns {Promise<boolean>}
   */
  async goToPage(targetPage) {
    console.log(`\n  📄 Navigating to Page ${targetPage}...`);

    try {
      // Strategy 1: Click specific page number link
      const pageLink = this.page.locator(
        `nav a:has-text("${targetPage}"), a._1LKTO3:has-text("${targetPage}")`
      ).first();

      if (await pageLink.isVisible({ timeout: 5000 })) {
        await pageLink.click();
        await this.waitForPageLoad();
        await this.page.waitForTimeout(2000);
        console.log(`  ✅ Navigated to Page ${targetPage}`);
        return true;
      }
    } catch {
      // Try next strategy
    }

    try {
      // Strategy 2: Click "Next" button
      const nextBtn = this.page.locator('a:has-text("Next"), span:has-text("Next")').first();
      if (await nextBtn.isVisible({ timeout: 5000 })) {
        await nextBtn.click();
        await this.waitForPageLoad();
        await this.page.waitForTimeout(2000);
        console.log(`  ✅ Navigated to Page ${targetPage} via "Next" button`);
        return true;
      }
    } catch {
      // Try URL manipulation
    }

    try {
      // Strategy 3: URL parameter manipulation (most reliable)
      const currentUrl = this.page.url();
      const url = new URL(currentUrl);
      url.searchParams.set('page', targetPage.toString());
      await this.navigate(url.toString());
      await this.waitForPageLoad();
      await this.page.waitForTimeout(2000);
      console.log(`  ✅ Navigated to Page ${targetPage} via URL parameter`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to navigate to Page ${targetPage}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the current active page number.
   * @returns {Promise<number>}
   */
  async getCurrentPageNumber() {
    try {
      const url = this.page.url();
      const urlObj = new URL(url);
      const pageParam = urlObj.searchParams.get('page');
      return pageParam ? parseInt(pageParam) : 1;
    } catch {
      return 1;
    }
  }

  /**
   * Check if the "Next" page button is available.
   * @returns {Promise<boolean>}
   */
  async isNextPageAvailable() {
    try {
      const nextBtn = this.page.locator('a:has-text("Next"), span:has-text("Next")').first();
      return await nextBtn.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  /**
   * Scroll to the bottom of the page to ensure all lazy-loaded products are visible.
   */
  async scrollToLoadAllProducts() {
    await this.page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });

    // Scroll back to top
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(1000);
  }
}

module.exports = SearchResultsPage;
