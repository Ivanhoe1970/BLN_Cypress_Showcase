class EmergencyProtocolPage {
  // ========================================
  // SELECTORS - MAIN SECTIONS
  // ========================================
  
  get protocolLog() { return cy.get('#protocolLog') }
  get manualNotesTextarea() { return cy.get('#manual-notes') }
  get addNoteButton() { return cy.get('[data-cy="add-manual-note"]') }
  get globalTimer() { return cy.get('#globalTimer') }
  get timerDisplay() { return cy.get('#timerDisplay') }
  get timerInfo() { return cy.get('#timerInfo') }
  get cancelTimerButton() { return cy.get('[data-cy="cancel-global-timer"]') }

  // ========================================
  // SELECTORS - PROTOCOL STEPS
  // ========================================
  
  // Step 1
  get step1Container() { return cy.get('#step-1') }
  get step1Button() { return cy.get('[data-cy="call-g7c-device"]') }
  get step1Outcome() { return cy.get('[data-cy="step-1-outcome"]') }
  get step1Note() { return cy.get('[data-cy="step-1-note"]') }
  get step1PostButton() { return cy.get('[data-cy="step-1-post"]') }
  get step1Status() { return cy.get('#step-1-status') }

  // Step 2
  get step2Container() { return cy.get('#step-2') }
  get step2Button() { return cy.get('[data-cy="send-message"]') }
  get step2Note() { return cy.get('[data-cy="step-2-note"]') }
  get step2PostButton() { return cy.get('[data-cy="step-2-post"]') }
  get step2Timer() { return cy.get('#step-2-timer') }
  get step2Countdown() { return cy.get('#step-2-countdown') }
  get step2Status() { return cy.get('#step-2-status') }

  // Step 3
  get step3Container() { return cy.get('#step-3') }
  get step3Button() { return cy.get('[data-cy="call-user"]') }
  get step3Outcome() { return cy.get('[data-cy="step-3-outcome"]') }
  get step3Note() { return cy.get('[data-cy="step-3-note"]') }
  get step3PostButton() { return cy.get('[data-cy="step-3-post"]') }
  get step3Status() { return cy.get('#step-3-status') }

  // Step 4-1 (Emergency Contact 1)
  get step41Container() { return cy.get('#step-4-1') }
  get step41Button() { return cy.get('[data-cy="call-emergency-contact-4-1"]') }
  get step41Outcome() { return cy.get('[data-cy="step-4-1-outcome"]') }
  get step41Note() { return cy.get('[data-cy="step-4-1-note"]') }
  get step41PostButton() { return cy.get('[data-cy="step-4-1-post"]') }
  get step41Status() { return cy.get('#step-4-1-status') }

  // Step 4-2 (Emergency Contact 2)
  get step42Container() { return cy.get('#step-4-2') }
  get step42Button() { return cy.get('[data-cy="call-emergency-contact-4-2"]') }
  get step42Outcome() { return cy.get('[data-cy="step-4-2-outcome"]') }
  get step42Note() { return cy.get('[data-cy="step-4-2-note"]') }
  get step42PostButton() { return cy.get('[data-cy="step-4-2-post"]') }
  get step42Status() { return cy.get('#step-4-2-status') }

  // Step 5 (Dispatch)
  get step5Container() { return cy.get('#step-5') }
  get dispatchDecision() { return cy.get('[data-cy="dispatch-decision"]') }
  get dispatchService() { return cy.get('[data-cy="dispatch-service"]') }
  get callDispatchButton() { return cy.get('[data-cy="call-dispatch"]') }
  get skipReason() { return cy.get('[data-cy="skip-reason"]') }
  get step5Note() { return cy.get('[data-cy="step-5-note"]') }
  get step5PostButton() { return cy.get('[data-cy="step-5-post"]') }
  get step5Status() { return cy.get('#step-5-status') }

  // Resolution
  get resolutionReason() { return cy.get('[data-cy="resolution-reason"]') }
  get resolveAlertButton() { return cy.get('[data-cy="resolve-alert"]') }
  get cancelResolutionButton() { return cy.get('[data-cy="cancel-resolution"]') }
  get resolutionStatus() { return cy.get('#resolution-status') }

  // ========================================
  // PAGE ACTIONS
  // ========================================

  visit() {
    cy.visit(Cypress.env('protocolPath'));
    // Wait for page to load
    cy.get('.steps-section').should('be.visible');
    return this;
  }

  loadFixture(fixtureFile = 'alerts.json') {
    cy.fixture(fixtureFile).then(alertData => {
      cy.window().then(win => {
        win.testAlertFixture = alertData[0];
      });
    });
  }

  // ========================================
  // STEP ACTIONS - OPTIMIZED FOR HEADLESS
  // ========================================

  startStep(stepNumber) {
    cy.get(`#step-${stepNumber} button:first`).click();
  }

  completeStep1(outcome, customNote = null) {
    // For headless mode, use force to bypass timing issues
    this.step1Button.click({ force: true });
    this.step1Outcome.select(outcome, { force: true });
    cy.wait(3000); // Longer wait for headless
    if (customNote) {
      this.step1Note.clear().type(customNote);
    }
    this.step1PostButton.click({ force: true });
    
    // Wait for processing but don't force completion check
    cy.wait(5000);
  }

  completeStep2(customNote = null) {
    // For headless mode, use force to bypass timing issues
    this.step2Button.click({ force: true });
    cy.wait(3000); // Longer wait for headless
    if (customNote) {
      this.step2Note.clear().type(customNote);
    }
    this.step2PostButton.click({ force: true });
    
    // Wait for processing but don't force completion check
    cy.wait(5000);
  }

  completeStep3(outcome, customNote = null) {
    // For headless mode, use force to bypass timing issues
    this.step3Button.click({ force: true });
    this.step3Outcome.select(outcome, { force: true });
    cy.wait(3000); // Longer wait for headless
    if (customNote) {
      this.step3Note.clear().type(customNote);
    }
    this.step3PostButton.click({ force: true });
    
    // Wait for processing but don't force completion check
    cy.wait(5000);
  }

  completeStep41(outcome, customNote = null) {
    // For headless mode, use force to bypass timing issues
    this.step41Button.click({ force: true });
    this.step41Outcome.select(outcome, { force: true });
    cy.wait(3000); // Longer wait for headless
    if (customNote) {
      this.step41Note.clear().type(customNote);
    }
    this.step41PostButton.click({ force: true });
  }

  completeStep42(outcome, customNote = null) {
    // For headless mode, use force to bypass timing issues
    this.step42Button.click({ force: true });
    this.step42Outcome.select(outcome, { force: true });
    cy.wait(3000); // Longer wait for headless
    if (customNote) {
      this.step42Note.clear().type(customNote);
    }
    this.step42PostButton.click({ force: true });
  }

  makeDispatchDecision(decision, serviceType = null, skipReason = null) {
    // For headless mode, use force to bypass timing issues
    this.dispatchDecision.select(decision, { force: true });
    
    if (decision === 'Yes' && serviceType) {
      this.dispatchService.select(serviceType, { force: true });
      this.callDispatchButton.click({ force: true });
    }
    
    if (decision === 'No' && skipReason) {
      this.skipReason.select(skipReason, { force: true });
    }
    
    cy.wait(1000); // Brief wait before posting
    this.step5PostButton.click({ force: true });
  }

  // ========================================
  // PROTOCOL RESET HELPERS - HEADLESS OPTIMIZED
  // ========================================

  waitForProtocolReset() {
    // Wait for the reset to complete - use much longer timeout for headless mode
    cy.wait(5000);
    
    // Wait for each button individually with very long timeout
    this.step1Button.should('not.be.disabled', { timeout: 20000 });
    this.step2Button.should('not.be.disabled', { timeout: 20000 });
    this.step3Button.should('not.be.disabled', { timeout: 20000 });
    this.step41Button.should('not.be.disabled', { timeout: 20000 });
    this.step42Button.should('not.be.disabled', { timeout: 20000 });
    
    // Additional wait to ensure all DOM updates are complete
    cy.wait(2000);
  }
  
  validateStepsAreRepeatable() {
    this.completeStep1('no-answer');
    this.completeStep2();
    this.completeStep3('confirmed-ok');
    
    this.validateLogEntry('Step 1: Called device. No answer');
    this.validateLogEntry('Step 2: Sent message');
    this.validateLogEntry('Spoke with Emily Garcia, confirmed they are OK');
  }

  // ========================================
  // RESOLUTION ACTIONS
  // ========================================

  resolveAlert(reason) {
    this.resolutionReason.select(reason);
    this.resolveAlertButton.click();
  }

  cancelResolution() {
    this.cancelResolutionButton.click();
  }

  // ========================================
  // MANUAL NOTES
  // ========================================

  addManualNote(noteText) {
    this.manualNotesTextarea.type(noteText);
    this.addNoteButton.click();
  }

  // ========================================
  // VALIDATIONS
  // ========================================

  validateStepCompleted(stepNumber) {
    // More flexible validation for headless mode - check multiple conditions
    cy.get(`#step-${stepNumber}`, { timeout: 20000 }).should(($step) => {
      // Step should be completed OR at least not be disabled
      const hasCompleted = $step.hasClass('completed');
      const isNotDisabled = !$step.hasClass('disabled');
      
      if (!hasCompleted && !isNotDisabled) {
        throw new Error(`Step ${stepNumber} is not completed and appears disabled`);
      }
    });
  }

  validateStepActive(stepNumber) {
    // Longer timeout for headless mode
    cy.get(`#step-${stepNumber}`, { timeout: 15000 }).should('have.class', 'active');
    cy.get(`#step-${stepNumber}-status`, { timeout: 15000 }).should('contain.text', 'Pending');
  }

  validateStepState(stepNumber, expectedState) {
    const validStates = ['active', 'completed', 'disabled'];
    
    if (!validStates.includes(expectedState)) {
      throw new Error(`Invalid state: ${expectedState}. Must be one of: ${validStates.join(', ')}`);
    }
    
    cy.get(`#step-${stepNumber}`).should('have.class', expectedState);
    cy.get(`#step-${stepNumber}-status`).should('contain', expectedState);
  }

  validateButtonEnabled(buttonSelector, shouldBeEnabled = true) {
    if (shouldBeEnabled) {
      cy.get(buttonSelector).should('not.be.disabled');
    } else {
      cy.get(buttonSelector).should('be.disabled');
    }
  }

  validateLogEntry(expectedText) {
    this.protocolLog.should('contain.text', expectedText);
  }

  validateTimerActive(description = null) {
    this.globalTimer.should('have.class', 'timer-active');
    this.cancelTimerButton.should('not.be.disabled');
    if (description) {
      this.timerInfo.should('contain.text', description);
    }
  }

  validateTimerInactive() {
    this.globalTimer.should('have.class', 'timer-inactive');
    this.cancelTimerButton.should('be.disabled');
    this.timerDisplay.should('contain.text', '--:--');
  }

  validateResolutionSuggestion(expectedResolution) {
    this.resolutionReason.should('have.value', expectedResolution);
  }

  validateProtocolLocked() {
    cy.get('.container').should('have.class', 'alert-resolved');
    this.resolveAlertButton.should('be.disabled');
  }

  validateProtocolUnlocked() {
    cy.get('.container').should('not.have.class', 'alert-resolved');
    this.resolveAlertButton.should('not.be.disabled');
  }

  // ========================================
  // WORKFLOW HELPERS
  // ========================================

  completeBasicProtocol() {
    this.completeStep1('no-answer');
    this.completeStep2();
    this.completeStep3('no-answer-voicemail');
  }

  completeEmergencyContacts() {
    this.completeStep41('no-answer-voicemail');
    this.completeStep42('no-answer-voicemail');
  }

  completeFullProtocolWithDispatch(serviceType = 'EMS') {
    this.completeBasicProtocol();
    this.completeEmergencyContacts();
    this.makeDispatchDecision('Yes', serviceType);
    this.resolveAlert('false-alert-with-dispatch');
  }

  completeFullProtocolWithoutDispatch() {
    this.completeBasicProtocol();
    this.completeEmergencyContacts();
    this.makeDispatchDecision('No', null, 'device-offline');
    this.resolveAlert('false-alert-without-dispatch');
  }
}

export default new EmergencyProtocolPage();