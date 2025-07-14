const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    baseUrl: 'https://live.blacklinesafety.com',
    setupNodeEvents(on, config) {},
    env: {
      protocolPath: 'automated-basic-non-gas-alert-protocol/index.html'
    }
  },
});