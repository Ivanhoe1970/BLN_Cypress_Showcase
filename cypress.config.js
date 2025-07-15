const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    baseUrl: 'https://live.blacklinesafety.com',
    setupNodeEvents(on, config) {},
    env: {
      // Existing non-gas protocol path
      protocolPath: 'https://ivanhoe1970.github.io/BLN_Cypress_Showcase/automated-basic-non-gas-alert-protocol/index.html',
      
      // Gas protocol paths
      // PRODUCTION (GitHub Pages - NOW ACTIVE):
      gasProtocolPath: 'https://ivanhoe1970.github.io/BLN_Cypress_Showcase/automated-gas-alert-protocol/index.html',
      
      // LOCAL DEVELOPMENT (commented out for CI/CD):
      // gasProtocolPath: 'http://127.0.0.1:5501/automated-gas-alert-protocol/index.html',
      
      gasMonitoringPath: '/gas-monitoring',
      
      // API endpoints (TBD - since this is local development)
      // API_BASE_URL: 'TBD - local development may not need API calls',
      
      // Authentication (same as non-gas, but for LOCAL testing)
      // PORTAL_USERNAME: 'same_as_non_gas',
      // PORTAL_PASSWORD: 'same_as_non_gas',
      
      // Test device for gas alerts (LOCAL TESTING)
      // TEST_DEVICE_ID: 'G7-TEST-001', // May not be needed for local development
      
      // Gas-specific endpoints (LOCAL DEVELOPMENT - may not be needed)
      // GAS_ALERT_SIMULATION_ENDPOINT: '/gas-alerts/simulate',
      // GAS_DEVICES_ENDPOINT: '/gas-devices',
      // GAS_PERSONNEL_ENDPOINT: '/gas-personnel'
    }
  },
});