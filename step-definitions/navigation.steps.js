// ══════════════════════════════════════════════════════════
// navigation.steps.js — Navigation & Setup Steps
// ══════════════════════════════════════════════════════════
// Given steps: homepage navigation, popup handling

const { Given } = require('@cucumber/cucumber');

Given('I navigate to the Flipkart homepage', { timeout: 60000 }, async function () {
  await this.homePage.open();
  const title = await this.homePage.getTitle();
  console.log(`  📌 Page Title: "${title}"`);
});

Given('I handle any promotional pop-ups', { timeout: 15000 }, async function () {
  await this.homePage.dismissPopup();
});
