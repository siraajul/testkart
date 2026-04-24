// ══════════════════════════════════════════════
// logger.js — Data Display & Formatting Utility
// TestKart — BDD + POM Automation Framework
// ══════════════════════════════════════════════
// Formats extracted product data into clean console tables.

class Logger {
  /**
   * Display products from a single page in a formatted table.
   * @param {Array} products - Array of product data objects
   * @param {number} pageNumber - Page number label
   */
  static displayPageResults(products, pageNumber) {
    console.log('\n');
    console.log(`  ┌─────────────────────────────────────────────────────────────────────────────────┐`);
    console.log(`  │  📄 PAGE ${pageNumber} RESULTS — ${products.length} Products Found${' '.repeat(Math.max(0, 42 - products.length.toString().length))}│`);
    console.log(`  └─────────────────────────────────────────────────────────────────────────────────┘`);

    if (products.length === 0) {
      console.log('  ⚠️  No products found on this page.\n');
      return;
    }

    // Format for console.table
    const tableData = products.map((p) => ({
      '#': p.index,
      'Product': p.title.substring(0, 40) + (p.title.length > 40 ? '...' : ''),
      'Selling Price': p.sellingPrice,
      'MRP': p.mrp,
      'Discount': p.discount,
    }));

    console.table(tableData);
  }

  /**
   * Display consolidated results from all pages.
   * @param {Array} allProducts - Combined product data from all pages
   */
  static displayConsolidatedResults(allProducts) {
    console.log('\n');
    console.log('  ╔═════════════════════════════════════════════════════════════════════════════════╗');
    console.log('  ║                    📊 CONSOLIDATED RESULTS — ALL PAGES                          ║');
    console.log('  ╠═════════════════════════════════════════════════════════════════════════════════╣');

    // Group by page
    const pages = [...new Set(allProducts.map((p) => p.page))];

    pages.forEach((pageNum) => {
      const pageProducts = allProducts.filter((p) => p.page === pageNum);
      console.log(`  ║  📄 Page ${pageNum}: ${pageProducts.length} products${' '.repeat(Math.max(0, 58 - pageProducts.length.toString().length - pageNum.toString().length))}║`);
    });

    console.log('  ╠═════════════════════════════════════════════════════════════════════════════════╣');
    console.log(`  ║  📦 Total Products Extracted: ${allProducts.length}${' '.repeat(Math.max(0, 48 - allProducts.length.toString().length))}║`);

    // Statistics
    const withDiscount = allProducts.filter((p) => p.discount !== 'N/A' && p.discount !== 'No Discount');
    const withMRP = allProducts.filter((p) => p.mrp !== 'N/A');

    console.log(`  ║  💰 Products with MRP: ${withMRP.length}${' '.repeat(Math.max(0, 55 - withMRP.length.toString().length))}║`);
    console.log(`  ║  🏷️  Products with Discount: ${withDiscount.length}${' '.repeat(Math.max(0, 49 - withDiscount.length.toString().length))}║`);
    console.log('  ╚═════════════════════════════════════════════════════════════════════════════════╝');

    // Full consolidated table
    const tableData = allProducts.map((p) => ({
      'Page': p.page,
      '#': p.index,
      'Product': p.title.substring(0, 35) + (p.title.length > 35 ? '...' : ''),
      'Selling Price': p.sellingPrice,
      'MRP': p.mrp,
      'Discount': p.discount,
    }));

    console.table(tableData);
    console.log('\n');
  }

  /**
   * Print a divider line.
   * @param {string} [char='─']
   * @param {number} [length=60]
   */
  static divider(char = '─', length = 60) {
    console.log(`  ${char.repeat(length)}`);
  }
}

module.exports = Logger;
