// ***********************************************************
// This support/e2e.js file is processed and
// loaded automatically before your test files.
//
// Use it for global config and behavior modifications.
//
// Docs: https://on.cypress.io/configuration
// ***********************************************************

import './commands';

Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific known frontend errors
  if (err.message.includes('_LTracker is not defined')) {
    return false; // Prevent test failure
  }

  // Allow all other exceptions to fail the test
  return true;
});
