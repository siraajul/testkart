// ══════════════════════════════════════════════════════════
// DataExtractor.js — Product Data Extraction Service
// ══════════════════════════════════════════════════════════
// Extracts MRP, selling price, discount, and title from
// Flipkart search results using content-pattern detection
// instead of brittle CSS class selectors.
//
// Strategy: Find "% off" discount elements → walk UP the
// DOM to find the product card → extract price/title data
// using ₹ pattern matching and strikethrough CSS detection.

class DataExtractor {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Extract product data from the current page.
   * @param {number} pageNumber - Page label for tagging results
   * @returns {Promise<Array<{index:number, page:number, title:string, sellingPrice:string, mrp:string, discount:string}>>}
   */
  async extract(pageNumber = 1) {
    console.log(`\n  📦 Extracting product data from Page ${pageNumber}...`);
    await this.page.waitForTimeout(3000);

    // Run extraction inside browser context for performance
    const rawData = await this.page.evaluate(() => {
      const allElements = document.querySelectorAll('div, span');

      // Try discount-based extraction first, then fallback
      const results = extractViaDiscounts(allElements);
      return results.length > 0 ? results : extractViaPrices(allElements);

      // ── Primary: Discount-anchored extraction ──────
      function extractViaDiscounts(elements) {
        const results = [];
        const processedCards = new Set();

        // Find leaf elements matching "XX% off"
        const discountEls = [...elements].filter(
          (el) => /^\d+%\s*off$/i.test(el.textContent.trim()) && el.children.length === 0
        );

        for (const discountEl of discountEls) {
          const card = findProductCard(discountEl);
          if (!card || processedCards.has(card)) continue;
          processedCards.add(card);

          const { sellingPrice, mrp } = extractPrices(card);
          if (sellingPrice === 'N/A') continue;

          results.push({
            index: results.length + 1,
            title: extractTitle(card),
            sellingPrice,
            mrp,
            discount: discountEl.textContent.trim(),
          });
        }
        return results;
      }

      // ── Fallback: Price-anchored extraction ────────
      function extractViaPrices(elements) {
        const results = [];
        const processedCards = new Set();

        const priceEls = [...elements].filter((el) => {
          if (!/^₹[\d,]+$/.test(el.textContent.trim()) || el.children.length > 0) return false;
          return !window.getComputedStyle(el).textDecorationLine.includes('line-through');
        });

        for (const priceEl of priceEls) {
          const card = findProductCard(priceEl);
          if (!card || processedCards.has(card)) continue;
          processedCards.add(card);

          const cardText = card.textContent || '';
          const discMatch = cardText.match(/(\d+%\s*off)/i);

          results.push({
            index: results.length + 1,
            title: extractTitle(card),
            sellingPrice: priceEl.textContent.trim(),
            mrp: extractMrp(card, priceEl.textContent.trim()),
            discount: discMatch ? discMatch[1] : 'No Discount',
          });
        }
        return results;
      }

      // ── Helpers ─────────────────────────────────────

      /** Walk UP the DOM to find the product card container. */
      function findProductCard(startEl) {
        let el = startEl.parentElement;
        for (let i = 0; i < 10 && el; i++) {
          const hasImg = el.querySelector('img') !== null;
          const hasPrices = (el.textContent || '').match(/₹[\d,]+/g);
          if (hasImg && hasPrices && el.offsetHeight > 100 && el.offsetHeight < 800) {
            return el;
          }
          el = el.parentElement;
        }
        return null;
      }

      /** Extract selling price (non-strikethrough) and MRP (strikethrough). */
      function extractPrices(card) {
        let sellingPrice = 'N/A';
        let mrp = 'N/A';

        for (const el of card.querySelectorAll('div, span')) {
          const text = el.textContent.trim();
          if (!/^₹[\d,]+$/.test(text) || el.children.length > 0) continue;

          const isStrikethrough =
            window.getComputedStyle(el).textDecorationLine.includes('line-through') ||
            el.closest('s') !== null;

          if (isStrikethrough) {
            mrp = text;
          } else if (sellingPrice === 'N/A') {
            sellingPrice = text;
          }
        }
        return { sellingPrice, mrp: mrp !== 'N/A' ? mrp : sellingPrice };
      }

      /** Extract MRP from a card (fallback path). */
      function extractMrp(card, fallback) {
        for (const el of card.querySelectorAll('div, span, s, strike')) {
          const text = el.textContent.trim();
          if (!/^₹[\d,]+$/.test(text)) continue;
          const style = window.getComputedStyle(el);
          if (style.textDecorationLine.includes('line-through') || el.tagName === 'S') {
            return text;
          }
        }
        return fallback;
      }

      /** Extract product title from link text. */
      function extractTitle(card) {
        for (const link of card.querySelectorAll('a')) {
          const t = link.textContent.trim();
          if (t.length > 10 && !t.match(/^₹/) && !t.match(/^\d+%/)) {
            return t.substring(0, 50);
          }
        }
        // Fallback: any substantial text element
        for (const el of card.querySelectorAll('a, div, span')) {
          const t = el.textContent.trim();
          if (t.length > 15 && t.length < 200 && !t.match(/^₹/) && el.children.length < 3) {
            return t.substring(0, 50);
          }
        }
        return 'N/A';
      }
    });

    // Tag each product with the page number
    const products = rawData.map((p) => ({ ...p, page: pageNumber }));
    console.log(`  ✅ Extracted ${products.length} products from Page ${pageNumber}`);
    return products;
  }
}

module.exports = DataExtractor;
