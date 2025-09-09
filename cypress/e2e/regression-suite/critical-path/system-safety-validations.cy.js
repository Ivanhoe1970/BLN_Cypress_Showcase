// cypress/e2e/regression-suite/critical-path/system-safety-validations.cy.js
import Page from "../../../pages/EmergencyProtocolPage";

describe('System Safety Validations - Critical Controls', () => {
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

  it('@critical should handle pre-alert conditions (>24h old)', () => {
    Page.loadAlertById('pre-alert-test');

    // Match the actual log pattern from your system
    Page.validateLogEntry(/Pre-alert.*alert triggered.*hours ago/i);

    // Verify steps are disabled
    cy.get('[data-cy^="step-"][data-cy$="-button"]')
      .should('be.disabled');

    // Use fallback selector for resolve button
    cy.get('[data-cy="resolve-alert-btn"], .btn-danger')
      .first()
      .should('not.be.disabled');
  });

  it('@critical should enforce gas level resolution blocking', () => {
    Page.loadAlertById('gas-high-threshold');

    Page.h2sStatus.should('contain.text', 'HIGH');

    Page.resolutionReason.select('false-alert-without-dispatch');
    
    cy.get('[data-cy="resolve-alert-btn"], .btn-danger')
      .first()
      .click();
    
    cy.get('[data-cy="override-modal"]').should('be.visible');
    cy.get('[data-cy="override-gas-reading"]').should('contain', 'HIGH');
  });

  it('@critical should validate specialist override authority', () => {
    Page.loadAlertById('gas-high-threshold');

    Page.resolutionReason.select('incident-without-dispatch');
    cy.get('[data-cy="resolve-alert-btn"], .btn-danger')
      .first()
      .click();

    cy.get('[data-cy="override-modal"]').should('be.visible');

    cy.get('[data-cy="override-reason"]').select('user-confirmed-safety');
    cy.get('[data-cy="confirm-override"]').should('not.be.disabled').click();

    Page.validateLogEntry(/Alert resolved.*Override.*user confirmed/i);
  });

  it('@critical should validate MST timestamp formatting', () => {
    Page.loadAlertById('gas-high-threshold');
  
    // Start and complete a step to generate a log with timestamp
    Page.startStep(1);
    Page.stepSelect(1).select("no-answer", { force: true });
    Page.stepNote(1).clear().type("Test note for MST timestamp validation", { delay: 0 });
    Page.stepPost(1).click({ force: true });
  
    // Verify MST timestamp format in the logs
    Page.validateLogEntry(/\[\d{2}:\d{2}:\d{2} MST\]/);
    Page.validateLogEntry(/Op 417/);
  });
});