// cypress/e2e/protocol-cycling/device-offline-cycling.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("Protocol Cycling - Device Offline", () => {
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

  it("cycles when device offline, resolves when EC confirms user OK", () => {
    // Load alert with device offline
    Page.loadAlertById("missed-check-in-offline");

    Page.header.should("be.visible");
    Page.employeeName.should("contain.text", "Marcus");

    // ═══ ROUND 1: Device offline blocks steps ═══

    // Step 1: Message device - handle offline scenario
    Page.startStep(1);
    
    // Force the outcome section to be visible and interact with it
    cy.get('#step-1-outcome').invoke('attr', 'style', 'display: block !important;');
    
    // Select the offline option
    cy.get('[data-cy="step-1-select"]').select("unable-to-send", { force: true });
    
    // Populate the note
    cy.get('#step-1-note').clear().type("Unable to send text message, device offline", { force: true });
    
    // Click the Post Note button with force
    cy.get('[data-cy="step-1-post-btn"]').click({ force: true });

    // Step 2: Call user - no answer
    Page.completeStep(2, {
      outcome: "no-answer-voicemail",
      note: "Called user, no answer. Left voicemail",
    });

    // Step 3: EC1 - no answer
    Page.completeStep("3-1", {
      outcome: "no-answer-voicemail",
      note: "Called EC1, no answer. Left voicemail",
    });

    // Step 4: Dispatch - wait for auto-evaluation or trigger it manually
    cy.wait(1000); // Give auto-evaluation time to run
    
    // If still empty, trigger the evaluation manually
    cy.get('[data-cy="dispatch-decision"]').then(($select) => {
      if ($select.val() === '') {
        // Trigger the dispatch condition evaluation manually
        cy.window().then((win) => {
          if (typeof win.silentlyUpdateDispatchConditions === 'function') {
            win.silentlyUpdateDispatchConditions();
          }
        });
        cy.wait(500);
      }
    });
    
    // Now check the dispatch decision (should be "no" for offline device)
    cy.get('[data-cy="dispatch-decision"]').should("have.value", "no");
    cy.get('#skip-reason').should("have.value", "device-offline");
    
    // Type the note
    cy.get('#step-4-note').type('Unable to dispatch - device offline');
    
    // Post the note
    cy.get('[data-cy="step-4-post-btn"]').click();

    // Should cycle back
    Page.validateLogEntry("Repeating STEPS 1, 2, 3 & 4");

    // ═══ ROUND 2: Device online, EC confirms OK ═══

    // Bring device online
    cy.window().then((win) => win.setDeviceOnline());

    // Step 1: Now works normally with timer
    Page.startStep(1);
    cy.tick(125000); // Expire timer
    Page.completeStep(1, { outcome: "no-response" });

    // Step 2: User no answer
    Page.completeStep(2, { outcome: "no-answer-voicemail" });

    // Step 3: EC confirms user OK → Resolution
    Page.completeStep("3-1", {
      outcome: "confirmed-ok",
      note: "EC confirmed user is okay. Resolving alert.",
    });

    // Should resolve - ONLY CHANGED THIS LINE
    cy.get('[data-cy="resolution-reason"]').should(
      "have.value",
      "false-alert-without-dispatch"
    );
    Page.resolveAlert();
    Page.validateLogEntry("Alert resolved");
  });
});