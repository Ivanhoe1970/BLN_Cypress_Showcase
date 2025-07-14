// ========================================
// LIVE BLACKLINE PORTAL COMMANDS
// ========================================

Cypress.Commands.add('loginViaApi', () => {
  // Make the login request to the correct API endpoint
  cy.request({
    method: 'POST',
    url: 'https://live.blacklinesafety.com/rest/auth-token',  // Correct login API endpoint
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      username: Cypress.env('emailAddress'),
      password: Cypress.env('password'),
    },
    failOnStatusCode: false,  // Don't fail the test if the response status is not 2xx
  }).then((response) => {
    // Ensure we got a 200 OK response
    expect(response.status).to.eq(200);
    
    // Save the token in localStorage
    window.localStorage.setItem('auth_token', response.body.token); // Assuming the response has the token
  });
});

// ========================================
// EMERGENCY PROTOCOL TESTING COMMANDS
// ========================================

Cypress.Commands.add('visitProtocol', () => {
  cy.visit('http://127.0.0.1:5501/cypress/e2e/automated-basic-non-gas-alert-protocol/index.html');
});

Cypress.Commands.add('loadAlertFixture', (fixtureFile = 'alerts.json') => {
  cy.fixture(fixtureFile).then(alertData => {
    cy.window().then(win => {
      win.testAlertFixture = alertData;
    });
  });
});

Cypress.Commands.add('completeStep', (stepNumber, outcome = null, customNote = null) => {
  // Click step button to start the step
  cy.get(`#step-${stepNumber} button:first`).click();
  
  // Select outcome if provided
  if (outcome) {
    cy.get(`[data-cy="step-${stepNumber}-outcome"]`).select(outcome);
  }
  
  // Add custom note if provided (otherwise use auto-populated note)
  if (customNote) {
    cy.get(`[data-cy="step-${stepNumber}-note"]`).clear().type(customNote);
  }
  
  // Post the note
  cy.get(`[data-cy="step-${stepNumber}-post"]`).click();
});

Cypress.Commands.add('completeStepWithTimer', (stepNumber, outcome = null, waitForTimer = false) => {
  // Special handling for steps with timers (like Step 2)
  cy.get(`#step-${stepNumber} button:first`).click();
  
  if (outcome) {
    cy.get(`[data-cy="step-${stepNumber}-outcome"]`).select(outcome);
  }
  
  if (waitForTimer && stepNumber === 2) {
    // Wait for 2-minute timer to complete (for testing purposes, could be shortened)
    cy.get('#step-2-countdown').should('contain.text', '00:00');
  }
  
  cy.get(`[data-cy="step-${stepNumber}-post"]`).click();
});

Cypress.Commands.add('makeDispatchDecision', (decision, serviceType = null, skipReason = null) => {
  // Step 5 dispatch decision
  cy.get('[data-cy="dispatch-decision"]').select(decision);
  
  if (decision === 'Yes' && serviceType) {
    cy.get('[data-cy="dispatch-service"]').select(serviceType);
    cy.get('[data-cy="call-dispatch"]').click();
  }
  
  if (decision === 'No' && skipReason) {
    cy.get('[data-cy="skip-reason"]').select(skipReason);
  }
  
  cy.get('[data-cy="step-5-post"]').click();
});

Cypress.Commands.add('resolveAlert', (resolutionReason) => {
  cy.get('[data-cy="resolution-reason"]').select(resolutionReason);
  cy.get('[data-cy="resolve-alert"]').click();
});

Cypress.Commands.add('cancelResolution', () => {
  cy.get('[data-cy="cancel-resolution"]').click();
});

Cypress.Commands.add('addManualNote', (noteText) => {
  cy.get('#manual-notes').type(noteText);
  cy.get('[data-cy="add-manual-note"]').click();
});

// ========================================
// VERIFICATION COMMANDS
// ========================================

Cypress.Commands.add('verifyLogEntry', (expectedText) => {
  cy.get('#protocolLog').should('contain.text', expectedText);
});

Cypress.Commands.add('verifyStepCompleted', (stepNumber) => {
  cy.get(`#step-${stepNumber}`).should('have.class', 'completed');
  cy.get(`#step-${stepNumber}-status`).should('contain.text', 'Completed');
});

Cypress.Commands.add('verifyStepActive', (stepNumber) => {
  cy.get(`#step-${stepNumber}`).should('have.class', 'active');
  cy.get(`#step-${stepNumber}-status`).should('contain.text', 'Pending');
});

Cypress.Commands.add('verifyTimerActive', (description = null) => {
  cy.get('#globalTimer').should('have.class', 'timer-active');
  cy.get('[data-cy="cancel-global-timer"]').should('not.be.disabled');
  
  if (description) {
    cy.get('#timerInfo').should('contain.text', description);
  }
});

Cypress.Commands.add('verifyTimerInactive', () => {
  cy.get('#globalTimer').should('have.class', 'timer-inactive');
  cy.get('[data-cy="cancel-global-timer"]').should('be.disabled');
  cy.get('#timerDisplay').should('contain.text', '--:--');
});

Cypress.Commands.add('verifyResolutionSuggestion', (expectedResolution) => {
  cy.get('[data-cy="resolution-reason"]').should('have.value', expectedResolution);
});

Cypress.Commands.add('verifyProtocolLocked', () => {
  // Verify protocol is locked after resolution
  cy.get('.container').should('have.class', 'alert-resolved');
  cy.get('[data-cy="resolve-alert"]').should('be.disabled');
});

Cypress.Commands.add('verifyProtocolUnlocked', () => {
  // Verify protocol is unlocked after canceling resolution
  cy.get('.container').should('not.have.class', 'alert-resolved');
  cy.get('[data-cy="resolve-alert"]').should('not.be.disabled');
});

// ========================================
// WORKFLOW COMMANDS
// ========================================

Cypress.Commands.add('completeBasicProtocol', () => {
  // Complete steps 1-3 with standard outcomes
  cy.completeStep(1, 'no-answer');
  cy.completeStep(2); // Uses pre-filled message text
  cy.completeStep(3, 'no-answer-voicemail');
});

Cypress.Commands.add('completeEmergencyContactAttempts', () => {
  // Complete both emergency contact attempts
  cy.completeStep('4-1', 'no-answer-voicemail');
  cy.completeStep('4-2', 'no-answer-voicemail');
});

Cypress.Commands.add('completeFullProtocolWithDispatch', (serviceType = 'EMS') => {
  cy.completeBasicProtocol();
  cy.completeEmergencyContactAttempts();
  cy.makeDispatchDecision('Yes', serviceType);
  cy.resolveAlert('false-alert-with-dispatch');
});

Cypress.Commands.add('completeFullProtocolWithoutDispatch', () => {
  cy.completeBasicProtocol();
  cy.completeEmergencyContactAttempts();
  cy.makeDispatchDecision('No', null, 'device-offline');
  cy.resolveAlert('false-alert-without-dispatch');
});

// ========================================
// GLOBAL ERROR HANDLING
// ========================================

Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});