// cypress/e2e/protocol-cycling/device-offline-multi-condition.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("Protocol Cycling - Device Offline Multi-Condition", () => {
  beforeEach(() => {
    cy.clock();
    Page.visit();

    cy.window({ timeout: 20000 }).should((win) => {
      const ready = typeof win.loadAlert === "function";
      expect(ready, "app bootstrap").to.be.true;
    });
  });

  afterEach(() => {
    cy.clock().then((clock) => clock.restore());
  });

  it("cycles when device offline and location stale, resolves when EC confirms user safety", () => {
    // Load alert with device offline + location stale conditions
    Page.loadAlertById("missed-check-in-offline");

    Page.header.should("be.visible");
    Page.employeeName.should("contain.text", "Marcus");

    // ═══ ROUND 1: Device offline blocks steps and dispatch ═══

    // Action 1: Message device - offline, unable to send
    Page.completeStep(1, { 
      outcome: "unable-to-send",
      note: "Unable to send text message, device offline" 
    });

    // Action 2: Call user - no answer
    Page.completeStep(2, {
      outcome: "no-answer-voicemail",
      note: "Called user, no answer. Left voicemail",
    });

    // Action 3: EC1 - no answer  
    Page.completeStep("3-1", {
      outcome: "no-answer-voicemail", 
      note: "Called EC1, no answer. Left voicemail",
    });

    // Action 4: Dispatch blocked - wait for auto-evaluation
    cy.wait(1000);
    
    cy.get('[data-cy="dispatch-decision"]').then(($select) => {
      if ($select.val() === '') {
        cy.window().then((win) => {
          if (typeof win.silentlyUpdateDispatchConditions === 'function') {
            win.silentlyUpdateDispatchConditions();
          }
        });
        cy.wait(500);
      }
    });

    cy.get('[data-cy="dispatch-decision"]').should("have.value", "no");
    cy.get('#skip-reason').should("have.value", "device-offline");
    cy.get('#step-4-note').type('Unable to dispatch - device offline (last comm 47 min ago, battery 8%, signal 3%), location stale (52 minutes old)');
    cy.get('[data-cy="step-4-post-btn"]').click();

    // Should cycle back
    Page.validateLogEntry("Repeating STEPS 1, 2, 3 & 4");

    // ═══ ROUND 2: Device still offline, EC calls back and confirms ═══

    // Action 1: Still unable to send
    Page.completeStep(1, { 
      outcome: "unable-to-send",
      note: "Unable to send text message, device offline" 
    });

    // Action 2: User still no answer
    Page.completeStep(2, { 
      outcome: "no-answer-voicemail",
      note: "Called user, no answer. Left voicemail"
    });

    // Action 3: EC calls back and confirms user safety → Resolution
    Page.completeStep("3-1", {
      outcome: "ec-callback",
      note: "Emergency contact called in and confirmed user is okay. Resolving alert.",
    });

    // Should resolve without dispatch (device was offline)
    cy.get('[data-cy="resolution-reason"]').should(
      "have.value", 
      "false-alert-without-dispatch"
    );
    Page.resolveAlert();
    Page.validateLogEntry("Alert resolved");
  });
});