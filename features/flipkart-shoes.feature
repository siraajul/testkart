# ══════════════════════════════════════════════
# flipkart-shoes.feature
# TestKart — BDD + POM Automation Framework
# ══════════════════════════════════════════════
# E2E scenario: Search Flipkart for Men's Shoes,
# extract pricing data across multiple pages.

@flipkart @shoes @e2e
Feature: Flipkart Men's Shoes — Search & Data Extraction
  As an SDET automation engineer
  I want to search for men's shoes on Flipkart
  And extract pricing data across multiple pages
  So that I can validate product listing information

  Background:
    Given I navigate to the Flipkart homepage
    And I handle any promotional pop-ups

  @smoke @pagination
  Scenario: Extract MRP and Discount Percentage from Page 1 and Page 2
    When I search for "Shoes for Men"
    Then I should see search results for shoes

    # ── Page 1 Data Extraction ──
    When I scroll to load all products on the current page
    Then I extract MRP and Discount Percentage from page 1
    And I display the results for page 1

    # ── Pagination to Page 2 ──
    When I navigate to page 2
    Then I should be on page 2

    # ── Page 2 Data Extraction ──
    When I scroll to load all products on the current page
    Then I extract MRP and Discount Percentage from page 2
    And I display the results for page 2

    # ── Consolidated Report ──
    Then I display the consolidated results from all pages
