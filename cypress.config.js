const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',  // ✅ looks inside root-level /cypress/e2e
    supportFile: 'cypress/support/commands.js',
    baseUrl: 'https://live.blacklinesafety.com',
    setupNodeEvents(on, config) {},
  },
});
