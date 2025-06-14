const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5500', // Local app base URL
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // no special setup needed
    },
    env: {
      protocolPath: '/automated-basic-non-gas-alert-protocol/index.html', 
      blnUrl: 'https://live.blacklinesafety.com'
    }
  }
});