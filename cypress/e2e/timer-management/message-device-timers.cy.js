// cypress/e2e/timer-management/message-device-timers.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("Message Device Timers", () => {
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

  context("Standard 2-Minute Timer", () => {
    it("starts and manages 2-minute timer for message device step", () => {
      // Use valid alert ID from your demo panel
      Page.loadAlertById("missed-check-in");

      Page.header.should("be.visible");
      Page.employeeName.should("contain.text", "Zach");

      // Start Step 1 (message device) - should create 2-minute timer
      Page.startStep(1);
      
      // Verify timer becomes active
      cy.get('#timerDisplay').should('not.contain', '--:--');
      cy.get('#timerInfo').should('contain', 'Waiting for device reply');

      // Verify timer counts down properly
      cy.tick(30000); // 30 seconds
      cy.get('#timerDisplay').should('contain', '1:30');

      // Cancel timer via user callback
      cy.get('[data-cy="global-cancel-dropdown"]').select("user-callback");
      
      // Verify timer becomes inactive
      cy.get('#timerDisplay').should('contain', '--:--');
      Page.validateLogEntry("User called in and confirmed they are okay");
    });

    it("expires after 2 minutes and enables step progression", () => {
      Page.loadAlertById("missed-check-in");

      // Start message device step
      Page.startStep(1);
      cy.get('#timerDisplay').should('not.contain', '--:--');

      // Let timer expire completely
      cy.tick(120000); // 2 minutes

      // Timer should be inactive and step should progress
      cy.get('#timerDisplay').should('contain', '--:--');
      Page.validateLogEntry("Timer expired");
    });
  });

  context("Extended 5-Minute Timer", () => {
    it("starts 5-minute timer for no-motion protocol", () => {
      Page.loadAlertById("no-motion");

      Page.header.should("be.visible");
      Page.employeeName.should("contain.text", "Marcus");

      // Start Step 1 (message device) - should create 5-minute timer
      Page.startStep(1);
      
      // Verify timer is active
      cy.get('#timerDisplay').should('not.contain', '--:--');
      cy.get('#timerInfo').should('contain', 'Waiting for device reply');
      
      // Verify it's actually counting down from 5 minutes
      cy.tick(60000); // 1 minute
      cy.get('#timerDisplay').should('contain', '4:00');
      
      cy.tick(120000); // 2 more minutes (3 total elapsed)
      cy.get('#timerDisplay').should('contain', '2:00');
      
      // Cancel timer early
      cy.get('[data-cy="global-cancel-dropdown"]').select("user-callback");
      cy.get('#timerDisplay').should('contain', '--:--');
    });
  });

  context("Timer Cancellation Scenarios", () => {
    it("cancels timer when user calls in", () => {
      Page.loadAlertById("sos-immediate");

      // Start message-capable step (Step 1 for SOS is call-user, need different approach)
      // Use missed-check-in which has message-device as Step 1
      cy.visit('/automated-gas-alert-protocol/index.html');
      Page.loadAlertById("missed-check-in");

      Page.startStep(1);
      cy.get('#timerDisplay').should('not.contain', '--:--');

      // User callback cancellation
      cy.get('[data-cy="global-cancel-dropdown"]').select("user-callback");

      cy.get('#timerDisplay').should('contain', '--:--');
      Page.validateLogEntry("User called in and confirmed they are okay");
      
      // Should trigger resolution flow
      cy.get('[data-cy="resolution-reason"]').should('not.have.value', '');
    });

    it("cancels timer when emergency contact calls in", () => {
      Page.loadAlertById("no-motion");

      Page.startStep(1);
      cy.get('#timerDisplay').should('not.contain', '--:--');

      // EC callback cancellation  
      cy.get('[data-cy="global-cancel-dropdown"]').select("ec-callback");

      cy.get('#timerDisplay').should('contain', '--:--');
      Page.validateLogEntry("Emergency contact called in and confirmed user is okay");
    });
  });

  context("Timer State Validation", () => {
    it("shows correct timer information and controls", () => {
      Page.loadAlertById("missed-check-in");

      Page.startStep(1);
      
      // Verify timer displays correct context
      cy.get('#timerInfo').should('be.visible');
      cy.get('#timerDisplay').should('be.visible').and('not.contain', '--:--');
      
      // Verify cancel dropdown shows correct options
      cy.get('[data-cy="global-cancel-dropdown"]').should('be.visible');
      cy.get('[data-cy="global-cancel-dropdown"] option').should('contain.text', 'User called in and confirmed they are okay');
      
      // Clean up
      cy.get('[data-cy="global-cancel-dropdown"]').select("user-callback");
    });
  });
});