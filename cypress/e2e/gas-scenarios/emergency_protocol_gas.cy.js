// cypress/e2e/local-testing/emergency_protocol_gas.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("Gas protocol — H2S High Threshold", () => {
 beforeEach(() => {
   // Set up clock control BEFORE visiting the page
   cy.clock();
   
   // Open local HTML (CLI --env emergencyProtocolPath=... can override)
   Page.visit();

   // Wait for the app to bootstrap (loader functions or data present).
   cy.window({ timeout: 20000 }).should((win) => {
     const ready =
       typeof win.loadAlert === "function" ||
       typeof win.loadAlertFromJSON === "function" ||
       (win.AlertDataManager && win.AlertDataManager.alertTypesData);
     expect(ready, "app bootstrap (loader or data present)").to.be.true;
   });
 });

 afterEach(() => {
   // Clean up clock after each test
   cy.clock().then((clock) => clock.restore());
 });

 it("blocks resolution while gas HIGH, allows override with reason", () => {
   // Load the alert - this one keeps gas HIGH throughout
   Page.loadAlertById("gas-high-threshold");

   // Wait for header to become visible after load, then basic checks
   Page.header.should("be.visible");
   Page.employeeName.should("contain.text", "Zach");
   Page.alertType.should("contain.text", "High threshold detected");
   Page.h2sStatus.should("contain.text", "HIGH");

   // ---- Step 1
   Page.completeStep(1, {
     outcome: "no-answer",
     note: "No answer on device.",
   });

   // ---- Step 2 (timer expected)
   Page.startStep(2);
   Page.validateTimerActive("Waiting");

   // Verify timer started (should show 02:00 for 2 minutes)
   cy.get('#timerDisplay').should('contain', '02:00');

   // Device replies "No" → should cancel timer
   cy.window().then((win) => {
     if (typeof win.testResponse === "function") {
       win.testResponse("No");
     } else if (typeof win.simulateDeviceResponse === "function") {
       win.simulateDeviceResponse("No", true);
     } else {
       throw new Error("No device-reply helper found on window");
     }
   });

   // Advance time to ensure timer completes (whether cancelled or expired)
   cy.tick(125000); // 2+ minutes to force timer completion

   // Now validate timer is inactive
   Page.validateTimerInactive();

   // Verify the device response was received
   cy.get('[data-cy="received-messages"]').should('contain', 'No');

   // ---- Gas STAYS HIGH throughout this test (no normalization)
   Page.h2sStatus.should("contain.text", "HIGH");
   
   // Resolution should be empty because gas is still dangerous
   Page.resolutionReason.should("have.value", "");

   // ---- Try to resolve while gas HIGH → Override modal should appear
   cy.get('[data-cy="resolution-reason"]').select("incident-without-dispatch");
   cy.get('[data-cy="resolve-alert-btn"]').click();
   
   // Override modal should appear because gas is HIGH
   cy.get('[data-cy="override-modal"]').should('be.visible');
   cy.get('[data-cy="override-gas-reading"]').should('contain', 'H₂S: 17.90 ppm (HIGH)');
   
   // Select override reason and confirm
   cy.get('[data-cy="override-reason"]').select('user-confirmed-safety');
   cy.get('[data-cy="confirm-override"]').should('not.be.disabled');
   cy.get('[data-cy="confirm-override"]').click();
   
   // Verify alert resolved with override
   Page.validateLogEntry("Alert resolved (Override: User confirmed they are okay)");
 });
});