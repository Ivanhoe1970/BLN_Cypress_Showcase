// ***********************************************************
// This support/e2e.js is processed and loaded automatically
// before your test files. Put global config and behavior here.
// ***********************************************************

// Register all custom commands
import './commands'

// Emergency Protocol specific timeouts
Cypress.config('defaultCommandTimeout', 15000)
Cypress.config('pageLoadTimeout', 30000)

// Ignore specific, known frontend errors so they don't fail tests
Cypress.on('uncaught:exception', (err) => {
  // Example noisy trackers or minor layout errors we don't care about in tests
  if (
    err?.message?.includes('_LTracker is not defined') ||
    err?.message?.includes('ResizeObserver loop limit exceeded') ||
    err?.message?.includes('Non-Error promise rejection captured') ||
    err?.message?.includes('Loading CSS chunk') ||
    // Emergency protocol specific errors that are safe to ignore
    err?.message?.includes('Audio context was not allowed to start') ||
    err?.message?.includes('play() failed because the user didn\'t interact')
  ) {
    return false
  }
  // Let all other errors fail the test
})

// Global before hook for emergency protocol tests
beforeEach(() => {
  // Clear any existing timers or intervals from previous tests
  cy.window().then((win) => {
    // Clear any global timers
    if (win.globalTimerInterval) {
      clearInterval(win.globalTimerInterval);
      win.globalTimerInterval = null;
    }
    // Clear any gas monitoring intervals
    if (win.gasUpdateInterval) {
      clearInterval(win.gasUpdateInterval);
      win.gasUpdateInterval = null;
    }
    // Reset any global state
    win.currentAlert = null;
    win.dispatchMade = false;
  });
})