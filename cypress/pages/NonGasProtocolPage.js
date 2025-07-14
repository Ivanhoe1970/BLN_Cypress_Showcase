class NonGasProtocolPage {
  visit() {
    cy.visit(Cypress.env('protocolPath'));
    // Wait for the page to fully load and elements to be available
    cy.get('#steps-container').should('be.visible');
    cy.get('[data-cy="step-1-action"]').should('be.visible');
    return this;
  }

  // Step 1
  getStep1Button() { return cy.get('[data-cy="step-1-action"]'); }
  getStep1Dropdown() { return cy.get('[data-cy="outcome-1"]'); }
  getStep1Note() { return cy.get('[data-cy="step-1-note"]'); }
  getStep1Post() { return cy.get('[data-cy="step-1-post"]'); }
  selectStep1Outcome(value) { return cy.get('[data-cy="outcome-1"]').select(value); }

  // Step 2
  getStep2Button() { return cy.get('[data-cy="step-2-action"]'); }
  getStep2Note() { return cy.get('[data-cy="step-2-note"]'); }
  getStep2Post() { return cy.get('[data-cy="step-2-post"]'); }
  getStep2TimerBox() { return cy.get('[data-cy="step-2-timer-box"]'); }
  getStep2Countdown() { return cy.get('[data-cy="step-2-countdown"]'); }
  getStep2TimerCancel() { return cy.get('[data-cy="step-2-timer-box"] button'); }

  // Step 3
  getStep3Button() { return cy.get('[data-cy="step-3-action"]'); }
  getStep3Dropdown() { return cy.get('[data-cy="outcome-3"]'); }
  getStep3Note() { return cy.get('[data-cy="step-3-note"]'); }
  getStep3Post() { return cy.get('[data-cy="step-3-post"]'); }
  getStep3Container() { return cy.get('[data-cy="step-3"]'); }
  selectStep3Outcome(value) { return cy.get('[data-cy="outcome-3"]').select(value); }

  // Step 4-1
  getStep4_1Button() { return cy.get('[data-cy="step-4-1"] .step-button'); }
  getStep4_1Note() { return cy.get('[data-cy="step-4-1-note"]'); }
  getStep4_1Post() { return cy.get('#step-4-1 .post-note-button'); }
  getStep4_1TimerBox() { return cy.get('[data-cy="step-4-1-timer-box"]'); }
  getStep4_1TimerCancel() { return cy.get('#step-4-1-timer-container button'); }
  selectStep4_1Outcome(value) { return cy.get('[data-cy="outcome-4-1"]').select(value); }

  // Step 4-2
  getStep4_2Button() { return cy.get('[data-cy="step-4-2"] .step-button'); }
  getStep4_2Note() { return cy.get('[data-cy="step-4-2-note"]'); }
  getStep4_2Post() { return cy.get('#step-4-2 .post-note-button'); }
  getStep4_2TimerBox() { return cy.get('[data-cy="step-4-2-timer-box"]'); }
  getStep4_2TimerCancel() { return cy.get('#step-4-2-timer-container button'); }
  selectStep4_2Outcome(value) { return cy.get('[data-cy="outcome-4-2"]').select(value, {force: true}); }
  
  forceClickStep4_2Button() {
    return cy.get('[data-cy="step-4-2"] .step-button').then(($btn) => {
      // Force enable the button
      $btn[0].disabled = false;
      $btn[0].style.pointerEvents = 'auto';
      $btn[0].style.opacity = '1';
    }).click();
  }

  // Step 5
  getStep5Button() { return cy.get('[data-cy="step-5-action"]'); }
  getStep5Note() { return cy.get('[data-cy="step-5-note"]'); }
  getStep5Post() { return cy.get('[data-cy="step-5-post"]'); }
  getStep5TimerBox() { return cy.get('[data-cy="step-5-timer-box"]'); }
  getStep5TimerCancel() { return cy.get('#step-5-timer-container button'); }
  getStep5Countdown() { return cy.get('#step-5-countdown'); }
  getStep5DispatchDecision() { return cy.get('#dispatch-decision'); }
  getDispatchServiceType() { return cy.get('#dispatch-service'); }

  // Resolution
  getResolutionDropdown() { return cy.get('[data-cy="resolution-reason"]'); }
  getResolveAlertButton() { return cy.get('[data-cy="resolve-alert-btn"]'); }
  getCancelResolutionButton() { return cy.get('[data-cy="cancel-resolution-btn"]'); }
  selectResolutionReason(value) { return this.getResolutionDropdown().select(value); }

  // Manual Notes
  getAddManualNoteButton() { return cy.get('[data-cy="add-manual-note-btn"]'); }
  getManualNoteTextarea() { return cy.get('#manual-log-textarea'); }
  getSubmitManualNoteButton() { return cy.get('button').contains('Submit Note'); }
  getCancelManualNoteButton() { return cy.get('button').contains('Cancel'); }

  // Common
  getLogList() { return cy.get('#log-list'); }

  // Enhanced Helpers
  verifyLogContains(text) {
    // Remove extra spaces and be more flexible
    this.getLogList().invoke('text').then((logText) => {
      expect(logText).to.include(text.trim());
    });
  }

  verifyButtonDisabled(stepNum) {
    cy.get(`[data-cy="step-${stepNum}-action"]`).should('be.disabled');
  }

  verifyAlertResolved() {
    cy.get('body').should('have.class', 'alert-resolved');
    cy.get('.step:not(#resolution-section)').should('have.css', 'opacity', '0.5');
  }

  verifyStepsUnlocked() {
    cy.get('body').should('not.have.class', 'alert-resolved');
  }

  // Your existing methods...
  completeStep(stepNum, expectedNote) {
    cy.get(`[data-cy="step-${stepNum}-action"]`).click();
    cy.wait(100);
    cy.get(`[data-cy="step-${stepNum}-note"]`).should("have.value", expectedNote);
    cy.get(`[data-cy="step-${stepNum}-post"]`).click();
    cy.get(`[data-cy="step-${stepNum}"]`).should("have.class", "completed-step");
    this.verifyLogContains(`Step ${stepNum}: ${expectedNote}`);
  }

  verifyStep2TimerFlow() {
    // Validate initial state
    this.getStep2TimerBox().should('be.visible');
    this.getStep2Countdown().should('contain.text', '02:00');
    
    // Test intermediate states
    cy.tick(10000); // 10 seconds elapsed = 1:50 remaining
    this.getStep2Countdown().should('contain.text', '01:50');
    
    cy.tick(50000); // 60 seconds total elapsed = 1:00 remaining  
    this.getStep2Countdown().should('contain.text', '01:00');
    
    // Complete the timer
    cy.tick(60000); // 120 seconds total elapsed = timer done
    
    // Verify completion
    this.verifyLogContains('Step 2: 2-minute wait completed. Proceed to Step 3.');
    
    // ✅ Simulate the auto-hide setTimeout
    cy.tick(1500); // Trigger the 1.5s auto-hide delay
    this.getStep2TimerBox().should('not.be.visible');
  }
}

export default NonGasProtocolPage;