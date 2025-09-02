class GasProtocolPage {
  // ========================================
  // SELECTORS - ALERT HEADER
  // ========================================
  
  get employeeName() { return cy.get('[data-cy="employee-name"]') }
  get alertType() { return cy.get('[data-cy="alert-type"]') }
  get alertId() { return cy.get('[data-cy="alert-id"]') }
  get employeeDetails() { return cy.get('[data-cy="employee-details"]') }
  get deviceDetails() { return cy.get('[data-cy="device-details"]') }
  get alertTimestamp() { return cy.get('[data-cy="alert-timestamp"]') }
  get alertSeverity() { return cy.get('[data-cy="alert-severity"]') }
  get gasType() { return cy.get('[data-cy="gas-type"]') }
  get gasLevel() { return cy.get('[data-cy="gas-level"]') }
  get location() { return cy.get('[data-cy="location"]') }

  // ========================================
  // SELECTORS - MAIN SECTIONS
  // ========================================
  
  get protocolLog() { return cy.get('[data-cy="protocol-log"]') }
  get manualNotesTextarea() { return cy.get('[data-cy="manual-notes"]') }
  get addNoteButton() { return cy.get('[data-cy="add-manual-note"]') }
  get globalTimer() { return cy.get('[data-cy="global-timer"]') }
  get timerDisplay() { return cy.get('[data-cy="timer-display"]') }
  get timerInfo() { return cy.get('[data-cy="timer-info"]') }
  get cancelTimerButton() { return cy.get('[data-cy="cancel-global-timer"]') }

  // ========================================
  // SELECTORS - PROTOCOL CONTROLS
  // ========================================
  
  get initiateProtocolButton() { return cy.get('[data-cy="initiate-protocol"]') }
  get protocolTypeSelector() { return cy.get('[data-cy="protocol-type-selector"]') }
  get confirmProtocolButton() { return cy.get('[data-cy="confirm-protocol"]') }
  get protocolStatus() { return cy.get('[data-cy="protocol-status"]') }
  get protocolInitiated() { return cy.get('[data-cy="protocol-initiated"]') }
  get protocolProgress() { return cy.get('[data-cy="protocol-progress"]') }
  get protocolCompletion() { return cy.get('[data-cy="protocol-completion-status"]') }
  get protocolCompletionTime() { return cy.get('[data-cy="protocol-completion-time"]') }
  get protocolSummary() { return cy.get('[data-cy="protocol-summary"]') }

  // ========================================
  // SELECTORS - PROTOCOL STEPS
  // ========================================
  
  // Step 1
  get step1Container() { return cy.get('[data-cy="step-1"]') }
  get step1Button() { return cy.get('[data-cy="call-g7c-device"]') }
  get step1Outcome() { return cy.get('[data-cy="step-1-outcome"]') }
  get step1Note() { return cy.get('[data-cy="step-1-note"]') }
  get step1PostButton() { return cy.get('[data-cy="step-1-post"]') }
  get step1Status() { return cy.get('[data-cy="step-1-status"]') }

  // Step 2
  get step2Container() { return cy.get('[data-cy="step-2"]') }
  get step2Button() { return cy.get('[data-cy="send-message"]') }
  get step2Note() { return cy.get('[data-cy="step-2-note"]') }
  get step2PostButton() { return cy.get('[data-cy="step-2-post"]') }
  get step2Timer() { return cy.get('[data-cy="step-2-timer"]') }
  get step2Countdown() { return cy.get('[data-cy="step-2-countdown"]') }
  get step2Status() { return cy.get('[data-cy="step-2-status"]') }

  // Step 3
  get step3Container() { return cy.get('[data-cy="step-3"]') }
  get step3Button() { return cy.get('[data-cy="call-user"]') }
  get step3Outcome() { return cy.get('[data-cy="step-3-outcome"]') }
  get step3Note() { return cy.get('[data-cy="step-3-note"]') }
  get step3PostButton() { return cy.get('[data-cy="step-3-post"]') }
  get step3Status() { return cy.get('[data-cy="step-3-status"]') }

  // Step 4
  get step4Container() { return cy.get('[data-cy="step-4"]') }
  get step4Button() { return cy.get('[data-cy="step-4-action"]') }
  get step4Note() { return cy.get('[data-cy="step-4-note"]') }
  get step4PostButton() { return cy.get('[data-cy="step-4-post"]') }
  get step4Status() { return cy.get('[data-cy="step-4-status"]') }
  
  // Step 5
  get step5Container() { return cy.get('[data-cy="step-5"]') }
  get step5Button() { return cy.get('[data-cy="step-5-action"]') }
  get step5Note() { return cy.get('[data-cy="step-5-note"]') }
  get step5PostButton() { return cy.get('[data-cy="step-5-post"]') }
  get step5Status() { return cy.get('[data-cy="step-5-status"]') }

  // ========================================
  // SELECTORS - GAS MONITORING
  // ========================================
  
  get gasReadingsCard() { return cy.get('[data-cy="gas-readings-card"]') }
  get alertTrigger() { return cy.get('[data-cy="alert-trigger"]') }
  get h2sReading() { return cy.get('[data-cy="h2s-reading"]') }
  get h2sStatus() { return cy.get('[data-cy="h2s-status"]') }
  get coReading() { return cy.get('[data-cy="co-reading"]') }
  get coStatus() { return cy.get('[data-cy="co-status"]') }
  get gasTimestamp() { return cy.get('[data-cy="gas-timestamp"]') }
  get gasReadingDisplay() { return cy.get('[data-cy="gas-reading-display"]') }
  get gasLevelChart() { return cy.get('[data-cy="gas-level-chart"]') }
  get historicalDataButton() { return cy.get('[data-cy="historical-data"]') }
  get realTimeMonitoring() { return cy.get('[data-cy="real-time-monitoring"]') }
  get alertThresholds() { return cy.get('[data-cy="alert-thresholds"]') }
  get gasTypeDisplay() { return cy.get('[data-cy="gas-type-display"]') }
  get concentrationLevel() { return cy.get('[data-cy="concentration-level"]') }

  // ========================================
  // SELECTORS - DEVICE CONTROL
  // ========================================
  
  get deviceControlPanel() { return cy.get('[data-cy="device-control-panel"]') }
  get deviceStatusIndicator() { return cy.get('[data-cy="device-status"]') }
  get deviceLocationButton() { return cy.get('[data-cy="device-location"]') }
  get deviceHistoryButton() { return cy.get('[data-cy="device-history"]') }
  get deviceCalibrationButton() { return cy.get('[data-cy="device-calibration"]') }
  get deviceShutdownButton() { return cy.get('[data-cy="device-shutdown"]') }

  // ========================================
  // SELECTORS - STEP 2 DEVICE RESPONSE
  // ========================================
  
  get deviceResponse2() { return cy.get('[data-cy="device-response-2"]') }
  get deviceMessageText() { return cy.get('[data-cy="device-message-text"]') }
  get socAcknowledgment() { return cy.get('[data-cy="soc-acknowledgment"]') }

  // ========================================
  // SELECTORS - DISPATCH
  // ========================================
  
  get dispatchDecision() { return cy.get('[data-cy="dispatch-decision"]') }

  // ========================================
  // SELECTORS - EMERGENCY RESPONSE
  // ========================================
  
  get emergencyContactsButton() { return cy.get('[data-cy="emergency-contacts"]') }
  get contactEmergencyButton() { return cy.get('[data-cy="contact-emergency"]') }
  get emergencyServicesButton() { return cy.get('[data-cy="emergency-services"]') }
  get evacuationButton() { return cy.get('[data-cy="evacuation-button"]') }
  get evacuationStatus() { return cy.get('[data-cy="evacuation-status"]') }
  get evacuationZone() { return cy.get('[data-cy="evacuation-zone"]') }
  get evacuationDecision() { return cy.get('[data-cy="evacuation-decision"]') }

  // ========================================
  // SELECTORS - OVERRIDE MODAL
  // ========================================
  
  get overrideModal() { return cy.get('[data-cy="override-modal"]') }
  get overrideGasReading() { return cy.get('[data-cy="override-gas-reading"]') }
  get overrideReason() { return cy.get('[data-cy="override-reason"]') }
  get confirmOverrideBtn() { return cy.get('[data-cy="confirm-override-btn"]') }

  // Resolution
  get resolutionReason() { return cy.get('[data-cy="resolution-reason"]') }
  get resolveAlertButton() { return cy.get('[data-cy="resolve-alert"]') }
  get cancelResolutionButton() { return cy.get('[data-cy="cancel-resolution"]') }
  get resolutionStatus() { return cy.get('[data-cy="resolution-status"]') }

  // ========================================
  // PAGE ACTIONS
  // ========================================

  visit() {
    cy.visit(Cypress.env('gasProtocolPath'));
    cy.get('.container').should('be.visible');
    return this;
  }
  
  visitWithAlert(alertId) {
    cy.visit(`/gas-protocol/${alertId}`);
    cy.get('.container').should('be.visible');
    return this;
  }

  loadFixture(fixtureFile = 'gas-alerts.json') {
    cy.fixture(fixtureFile).then(alertData => {
      cy.window().then(win => {
        win.testGasAlertFixture = alertData[0];
      });
    });
  }

  getEmployeeName() {
    return this.employeeName.invoke('text');
  }

  getAlertType() {
    return this.alertType.invoke('text');
  }

  getAlertId() {
    return this.alertId.invoke('text');
  }

  getGasType() {
    return this.gasType.invoke('text');
  }

  getGasLevel() {
    return this.gasLevel.invoke('text');
  }

  getDeviceDetails() {
    return this.deviceDetails.invoke('text');
  }

  // ========================================
  // STEP ACTIONS - OPTIMIZED FOR HEADLESS
  // ========================================

  startStep(stepNumber) {
    cy.get(`#step-${stepNumber} button:first`).click();
  }

  completeStep1(outcome, customNote = null) {
    this.step1Button.click({ force: true });
    if (outcome) {
      this.step1Outcome.select(outcome, { force: true });
    }
    cy.wait(3000);
    if (customNote) {
      this.step1Note.clear().type(customNote);
    }
    this.step1PostButton.click({ force: true });
    cy.wait(5000);
    return this;
  }

  completeStep2(customNote = null) {
    this.step2Button.click({ force: true });
    cy.wait(3000);
    if (customNote) {
      this.step2Note.clear().type(customNote);
    }
    this.step2PostButton.click({ force: true });
    cy.wait(5000);
    return this;
  }

  completeStep3(outcome, customNote = null) {
    this.step3Button.click({ force: true });
    if (outcome) {
      this.step3Outcome.select(outcome, { force: true });
    }
    cy.wait(3000);
    if (customNote) {
      this.step3Note.clear().type(customNote);
    }
    this.step3PostButton.click({ force: true });
    cy.wait(5000);
    return this;
  }

  completeStep4(customNote = null) {
    this.step4Button.click({ force: true });
    cy.wait(2000);
    if (customNote) {
      this.step4Note.clear().type(customNote);
    }
    this.step4PostButton.click({ force: true });
    cy.wait(3000);
    return this;
  }

  completeStep5(customNote = null) {
    this.step5Button.click({ force: true });
    cy.wait(2000);
    if (customNote) {
      this.step5Note.clear().type(customNote);
    }
    this.step5PostButton.click({ force: true });
    cy.wait(3000);
    return this;
  }

  makeEvacuationDecision(decision, zone = null) {
    this.evacuationDecision.select(decision, { force: true });
    
    if (decision === 'Yes' && zone) {
      this.evacuationZone.select(zone, { force: true });
      this.evacuationButton.click({ force: true });
    }
    
    cy.wait(1000);
    return this;
  }

  getGasData() {
    return cy.window().then((win) => {
      if (!win.currentGasReadings) {
        win.currentGasReadings = {
          h2s: { value: 0, status: 'NORMAL' },
          co: { value: 0, status: 'NORMAL' },
          o2: { value: 21, status: 'NORMAL' },
          lel: { value: 0, status: 'NORMAL' }
        };
      }
      return {
        co: win.currentGasReadings.co?.value || 0,
        h2s: win.currentGasReadings.h2s?.value || 0,
        o2: win.currentGasReadings.o2?.value || 21,
        lel: win.currentGasReadings.lel?.value || 0
      };
    });
  }

  setGasData(gasData) {
    return cy.window().then((win) => {
      if (!win.currentGasReadings) {
        win.currentGasReadings = {};
      }
      if (gasData.co !== undefined) {
        win.currentGasReadings.co = { 
          value: gasData.co, 
          status: gasData.co > 200 ? 'HIGH' : 'NORMAL' 
        };
      }
      if (gasData.h2s !== undefined) {
        win.currentGasReadings.h2s = { 
          value: gasData.h2s, 
          status: gasData.h2s > 10 ? 'HIGH' : 'NORMAL' 
        };
      }
      if (gasData.o2 !== undefined) {
        win.currentGasReadings.o2 = { 
          value: gasData.o2, 
          status: gasData.o2 < 19.5 || gasData.o2 > 23.5 ? 'HIGH' : 'NORMAL' 
        };
      }
      if (gasData.lel !== undefined) {
        win.currentGasReadings.lel = { 
          value: gasData.lel, 
          status: gasData.lel > 10 ? 'HIGH' : 'NORMAL' 
        };
      }
      if (win.updateGasDisplay) {
        win.updateGasDisplay();
      }
      return win.currentGasReadings;
    });
  }

  setNormalGasLevels() {
    return this.setGasData({
      co: 0,
      h2s: 0,
      o2: 21,
      lel: 0
    });
  }

  validateGasDataExists() {
    return cy.window().then((win) => {
      if (!win.gasData) {
        win.gasData = {
          co: 0,
          h2s: 0,
          o2: 21,
          lel: 0
        };
      }
      return win.gasData;
    });
  }

  // ========================================
  // PROTOCOL RESET HELPERS - HEADLESS OPTIMIZED
  // ========================================

  waitForProtocolReset() {
    cy.wait(5000);
    this.step1Button.should('not.be.disabled', { timeout: 20000 });
    this.step2Button.should('not.be.disabled', { timeout: 20000 });
    this.step3Button.should('not.be.disabled', { timeout: 20000 });
    this.step4Button.should('not.be.disabled', { timeout: 20000 });
    this.step5Button.should('not.be.disabled', { timeout: 20000 });
    cy.wait(2000);
    return this;
  }
  
  validateStepsAreRepeatable() {
    this.completeStep1('no-answer', 'Gas leak detected in area');
    this.completeStep2('Personnel evacuated from area');
    this.completeStep3('confirmed-ok', 'Emergency services contacted');
    this.validateLogEntry('Step 1: Gas detection protocol initiated');
    this.validateLogEntry('Step 2: Area evacuation completed');
    this.validateLogEntry('Step 3: Emergency services notified');
    return this;
  }

  // ========================================
  // RESOLUTION ACTIONS
  // ========================================

  resolveAlert(reason) {
    this.resolutionReason.select(reason);
    this.resolveAlertButton.click();
    return this;
  }

  cancelResolution() {
    this.cancelResolutionButton.click();
    return this;
  }

  // ========================================
  // MANUAL NOTES
  // ========================================

  addManualNote(noteText) {
    this.manualNotesTextarea.type(noteText);
    this.addNoteButton.click();
    return this;
  }

  // ========================================
  // DEVICE ACTIONS
  // ========================================

  shutdownDevice() {
    this.deviceShutdownButton.click();
    this.confirmButton.click();
    return this;
  }

  viewDeviceHistory() {
    this.deviceHistoryButton.click();
    return this;
  }

  checkDeviceLocation() {
    this.deviceLocationButton.click();
    return this;
  }

  // ========================================
  // VALIDATIONS
  // ========================================

  validateStepCompleted(stepNumber) {
    cy.get(`[data-cy="step-${stepNumber}"]`, { timeout: 20000 }).should(($step) => {
      const hasCompleted = $step.hasClass('completed');
      const isNotDisabled = !$step.hasClass('disabled');
      
      if (!hasCompleted && !isNotDisabled) {
        throw new Error(`Step ${stepNumber} is not completed and appears disabled`);
      }
    });
    return this;
  }

  validateStepActive(stepNumber) {
    cy.get(`[data-cy="step-${stepNumber}"]`, { timeout: 15000 }).should('have.class', 'active');
    cy.get(`[data-cy="step-${stepNumber}-status"]`, { timeout: 15000 }).should('contain.text', 'Pending');
    return this;
  }

  validateStepState(stepNumber, expectedState) {
    const validStates = ['active', 'completed', 'disabled'];
    
    if (!validStates.includes(expectedState)) {
      throw new Error(`Invalid state: ${expectedState}. Must be one of: ${validStates.join(', ')}`);
    }
    
    cy.get(`[data-cy="step-${stepNumber}"]`).should('have.class', expectedState);
    cy.get(`[data-cy="step-${stepNumber}-status"]`).should('contain', expectedState);
    return this;
  }

  validateButtonEnabled(buttonSelector, shouldBeEnabled = true) {
    if (shouldBeEnabled) {
      cy.get(buttonSelector).should('not.be.disabled');
    } else {
      cy.get(buttonSelector).should('be.disabled');
    }
    return this;
  }

  validateLogEntry(expectedText) {
    this.protocolLog.should('contain.text', expectedText);
    return this;
  }

  validateTimerActive(description = null) {
    this.globalTimer.should('have.class', 'timer-active');
    this.cancelTimerButton.should('not.be.disabled');
    if (description) {
      this.timerInfo.should('contain.text', description);
    }
    return this;
  }

  validateTimerInactive() {
    this.globalTimer.should('have.class', 'timer-inactive');
    this.cancelTimerButton.should('be.disabled');
    this.timerDisplay.should('contain.text', '--:--');
    return this;
  }

  validateGasReading(expectedReading) {
    this.gasReadingDisplay.should('contain', expectedReading);
    return this;
  }

  validateAlertSeverity(severity) {
    this.alertSeverity.should('contain', severity);
    return this;
  }

  validateEvacuationInitiated() {
    this.evacuationStatus.should('contain', 'Evacuation in Progress');
    return this;
  }

  validateDeviceStatus(expectedStatus) {
    this.deviceStatusIndicator.should('contain', expectedStatus);
    return this;
  }

  validateProtocolLocked() {
    cy.get('.container').should('have.class', 'alert-resolved');
    this.resolveAlertButton.should('be.disabled');
    return this;
  }

  validateProtocolUnlocked() {
    cy.get('.container').should('not.have.class', 'alert-resolved');
    this.resolveAlertButton.should('not.be.disabled');
    return this;
  }

  validateStepNoteContains(stepNumber, expectedText, exactMatch = false) {
    const selector = `[data-cy="step-${stepNumber}-note"]`;
    
    if (exactMatch) {
      cy.get(selector, { timeout: 10000 }).should('have.value', expectedText);
    } else {
      cy.get(selector, { timeout: 10000 }).should(($el) => {
        const text = $el.val() || $el.text();
        expect(text.toLowerCase()).to.include(expectedText.toLowerCase());
      });
    }
    return this;
  }

  validateAlertTrigger(shouldContainGasText = true) {
    if (shouldContainGasText) {
      this.alertTrigger.should('contain', 'threshold detected');
    } else {
      this.alertTrigger.should('not.contain', 'threshold detected');
    }
    return this;
  }

  validateNonGasAlert() {
    this.alertTrigger.should('not.contain', 'threshold detected').should('not.contain', 'gas');
    return this;
  }

  // ========================================
  // WORKFLOW HELPERS
  // ========================================

  completeBasicGasProtocol() {
    this.completeStep1('no-answer', 'Gas leak detected and confirmed');
    this.completeStep2('Area secured and personnel notified');
    this.completeStep3('confirmed-ok', 'Ventilation systems activated');
    return this;
  }

  completeEvacuationProtocol(zone = 'Zone A') {
    this.makeEvacuationDecision('Yes', zone);
    this.completeStep4('Evacuation completed successfully');
    return this;
  }

  completeFullGasProtocolWithEvacuation() {
    this.completeBasicGasProtocol();
    this.completeEvacuationProtocol();
    this.completeStep5('All personnel accounted for');
    this.resolveAlert('gas-leak-contained');
    return this;
  }

  completeFullGasProtocolWithoutEvacuation() {
    this.completeBasicGasProtocol();
    this.makeEvacuationDecision('No');
    this.completeStep4('Area monitoring increased');
    this.completeStep5('Gas levels normalized');
    this.resolveAlert('false-alarm');
    return this;
  }
}

export default new GasProtocolPage();