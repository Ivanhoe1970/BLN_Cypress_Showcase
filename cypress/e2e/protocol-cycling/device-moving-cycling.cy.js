// cypress/e2e/protocol-cycling/device-moving-cycling.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("Protocol Cycling - Device Moving", () => {
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

 it("cycles when device moving, resolves when device stops", () => {
   // Load alert with device moving at 95.7 km/h
   Page.loadAlertById("missed-check-in");

   Page.header.should("be.visible");
   Page.employeeName.should("contain.text", "Zach");

   // ═══ ROUND 1: Device moving blocks dispatch ═══

   // Action 1: Message device
   Page.completeStep(1, { 
     outcome: "no-response",
     note: "Sent message, no response" 
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

   // Ensure the resolution suffix will be *without-dispatch*
   cy.window().then((win) => { win.dispatchMade = false; });

   // Should cycle back
   Page.validateLogEntry("Repeating STEPS 1, 2, 3 & 4");

   // ═══ ROUND 2: Device stops moving, dispatch available ═══

   // Simulate device stopping
   cy.window().then((win) => {
     const speedElement = win.document.getElementById("device-speed");
     if (speedElement) speedElement.textContent = "0.5 km/h";
     
     // Trigger dispatch condition re-evaluation
     if (typeof win.silentlyUpdateDispatchConditions === 'function') {
       win.silentlyUpdateDispatchConditions();
     }
   });

   // Action 1: Message device
   Page.completeStep(1, { outcome: "no-response" });

   // Action 2: Call user - no answer
   Page.completeStep(2, { outcome: "no-answer-voicemail" });

   // Action 3: EC confirms user OK → Resolution  
   Page.completeStep("3-1", {
     outcome: "confirmed-ok",
     note: "EC confirmed user is okay. Resolving alert.",
   });

   // Should resolve without dispatch (user confirmed OK)
   cy.get('[data-cy="resolution-reason"]').should(
     "have.value", 
     "false-alert-without-dispatch"
   );
   Page.resolveAlert();
   Page.validateLogEntry("Alert resolved");
 });
});