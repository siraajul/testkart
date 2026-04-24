// ══════════════════════════════════════════════
// Cucumber.js Configuration
// TestKart — BDD + POM Automation Framework
// ══════════════════════════════════════════════

module.exports = {
  default: {
    // Feature files location
    paths: ['features/**/*.feature'],

    // Step definitions and support files
    require: [
      'step-definitions/**/*.js',
      'support/**/*.js',
    ],

    // Formatters
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
    ],

    // Fail fast on first failure (toggle for CI)
    failFast: false,
  },
};
