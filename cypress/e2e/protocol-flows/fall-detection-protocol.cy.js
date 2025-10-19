// cypress/e2e/messaging-system/fall-detection-protocol.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("Non-gas protocol — Message Test", () => {
  beforeEach(() => {
    cy.clock(Date.now(), ["Date", "setTimeout", "clearTimeout", "setInterval", "clearInterval"]);
    Page.visit();
    cy.window({ timeout: 20000 }).should((win) => {
      expect(typeof win.loadAlert, "loadAlert available").to.eq("function");
    });
    if (typeof Page.openDemoPanel === "function") Page.openDemoPanel();
  });

  afterEach(() => cy.clock().then((clock) => clock.restore()));

  it("runs message-first flow with timer, then resolves as false-alert", () => {
    // Deterministic non-gas alert
    Page.loadAlertById("message-test");

    // Header sanity
    Page.alertType.should("not.contain.text", "Gas");
    Page.employeeName.should("contain.text", "Marcus");

    // STEP 1: message-first + timer visible/active
    Page.startStep(1);
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

    // STEP 2: call user → confirmed OK (value/text tolerant)
    Page.startStep(2);
    Page.stepSelect(2).then(($sel) => {
      const hasValue = Array.from($sel[0].options || []).some((o) => o.value === "confirmed-ok");
      if (hasValue) Page.stepSelect(2).select("confirmed-ok", { force: true });
      else Page.stepSelect(2).select(/confirmed\s*ok/i, { force: true });
    });
    Page.stepNote(2).clear().type("User confirmed they are fine.", { delay: 0 });
    Page.stepPost(2).click({ force: true });

    // Log sanity
    Page.validateLogEntry("confirmed they are fine");

    // RESOLUTION: non-gas false alert without dispatch
    Page.resolveAlert("false-alert-without-dispatch");

    // Final status is "Completed"
    cy.get('[data-cy="resolution-status"], #resolution-status')
      .should("have.class", "completed")
      .and("contain.text", "Completed");

    Page.validateLogEntry("Resolving alert");
  });

  it("should continue to step 1-2 when unable to call device (option disabled)", () => {
    Page.loadAlertById("fall-detection");
    Page.employeeName.should("contain.text", "Marcus");
  
    // Start Step 1-1: Call device sub-step
    cy.get('[data-cy="step-1-1-button"]').click();
    cy.get('[data-cy="step-1-1-select"]').select('unable-to-call-disabled');
    cy.get('[data-cy="step-1-1-post-btn"]').click();
  
    // Verify correct behavior:
    // 1. Step 1-1 should be completed
    cy.get('[data-cy="step-1-1-status"]').should('contain.text', 'Completed');
    
    // 2. Step 1-2 button should be enabled (not "active" class, but clickable)
    cy.get('[data-cy="step-1-2-button"]').should('not.be.disabled');
    cy.get('[data-cy="step-1-2-button"]').should('be.visible');
    
    // 3. Main step should still be active
    cy.get('[data-cy="step-1-status"]').should('contain.text', 'Active');
    
    // 4. Log should show the action
    Page.validateLogEntry('Unable to call, option unavailable/disabled');
    
    // 5. Step 1-2 should be ready for interaction
    cy.get('[data-cy="step-1-2"]').should('be.visible');
  });
});