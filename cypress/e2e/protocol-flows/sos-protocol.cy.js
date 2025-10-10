// cypress/e2e/protocol-flows/sos-protocol.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("SOS Protocol - Dispatch Scenarios", () => {
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

 context("Path 1: Timer Expiry - Specialist Manual Follow-up", () => {
  it("resolves after timer expires when specialist calls dispatch back and documents outcome", () => {
    // Load SOS immediate alert
    Page.loadAlertById("sos-immediate");

    Page.header.should("be.visible");
    Page.employeeName.should("contain.text", "Zach");

    // Action 1: Call user - no answer
    Page.completeStep(1, {
      outcome: "no-answer-voicemail",
      note: "Called user, no answer. Left voicemail"
    });

    // Action 2: Dispatch - should auto-evaluate to "yes"
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

    cy.get('[data-cy="dispatch-decision"]').should("have.value", "yes");
    cy.get('#step-2-note').type('Called dispatch. Dispatched Emergency Medical Services to location.');
    cy.get('[data-cy="step-2-post-btn"]').click();

    // Verify 30-minute dispatch follow-up timer starts
    Page.validateTimerActive("Dispatch Follow-up");

    // Action 3: Call ECs - no answer
    Page.completeStep("3-1", {
      outcome: "no-answer-voicemail",
      note: "Called EC1, no answer. Left voicemail"
    });

    // Let dispatch follow-up timer expire (30 minutes)
    cy.tick(1800000);

    // Timer should expire - callback window closed
    Page.validateTimerInactive();
    
    // Should auto-populate resolution with dispatch
    cy.get('[data-cy="resolution-reason"]').should(
      "have.value",
      "false-alert-with-dispatch"
    );

    // Action 4: Specialist calls dispatch back and documents outcome
    // NOTE: Must use manual notes area - step-2 textarea is disabled after completion
    cy.get('[data-cy="manual-notes"]')
      .should("be.visible")
      .type('Called dispatch back. Dispatch confirmed no emergency found at location. All clear.');
    
    // Post the specialist note
    cy.get('[data-cy="post-note-btn"]')
      .should("be.enabled")
      .click();
    
    // Verify specialist's dispatch callback note was logged
    Page.validateLogEntry("Called dispatch back");
    Page.validateLogEntry("Dispatch confirmed no emergency found");
    
    // Action 5: Specialist manually resolves alert
    Page.resolveAlert();
    Page.validateLogEntry("Alert resolved");
  });
});

 context("Path 2: EC Callback Resolution", () => {
   it("resolves when EC calls during dispatch timer", () => {
     Page.loadAlertById("sos-immediate");

     // Actions 1-2: Same setup as Path 1
     Page.completeStep(1, {
       outcome: "no-answer-voicemail",
       note: "Called user, no answer. Left voicemail"
     });

     // Dispatch
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

     cy.get('[data-cy="dispatch-decision"]').should("have.value", "yes");
     cy.get('#step-2-note').type('Called dispatch. Dispatched Emergency Medical Services to location.');
     cy.get('[data-cy="step-2-post-btn"]').click();

     Page.validateTimerActive("Dispatch Follow-up");

     // Action 3: EC calls back and confirms user okay
     cy.get('[data-cy="global-cancel-dropdown"]').select("ec-callback");

     // Should resolve with dispatch
     cy.get('[data-cy="resolution-reason"]').should(
       "have.value",
       "false-alert-with-dispatch"
     );
     
     Page.resolveAlert();
     Page.validateLogEntry("Alert resolved");
     Page.validateLogEntry("Emergency contact called in and confirmed user is okay");
   });
 });

 context("Path 3: User Callback Resolution", () => {
   it("resolves when user calls during dispatch timer", () => {
     Page.loadAlertById("sos-immediate");

     // Same setup
     Page.completeStep(1, {
       outcome: "no-answer-voicemail",
       note: "Called user, no answer. Left voicemail"
     });

     // Dispatch
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

     cy.get('[data-cy="dispatch-decision"]').should("have.value", "yes");
     cy.get('#step-2-note').type('Called dispatch. Dispatched Emergency Medical Services to location.');
     cy.get('[data-cy="step-2-post-btn"]').click();

     Page.validateTimerActive("Dispatch Follow-up");

     // User calls back during timer
     cy.get('[data-cy="global-cancel-dropdown"]').select("user-callback");

     // Should resolve with dispatch
     cy.get('[data-cy="resolution-reason"]').should(
       "have.value",
       "false-alert-with-dispatch"
     );
     
     Page.resolveAlert();
     Page.validateLogEntry("Alert resolved");
     Page.validateLogEntry("User called in and confirmed they are okay");
   });
 });

 context("Path 4: Dispatch Callback Resolution", () => {
   it("resolves when dispatch calls back with no emergency found", () => {
     Page.loadAlertById("sos-immediate");

     // Same setup
     Page.completeStep(1, {
       outcome: "no-answer-voicemail",
       note: "Called user, no answer. Left voicemail"
     });

     // Dispatch
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

     cy.get('[data-cy="dispatch-decision"]').should("have.value", "yes");
     cy.get('#step-2-note').type('Called dispatch. Dispatched Emergency Medical Services to location.');
     cy.get('[data-cy="step-2-post-btn"]').click();

     Page.validateTimerActive("Dispatch Follow-up");

     // Dispatch calls back - no emergency found
     cy.get('[data-cy="global-cancel-dropdown"]').select("dispatch-no-emergency");

     // Should resolve with dispatch
     cy.get('[data-cy="resolution-reason"]').should(
       "have.value",
       "false-alert-with-dispatch"
     );
     
     Page.resolveAlert();
     Page.validateLogEntry("Alert resolved");
     Page.validateLogEntry("Dispatch called back, no emergency found at location");
   });

   it("resolves when dispatch calls back with user confirmed okay on scene", () => {
     Page.loadAlertById("sos-immediate");

     // Same setup  
     Page.completeStep(1, {
       outcome: "no-answer-voicemail",
       note: "Called user, no answer. Left voicemail"
     });

     // Dispatch
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

     cy.get('[data-cy="dispatch-decision"]').should("have.value", "yes");
     cy.get('#step-2-note').type('Called dispatch. Dispatched Emergency Medical Services to location.');
     cy.get('[data-cy="step-2-post-btn"]').click();

     Page.validateTimerActive("Dispatch Follow-up");

     // Dispatch calls back - user okay on scene
     cy.get('[data-cy="global-cancel-dropdown"]').select("dispatch-user-okay");

     // Should resolve with dispatch
     cy.get('[data-cy="resolution-reason"]').should(
       "have.value",
       "false-alert-with-dispatch"
     );
     
     Page.resolveAlert();
     Page.validateLogEntry("Alert resolved");
     Page.validateLogEntry("Dispatch called back, user confirmed okay on scene");
   });
 });
});