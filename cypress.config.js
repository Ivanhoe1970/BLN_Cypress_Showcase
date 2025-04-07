const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://live.blacklinesafety.com',
    fileServerFolder: '.',
    specPattern: 'cypress/e2e/**/*.cy.js',  // 👈 this is the correct pattern now
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {},
  },
});
