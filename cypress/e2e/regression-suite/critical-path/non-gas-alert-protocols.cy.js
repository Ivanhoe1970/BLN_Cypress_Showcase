// cypress/e2e/regression-suite/critical-path/non-gas-alert-protocols.cy.js
import Page from "../../../pages/EmergencyProtocolPage";

describe('Non-Gas Alert Protocols - Critical Workflows', () => {
  beforeEach(() => {
    Page.visit();
    
    cy.window({ timeout: 20000 }).should((win) => {
      const ready =
        typeof win.loadAlert === "function" ||
        typeof win.loadAlertFromJSON === "function" ||
        (win.AlertDataManager && win.AlertDataManager.alertTypesData);
      expect(ready, "app bootstrap (loader or data present)").to.be.true;
    });
  });

  afterEach(() => {
    Page.clearAlert();
  });

  it('@critical should handle SOS with immediate dispatch preparation', () => {
    Page.loadAlertById('sos-immediate');

    Page.header.should("be.visible");
    Page.alertType.should('contain.text', 'SOS alert');
    Page.employeeName.should("contain.text", "Zach");
    
    // Verify basic protocol loads
    Page.validateStepStatus('step-1', 'Active');
  });

  it('@critical should execute fall detection protocol cycle', () => {
    Page.loadAlertById('fall-detection');
  
    Page.header.should("be.visible");
    Page.alertType.should('contain.text', 'Fall detection');
    Page.employeeName.should("contain.text", "Marcus");
  
    // STEP 1: Combined device/user call - handle both sub-steps separately
    Page.startStep(1);
    
    // Sub-step 1-1: Call device
    cy.get('[data-cy="step-1-1-button"]').click();
    cy.get('[data-cy="step-1-1-select"]').select("no-answer", { force: true });
    cy.get('[data-cy="step-1-1-post-btn"]').click();
    
    // Verify first log entry
    Page.validateLogEntry(/Step 1\.1.*No answer/i);
    
    // Sub-step 1-2: Call user  
    cy.get('[data-cy="step-1-2-button"]').click();
    cy.get('[data-cy="step-1-2-select"]').select("no-answer-voicemail", { force: true });
    cy.get('[data-cy="step-1-2-post-btn"]').click();
    
    // Verify second log entry
    Page.validateLogEntry(/Step 1\.2.*Marcus Rodriguez.*voicemail/i);
  
    // STEP 2: Message step - just like the reference test
    Page.startStep(2);
    Page.validateTimerActive();
  
    // Simulate device reply → cancel timer via best available hook
    cy.window().then((win) => {
      if (typeof win.testResponse === "function") {
        win.testResponse("I'm OK");
      } else if (typeof win.simulateDeviceResponse === "function") {
        win.simulateDeviceResponse("I'm OK", true);
      } else if (typeof Page.cancelAnyTimer === "function") {
        Page.cancelAnyTimer();
      }
    });
    
    Page.validateTimerInactive();
  
    // Log verification - check for device response
    Page.validateLogEntry(/I'm OK/i);
  });

  it('@critical should handle no motion standard protocol', () => {
    Page.loadAlertById('no-motion');

    Page.header.should("be.visible");
    Page.alertType.should('contain.text', 'No motion detected');
    Page.employeeName.should("contain.text", "Marcus");

    // Test step functionality
    Page.startStep(1);
    Page.validateTimerActive();

    cy.window().then((win) => {
      if (typeof win.testResponse === "function") {
        win.testResponse("I'm OK");
      } else if (typeof win.simulateDeviceResponse === "function") {
        win.simulateDeviceResponse("I'm OK", true);
      }
    });

    Page.validateTimerInactive();
  });

  it('@critical should handle missed check-in with online device', () => {
    Page.loadAlertById('missed-check-in');

    Page.header.should("be.visible");
    Page.alertType.should('contain.text', 'Missed check-in');
    Page.employeeName.should("contain.text", "Zach");
    
    Page.deviceStatus.should('contain.text', 'Online');
    Page.validateStepStatus('step-1', 'Active');
  });

  it('@critical should handle missed check-in with offline device', () => {
    Page.loadAlertById('missed-check-in-offline');

    Page.header.should("be.visible");
    Page.alertType.should('contain.text', 'Missed check-in');
    Page.employeeName.should("contain.text", "Marcus");
    
    Page.deviceStatus.should('contain.text', 'Offline');
  });
});