<![CDATA[<div align="center">

# 🛒 TestKart

### BDD + Page Object Model Automation Framework

> A production-grade SDET automation framework built with a **pure JavaScript stack** to automate real-world e-commerce scenarios on [Flipkart.com](https://www.flipkart.com/)

[![Node.js](https://img.shields.io/badge/Node.js-25.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.52-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Cucumber](https://img.shields.io/badge/Cucumber-BDD-23D96C?logo=cucumber&logoColor=white)](https://cucumber.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Challenge Overview](#-challenge-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [How It Works](#-how-it-works)
- [Page Object Model Design](#-page-object-model-design)
- [BDD Scenario](#-bdd-scenario)
- [Data Extraction Strategy](#-data-extraction-strategy)
- [Environment Configuration](#%EF%B8%8F-environment-configuration)
- [Test Lifecycle](#-test-lifecycle)
- [Sample Output](#-sample-output)
- [NPM Scripts](#-npm-scripts)
- [Design Decisions](#-design-decisions)

---

## 🎯 Challenge Overview

This framework was built as a **3-hour SDET interview challenge** — ported from the original Java/Selenium stack to a modern JavaScript ecosystem:

| Requirement | Status |
|---|:---:|
| Build BDD / POM automation framework from scratch | ✅ |
| Navigate to Flipkart homepage | ✅ |
| Handle unexpected promotional pop-ups | ✅ |
| Search for "Shoes for Men" | ✅ |
| Implement pagination (Page 1 & 2) | ✅ |
| Extract MRP & Discount Percentage | ✅ |
| Ensure proper browser teardown | ✅ |

---

## 🔧 Tech Stack

The original challenge specified Java/Selenium — this framework reimplements it using a **modern JS stack**:

```
┌─────────────────────────────────────────────────────────┐
│           Original Stack    →    JS Stack               │
├─────────────────────────────────────────────────────────┤
│           Java              →    Node.js                │
│           Selenium          →    Playwright              │
│           TestNG            →    Cucumber.js (BDD)       │
│           Maven             →    npm                     │
│           Eclipse           →    VS Code                 │
└─────────────────────────────────────────────────────────┘
```

| Technology | Role | Why This Choice |
|---|---|---|
| **Node.js** | Runtime | Fast, async-native, huge ecosystem |
| **Playwright** | Browser Automation | Auto-wait, superior popup handling, built-in assertions |
| **Cucumber.js** | BDD Framework | Gherkin syntax, readable by non-technical stakeholders |
| **dotenv** | Configuration | Environment-based config (headed/headless, timeouts) |
| **Page Object Model** | Design Pattern | Maintainable, reusable, scalable test architecture |

---

## 🏗 Architecture

### High-Level Data Flow

```mermaid
graph TD
    A["🥒 Feature File<br/><i>Gherkin BDD Scenario</i>"] --> B["📝 Step Definitions<br/><i>Maps steps to actions</i>"]
    B --> C["📄 Page Objects<br/><i>POM Layer</i>"]
    C --> D["🎭 Playwright<br/><i>Browser Engine</i>"]
    D --> E["🌐 Flipkart.com<br/><i>Target Application</i>"]

    F["⚙️ cucumber.js<br/><i>Runner Config</i>"] -.-> B
    G["🔄 hooks.js<br/><i>Lifecycle Hooks</i>"] -.-> D
    H["🔐 .env<br/><i>Environment Config</i>"] -.-> G
    I["📊 logger.js<br/><i>Output Formatter</i>"] -.-> B
```

### Layer Responsibility

```mermaid
graph LR
    subgraph "BDD Layer"
        A[Feature Files]
        B[Step Definitions]
    end
    subgraph "POM Layer"
        C[BasePage]
        D[HomePage]
        E[SearchResultsPage]
    end
    subgraph "Infrastructure"
        F[World Context]
        G[Hooks]
        H[Logger]
    end
    subgraph "External"
        I[Playwright]
        J[Flipkart.com]
    end

    A --> B
    B --> D
    B --> E
    D --> C
    E --> C
    C --> I
    I --> J
    F --> D
    F --> E
    G --> I
    B --> H
```

---

## 📁 Project Structure

```
testkart/
│
├── 📄 package.json                    # Dependencies & npm scripts
├── 📄 cucumber.js                     # Cucumber runner configuration
├── 📄 .env                            # Environment variables (URL, timeouts, browser)
├── 📄 .gitignore                      # Git exclusions
├── 📄 README.md                       # This file
│
├── 🥒 features/                       # ── BDD LAYER ──
│   └── flipkart-shoes.feature         # Gherkin scenario (human-readable)
│
├── 📝 step-definitions/               # ── GLUE CODE ──
│   └── flipkart-shoes.steps.js        # Maps Gherkin → Page Object calls
│
├── 📄 pages/                          # ── PAGE OBJECT MODEL ──
│   ├── BasePage.js                    # Abstract base (navigate, wait, click, screenshot)
│   ├── HomePage.js                    # Flipkart home (popup handling, search)
│   └── SearchResultsPage.js           # Search results (pagination, data extraction)
│
├── ⚙️ support/                         # ── FRAMEWORK INFRASTRUCTURE ──
│   ├── world.js                       # Custom Cucumber World (browser + data store)
│   └── hooks.js                       # Before/After hooks (launch, teardown, screenshots)
│
├── 🛠 utils/                           # ── UTILITIES ──
│   └── logger.js                      # Formatted console tables & statistics
│
├── 📊 reports/                        # Generated HTML/JSON test reports
└── 📸 screenshots/                    # Failure screenshots (auto-captured)
```

### File Dependency Graph

```mermaid
graph TD
    hooks["hooks.js"] --> world["world.js"]
    hooks --> dotenv[".env"]
    world --> HomePage["HomePage.js"]
    world --> SearchResultsPage["SearchResultsPage.js"]
    HomePage --> BasePage["BasePage.js"]
    SearchResultsPage --> BasePage
    steps["flipkart-shoes.steps.js"] --> world
    steps --> logger["logger.js"]
    feature["flipkart-shoes.feature"] --> steps
    cucumber["cucumber.js"] --> feature
    cucumber --> steps
    cucumber --> hooks

    style feature fill:#23D96C,color:#fff
    style BasePage fill:#2563EB,color:#fff
    style HomePage fill:#3B82F6,color:#fff
    style SearchResultsPage fill:#3B82F6,color:#fff
    style hooks fill:#F59E0B,color:#fff
    style world fill:#F59E0B,color:#fff
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ installed
- **npm** v9+ installed

### Installation & Run

```bash
# 1️⃣  Clone and enter the project
cd testkart

# 2️⃣  Install dependencies
npm install

# 3️⃣  Install Playwright's Chromium browser
npm run install:browsers

# 4️⃣  Run the test suite (headed mode — watch the browser)
npm test

# 5️⃣  Or run in headless mode (for CI/CD)
npm run test:headless
```

---

## ⚡ How It Works

### End-to-End Test Flow

```mermaid
sequenceDiagram
    participant C as 🥒 Cucumber Runner
    participant H as 🔄 Hooks
    participant S as 📝 Step Definitions
    participant P as 📄 Page Objects
    participant B as 🎭 Playwright Browser
    participant F as 🌐 Flipkart.com

    C->>H: Before Hook
    H->>B: Launch Chromium
    B-->>H: Browser Ready

    C->>S: Given: Navigate to homepage
    S->>P: HomePage.open()
    P->>B: page.goto(flipkart.com)
    B->>F: HTTP Request
    F-->>B: HTML Response
    B-->>P: Page Loaded

    C->>S: And: Handle pop-ups
    S->>P: HomePage.dismissPopup()
    P->>B: Escape / Close Button
    B-->>P: Popup Dismissed

    C->>S: When: Search "Shoes for Men"
    S->>P: HomePage.searchProduct()
    P->>B: Fill & Submit
    B->>F: Search Request
    F-->>B: Results Page

    C->>S: Then: Extract data (Page 1)
    S->>P: SearchResultsPage.extractProductData(1)
    P->>B: page.evaluate() — DOM scan
    B-->>P: Product Array [40 items]

    C->>S: When: Navigate to Page 2
    S->>P: SearchResultsPage.goToPage(2)
    P->>B: Click pagination / URL param
    B->>F: Page 2 Request
    F-->>B: Page 2 Results

    C->>S: Then: Extract data (Page 2)
    S->>P: SearchResultsPage.extractProductData(2)
    P->>B: page.evaluate() — DOM scan
    B-->>P: Product Array [40 items]

    C->>S: Then: Display consolidated results
    S->>S: Logger.displayConsolidatedResults()
    Note over S: 📊 80+ products displayed

    C->>H: After Hook
    H->>B: page.close() → context.close() → browser.close()
    B-->>H: ✅ Teardown Complete
```

---

## 📄 Page Object Model Design

The POM pattern encapsulates all page interactions into **reusable, maintainable classes**:

### Class Hierarchy

```mermaid
classDiagram
    class BasePage {
        +Page page
        +int defaultTimeout
        +navigate(url)
        +getTitle()
        +getCurrentUrl()
        +waitForPageLoad()
        +waitForElement(selector)
        +isElementVisible(selector)
        +click(selector)
        +type(selector, text)
        +getText(selector)
        +takeScreenshot(name)
    }

    class HomePage {
        +String searchInput
        +String popupCloseButton
        +open()
        +dismissPopup()
        +searchProduct(term)
    }

    class SearchResultsPage {
        +String productCard
        +String sellingPrice
        +String originalMRP
        +hasSearchResults()
        +extractProductData(pageNum)
        +goToPage(targetPage)
        +getCurrentPageNumber()
        +scrollToLoadAllProducts()
    }

    BasePage <|-- HomePage : extends
    BasePage <|-- SearchResultsPage : extends
```

### What Each Page Handles

| Page Object | Responsibilities | Key Methods |
|---|---|---|
| **BasePage** | Navigation, waits, clicks, screenshots | `navigate()`, `waitForPageLoad()`, `isElementVisible()` |
| **HomePage** | Flipkart homepage interactions | `open()`, `dismissPopup()`, `searchProduct()` |
| **SearchResultsPage** | Product data & pagination | `extractProductData()`, `goToPage()`, `scrollToLoadAllProducts()` |

---

## 🥒 BDD Scenario

The test scenario is written in **Gherkin** — a human-readable format that serves as both documentation and executable specification:

```gherkin
@flipkart @shoes @e2e
Feature: Flipkart Men's Shoes — Search & Data Extraction

  Scenario: Extract MRP and Discount Percentage from Page 1 and Page 2
    Given I navigate to the Flipkart homepage
    And I handle any promotional pop-ups
    When I search for "Shoes for Men"
    Then I should see search results for shoes

    When I scroll to load all products on the current page
    Then I extract MRP and Discount Percentage from page 1
    And I display the results for page 1

    When I navigate to page 2
    Then I should be on page 2

    When I scroll to load all products on the current page
    Then I extract MRP and Discount Percentage from page 2
    And I display the results for page 2

    Then I display the consolidated results from all pages
```

### Step Mapping Flow

```
Feature File (WHAT)  →  Step Definitions (HOW)  →  Page Objects (WHERE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"I navigate to homepage"  →  Given step  →  HomePage.open()
"I handle pop-ups"        →  Given step  →  HomePage.dismissPopup()
"I search for X"          →  When step   →  HomePage.searchProduct(X)
"I extract data from N"   →  Then step   →  SearchResultsPage.extractProductData(N)
"I navigate to page N"    →  When step   →  SearchResultsPage.goToPage(N)
"display consolidated"    →  Then step   →  Logger.displayConsolidatedResults()
```

---

## 🔍 Data Extraction Strategy

### The Problem

Flipkart uses **obfuscated CSS class names** (e.g., `_2WkVRV`, `Nx9bqj`) that change frequently with every deployment. Traditional selector-based scraping breaks constantly.

### The Solution: Content-Pattern Detection

Instead of relying on class names, our extraction uses **content patterns** and **CSS computed styles**:

```mermaid
flowchart TD
    A["🔍 Scan ALL div/span elements"] --> B{"Contains<br/>'XX% off'?"}
    B -->|Yes| C["📌 Found Discount Element"]
    B -->|No| D["Skip"]

    C --> E["⬆️ Walk UP DOM tree<br/>to find product card container"]
    E --> F{"Has image +<br/>₹ price +<br/>height 100-800px?"}
    F -->|Yes| G["✅ Found Product Card"]
    F -->|No| H["⬆️ Go up one more level"]
    H --> F

    G --> I["Extract from card:"]
    I --> J["💰 Selling Price<br/><i>₹XXX without strikethrough</i>"]
    I --> K["🏷️ MRP<br/><i>₹XXX with line-through CSS</i>"]
    I --> L["📉 Discount<br/><i>XX% off text</i>"]
    I --> M["📝 Title<br/><i>Link text > 10 chars</i>"]

    style C fill:#23D96C,color:#fff
    style G fill:#2563EB,color:#fff
    style J fill:#F59E0B,color:#000
    style K fill:#EF4444,color:#fff
    style L fill:#8B5CF6,color:#fff
```

### Detection Rules

| Data Point | Detection Method |
|---|---|
| **Discount** | Regex: `/^\d+%\s*off$/i` on leaf elements |
| **Selling Price** | Regex: `/^₹[\d,]+$/` + NO `text-decoration: line-through` |
| **MRP** | Regex: `/^₹[\d,]+$/` + HAS `text-decoration: line-through` |
| **Product Title** | `<a>` tag text > 10 chars, not starting with ₹ or % |
| **Product Card** | Ancestor with `<img>` + price elements + height 100-800px |

---

## ⚙️ Environment Configuration

All runtime settings are controlled via the `.env` file:

```env
# Flipkart Base URL
BASE_URL=https://www.flipkart.com/

# Search Configuration
SEARCH_TERM=Shoes for Men

# Browser Configuration
HEADLESS=false          # true = CI mode, false = watch the browser
SLOW_MO=100             # Delay between actions (ms) for visibility
VIEWPORT_WIDTH=1440     # Browser window width
VIEWPORT_HEIGHT=900     # Browser window height

# Pagination
MAX_PAGES=2             # Number of pages to scrape

# Timeouts (ms)
DEFAULT_TIMEOUT=30000   # Wait timeout for elements
NAVIGATION_TIMEOUT=45000 # Page navigation timeout
```

### Where Each Variable Is Used

```mermaid
graph LR
    ENV[".env File"] --> hooks["hooks.js<br/><i>dotenv.config()</i>"]

    hooks --> world["world.js"]
    hooks --> base["BasePage.js"]
    hooks --> home["HomePage.js"]

    world --> |HEADLESS| B1["Browser Mode"]
    world --> |SLOW_MO| B2["Action Speed"]
    world --> |VIEWPORT_*| B3["Window Size"]
    world --> |*_TIMEOUT| B4["Page Timeouts"]

    base --> |DEFAULT_TIMEOUT| B5["Element Waits"]
    base --> |NAVIGATION_TIMEOUT| B6["goto() Timeout"]

    home --> |BASE_URL| B7["Flipkart URL"]

    style ENV fill:#F59E0B,color:#000
    style B1 fill:#3B82F6,color:#fff
    style B2 fill:#3B82F6,color:#fff
    style B3 fill:#3B82F6,color:#fff
```

---

## 🔄 Test Lifecycle

### Browser Lifecycle Management

```mermaid
stateDiagram-v2
    [*] --> BeforeHook: Scenario Start

    BeforeHook --> BrowserLaunch: launchBrowser()
    BrowserLaunch --> ContextCreate: newContext(viewport, userAgent)
    ContextCreate --> PageCreate: newPage()
    PageCreate --> TestExecution: Page Objects Ready

    TestExecution --> ScenarioPass: All Steps ✅
    TestExecution --> ScenarioFail: Step Failure ❌

    ScenarioFail --> ScreenshotCapture: page.screenshot()
    ScreenshotCapture --> AfterHook

    ScenarioPass --> AfterHook

    AfterHook --> PageClose: page.close()
    PageClose --> ContextClose: context.close()
    ContextClose --> BrowserClose: browser.close()
    BrowserClose --> [*]: Teardown Complete ✅
```

### Popup Handling Strategy

The framework uses a **multi-strategy fallback** approach for popup dismissal:

```
Strategy 1: CSS class-based close button     → Try first
    ↓ (failed)
Strategy 2: XPath-based close button         → Fallback
    ↓ (failed)
Strategy 3: Generic text-based close button  → Broader match
    ↓ (failed)
Strategy 4: Escape key press                 → Universal fallback
    ↓ (failed)
Result: Log "No popup detected" and continue → Graceful handling
```

### Pagination Strategy

```
Strategy 1: Click page number link directly   → Most precise
    ↓ (failed)
Strategy 2: Click "Next" button               → Common pattern
    ↓ (failed)
Strategy 3: URL parameter manipulation        → Most reliable fallback
             (?page=2 appended to URL)
```

---

## 📊 Sample Output

### Console Output

```
  ══════════════════════════════════════════
  🚀 TestKart — Launching Browser
  ── Mode: Headed
  ══════════════════════════════════════════

  🌐 Navigating to: https://www.flipkart.com/
  ✅ Page loaded: Online Shopping Site for Mobiles...
  🔍 Checking for promotional pop-ups...
  ✅ Pop-up dismissed using: Escape key
  🔎 Searching for: "Shoes for Men"
  ✅ Search results loaded for: "Shoes for Men"
  ✅ Search results are displayed

  📦 Extracting product data from Page 1...
  ✅ Extracted 45 products from Page 1

  ┌─────────────────────────────────────────────────────────────┐
  │  📄 PAGE 1 RESULTS — 45 Products Found                     │
  └─────────────────────────────────────────────────────────────┘
  ┌───┬────┬─────────────────────────────┬──────────┬─────────┬───────────┐
  │   │ #  │ Product                     │ Price    │ MRP     │ Discount  │
  ├───┼────┼─────────────────────────────┼──────────┼─────────┼───────────┤
  │ 0 │ 1  │ Exclusive Trendy Sports...  │ ₹256     │ ₹1,299  │ 80% off   │
  │ 1 │ 2  │ Trendy & Stylish Runnin... │ ₹240     │ ₹999    │ 75% off   │
  │ 2 │ 3  │ ES-21 Hockey Walking/...   │ ₹452     │ ₹1,999  │ 77% off   │
  │...│... │ ...                         │ ...      │ ...     │ ...       │
  └───┴────┴─────────────────────────────┴──────────┴─────────┴───────────┘

  📄 Navigating to Page 2...
  ✅ Navigated to Page 2

  📦 Extracting product data from Page 2...
  ✅ Extracted 45 products from Page 2

  ╔══════════════════════════════════════════════════╗
  ║  📊 CONSOLIDATED RESULTS — ALL PAGES            ║
  ╠══════════════════════════════════════════════════╣
  ║  📄 Page 1: 45 products                         ║
  ║  📄 Page 2: 45 products                         ║
  ╠══════════════════════════════════════════════════╣
  ║  📦 Total Products Extracted: 90                 ║
  ║  💰 Products with MRP: 90                        ║
  ║  🏷️  Products with Discount: 80                  ║
  ╚══════════════════════════════════════════════════╝

  🎯 Total products extracted: 90
  ✅ Data extraction complete!

  🧹 Tearing down browser...
  ✅ Browser teardown complete

  ══════════════════════════════════════════
  🏁 TestKart — Test Execution Complete
  ──────────────────────────────────────────
  📊 Reports: reports/cucumber-report.html
  📸 Screenshots: screenshots/
  ══════════════════════════════════════════

  1 scenario (1 passed)
  13 steps (13 passed)
  0m37.400s
```

---

## 📦 NPM Scripts

| Script | Command | Description |
|---|---|---|
| `npm test` | `npx cucumber-js` | Run all BDD scenarios (headed) |
| `npm run test:headed` | `HEADLESS=false npx cucumber-js` | Explicitly headed mode |
| `npm run test:headless` | `HEADLESS=true npx cucumber-js` | Headless mode (CI/CD) |
| `npm run install:browsers` | `npx playwright install chromium` | Download Chromium |
| `npm run pretest` | `mkdir -p reports screenshots` | Create output directories |

---

## 💡 Design Decisions

### Why Playwright over Selenium?

| Feature | Selenium | Playwright |
|---|---|---|
| Auto-wait for elements | ❌ Manual waits | ✅ Built-in |
| Popup handling | ❌ Complex | ✅ Native support |
| `page.evaluate()` for DOM | ❌ Limited | ✅ Full browser context |
| Network interception | ❌ Requires proxy | ✅ Built-in |
| Speed | 🐢 Slower | 🚀 Faster |
| Multi-browser support | ✅ Yes | ✅ Yes |

### Why Content-Based Extraction?

Flipkart uses **obfuscated, randomly-generated CSS class names** that change with every deployment (e.g., `_2WkVRV`, `Nx9bqj`, `slAVV4`). Our approach:

- ❌ ~~Class-based selectors~~ → Break with every Flipkart deploy
- ✅ **Content patterns** (₹ symbol, % off, strikethrough CSS) → Resilient to UI changes

### Why Custom Cucumber World?

The `World` object serves as a **shared context** across all step definitions:

```
World = {
  browser,              // Playwright Browser instance
  context,              // Browser Context (viewport, cookies)
  page,                 // Active Page
  homePage,             // HomePage POM instance
  searchResultsPage,    // SearchResultsPage POM instance
  productsData: []      // Accumulated product data across pages
}
```

---

## 🔮 Extending the Framework

### Adding a New Page Object

```javascript
// pages/ProductDetailPage.js
const BasePage = require('./BasePage');

class ProductDetailPage extends BasePage {
  constructor(page) {
    super(page);
    // Define locators
  }
  // Define methods
}
module.exports = ProductDetailPage;
```

### Adding a New Scenario

```gherkin
# features/flipkart-electronics.feature
@electronics
Scenario: Search and extract laptop prices
  Given I navigate to the Flipkart homepage
  When I search for "Laptops"
  Then I extract pricing data from page 1
```

---

<div align="center">

**Built with ❤️ for the SDET Community**

*TestKart — Because real SDET interviews test what you can build, not what you can memorize.*

</div>
]]>
