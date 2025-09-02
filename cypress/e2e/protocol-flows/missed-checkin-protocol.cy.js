// cypress/e2e/protocol-flows/missed-checkin-protocol.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("Missed Check-In Protocol - Device Moving Cycling", () => {
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

  it("cycles when device moving, resolves when user calls in", () => {
    // Load missed check-in alert with device moving at 95.7 km/h
    Page.loadAlertById("missed-check-in");

    Page.header.should("be.visible");
    Page.employeeName.should("contain.text", "Zach");

    // ═══ ROUND 1: Device moving blocks dispatch ═══

    // Action 1: Message device
    Page.completeStep(1, {
      outcome: "no-response",
      note: "Sent message 'Do you need help?', no response"
    });

    // Action 2: Call user
    Page.completeStep(2, {
      outcome: "no-answer-voicemail",
      note: "Called user, no answer. Left voicemail"
    });

    // Action 3: Call EC1
    Page.completeStep("3-1", {
      outcome: "no-answer-voicemail",
      note: "Called EC1, no answer. Left voicemail"
    });

    // Action 4: Dispatch blocked by device moving
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
    cy.get('#skip-reason').should("have.value", "device-moving");
    cy.get('#step-4-note').type('Unable to dispatch - device not stationary (speed 95.7 km/h)');
    cy.get('[data-cy="step-4-post-btn"]').click();

    // Should cycle back
    Page.validateLogEntry("Repeating STEPS 1, 2, 3 & 4");

    // ═══ ROUND 2: Device still moving, user calls in ═══

    // Action 1: Message device
    Page.completeStep(1, { 
      outcome: "no-response",
      note: "Sent message, no response"
    });

    // Action 2: User calls in and confirms safety → Resolution
    Page.completeStep(2, {
      outcome: "user-callback",
      note: "User called in. Confirmed they are okay. Resolving alert.",
    });

    // Should resolve without dispatch (device was moving, no dispatch made)
    cy.get('[data-cy="resolution-reason"]').should(
      "have.value", 
      "false-alert-without-dispatch"
    );
    
    Page.resolveAlert();
    Page.validateLogEntry("Alert resolved");
    Page.validateLogEntry("User called in. Confirmed they are okay");
  });

  it("cycles through multiple rounds when contacts unavailable", () => {
    Page.loadAlertById("missed-check-in");

    // Round 1: All contacts fail, dispatch blocked
    Page.completeStep(1, { outcome: "no-response" });
    Page.completeStep(2, { outcome: "no-answer-voicemail" });
    Page.completeStep("3-1", { outcome: "no-answer-voicemail" });
    Page.completeStep("3-2", { outcome: "no-answer-voicemail" });

    // Dispatch blocked by device moving
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
    cy.get('#skip-reason').should("have.value", "device-moving");
    cy.get('#step-4-note').type('Unable to dispatch - device not stationary (speed 95.7 km/h)');
    cy.get('[data-cy="step-4-post-btn"]').click();

    Page.validateLogEntry("Repeating STEPS 1, 2, 3 & 4");

    // Round 2: Still no contacts, protocol continues
    Page.completeStep(1, { outcome: "no-response" });
    Page.completeStep(2, { outcome: "no-answer-voicemail" });

    // Round 2: EC2 confirms user safety
    Page.completeStep("3-2", {
      outcome: "confirmed-ok",
      note: "EC2 confirmed user is okay. Resolving alert."
    });

    cy.get('[data-cy="resolution-reason"]').should(
      "have.value", 
      "false-alert-without-dispatch"
    );
    
    Page.resolveAlert();
    Page.validateLogEntry("Alert resolved");
  });
});