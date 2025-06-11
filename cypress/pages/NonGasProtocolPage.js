class NonGasProtocolPage {
  visit() {
    return cy.visit(Cypress.env('protocolPath'));
  }

  // Step 1
  getStep1Button() { return cy.get('[data-cy="step-1-action"]'); }
  getStep1Note() { return cy.get('[data-cy="step-1-note"]'); }
  getStep1Post() { return cy.get('[data-cy="step-1-post"]'); }

  // Step 2
  getStep2Button() { return cy.get('[data-cy="step-2-action"]'); }
  getStep2Note() { return cy.get('[data-cy="step-2-note"]'); }
  getStep2Post() { return cy.get('[data-cy="step-2-post"]'); }
  getStep2TimerBox() { return cy.get('[data-cy="step-2-timer-box"]'); }
  getStep2Countdown() { return cy.get('[data-cy="step-2-countdown"]'); }
  getStep2TimerCancel() { return cy.get('[data-cy="step-2-timer-box"] button'); }

  // Step 3
  getStep3Button() { return cy.get('[data-cy="step-3-action"]'); }
  getStep3Note() { return cy.get('[data-cy="step-3-note"]'); }
  getStep3Post() { return cy.get('[data-cy="step-3-post"]'); }
  getStep3Container() { return cy.get('[data-cy="step-3"]'); }

  // Step 4
  getStep4_2Button() { return cy.get('[data-cy="step-4-2"] .step-button'); }
  getStep4_2Note() { return cy.get('[data-cy="step-4-2-note"]'); }
  getStep4_2Post() { return cy.get('#step-4-2 .post-note-button'); }
  getStep4TimerBox() { return cy.get('[data-cy="step-4-timer-box"]'); }
  getStep4Countdown() { return cy.get('[data-cy="step-4-countdown"]'); }
  getStep4TimerCancel() { return cy.get('#step-4-timer-container button'); }
  selectStep4_1Outcome(value) { return cy.get('[data-cy="outcome-4-1"]').select(value); }
  selectStep4_2Outcome(value) { return cy.get('[data-cy="outcome-4-2"]').select(value); }

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

  // Common
  getLogList() { return cy.get('[data-cy="log-list"]'); }

  // Reusable helpers
  verifyLogContains(text) {
    this.getLogList().should("contain.text", text);
  }

  completeStep(stepNum, expectedNote) {
    cy.get(`[data-cy="step-${stepNum}-action"]`).click();
    cy.wait(100); // Ensure note prefill completes
    cy.get(`[data-cy="step-${stepNum}-note"]`).should("have.value", expectedNote);
    cy.get(`[data-cy="step-${stepNum}-post"]`).click();
    cy.get(`[data-cy="step-${stepNum}"]`).should("have.class", "completed-step");
    this.verifyLogContains(`Step ${stepNum}: ${expectedNote}`);
  }

  verifyStep2TimerCompletedLog() {
    this.getLogList().should('contain.text', 'Step 2: 2-minute wait completed');
    this.getLogList().invoke('text').then(console.log);
  }

  verifyStep2TimerFlow() {
    this.getStep2TimerBox().should('be.visible');
    this.getStep2Countdown().should('contain.text', '00:10');

    cy.tick(10000);
    cy.wait(100);

    this.getLogList()
      .contains('Step 2: 2-minute wait completed. Proceed to Step 3.')
      .should('be.visible');

    this.getStep2TimerBox().should('not.be.visible');
  }

  verifyStep4_2InitialTimerLog() {
    this.verifyLogContains(
      'Step 4: Spoke with EC, provided the Emergency Contact the relevant alert information. They will contact user and call back. Waiting 30 minutes for response. | Op 417'
    );
  }
}

export default NonGasProtocolPage;
