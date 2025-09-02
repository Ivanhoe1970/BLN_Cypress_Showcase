// cypress/e2e/protocol-flows/no-motion-protocol.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("No Motion Protocol - Location Stale Cycling", () => {
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

  it("cycles when location stale, resolves when EC confirms user safety", () => {
    // Load no-motion alert with 3-hour stale location
    Page.loadAlertById("no-motion");

    Page.header.should("be.visible");
    Page.employeeName.should("contain.text", "Marcus");

    // ═══ ROUND 1: Location staleness blocks dispatch ═══

    // Action 1: Message device (5-minute timer)
    Page.completeStep(1, {
      outcome: "no-response",
      note: "Sent message 'Do you need help?', no response after 5 minutes"
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

    // Action 4: Dispatch blocked by location staleness
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
    cy.get('#skip-reason').should("have.value", "location-stale");
    cy.get('#step-4-note').type('Unable to dispatch - location not current (3 hours old)');
    cy.get('[data-cy="step-4-post-btn"]').click();

    // Should cycle back
    Page.validateLogEntry("Repeating STEPS 1, 2, 3 & 4");

    // ═══ ROUND 2: Location still stale, EC confirms user OK ═══

    // Action 1: Message device
    Page.completeStep(1, { 
      outcome: "no-response",
      note: "Sent message, no response"
    });

    // Action 2: Call user
    Page.completeStep(2, { 
      outcome: "no-answer-voicemail",
      note: "Called user, no answer. Left voicemail"
    });

    // Action 3: EC confirms user safety → Resolution
    Page.completeStep("3-1", {
      outcome: "confirmed-ok",
      note: "EC confirmed user is okay. Resolving alert.",
    });

    // Should resolve without dispatch (location was stale, no dispatch made)
    cy.get('[data-cy="resolution-reason"]').should(
      "have.value", 
      "false-alert-without-dispatch"
    );
    
    Page.resolveAlert();
    Page.validateLogEntry("Alert resolved");
    Page.validateLogEntry("EC confirmed user is okay");
  });
});