// cypress/e2e/regression-suite/critical-path/gas-emergency-flows.cy.js
import Page from "../../../pages/EmergencyProtocolPage";

describe("Gas Emergency Flows - Critical Workflows", () => {
  beforeEach(() => {
    cy.clock();
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
    cy.clock().then((clock) => clock.restore());
    Page.clearAlert();
  });

  it("@critical should handle H2S high threshold with override", () => {
    Page.loadAlertById("gas-high-threshold");

    Page.header.should("be.visible");
    Page.employeeName.should("contain.text", "Zach");
    Page.alertType.should("contain.text", "High threshold detected");
    Page.h2sStatus.should("contain.text", "HIGH");

    Page.completeStep(1, {
      outcome: "no-answer",
      note: "No answer on device.",
    });

    Page.startStep(2);
    Page.validateTimerActive("Waiting");

    cy.get('#timerDisplay').should('contain', '02:00');

    cy.window().then((win) => {
      if (typeof win.testResponse === "function") {
        win.testResponse("No");
      } else if (typeof win.simulateDeviceResponse === "function") {
        win.simulateDeviceResponse("No", true);
      }
    });

    cy.tick(125000);
    Page.validateTimerInactive();

    cy.get('[data-cy="received-messages"]').should('contain', 'No');
    Page.h2sStatus.should("contain.text", "HIGH");
    
    cy.get('[data-cy="resolution-reason"]').select("incident-without-dispatch");
    cy.get('[data-cy="resolve-alert-btn"]').click();
    
    cy.get('[data-cy="override-modal"]').should('be.visible');
    cy.get('[data-cy="override-gas-reading"]').should('contain', 'H₂S: 17.90 ppm (HIGH)');
    
    cy.get('[data-cy="override-reason"]').select('user-confirmed-safety');
    cy.get('[data-cy="confirm-override"]').should('not.be.disabled');
    cy.get('[data-cy="confirm-override"]').click();
    
    Page.validateLogEntry("Alert resolved (Override: User confirmed they are okay)");
  });

  it("@critical should handle CO gas basic functionality", () => {
    Page.loadAlertById("co-spontaneous");

    Page.header.should("be.visible");
    Page.employeeName.should("contain.text", "Marcus");
    Page.coStatus.should("contain.text", "HIGH");

    // Just verify the alert loads and basic UI works
    Page.validateStepStatus('step-1', 'Active');
    
    // Start and complete a step to verify protocol works
    Page.startStep(1);
    Page.completeStep(1, {
      outcome: "no-answer",
      note: "No answer from device call"
    });

    // Verify the step note was logged
    Page.validateLogEntry(/No answer from device call/i);
  });
});