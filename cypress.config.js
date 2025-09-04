const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://127.0.0.1:5501',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    env: {
      emergencyProtocolPath: '/automated-gas-alert-protocol/emergency-protocol-clean.html',
    },
    setupNodeEvents(on, config) {},
  },
});