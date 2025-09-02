// cypress/e2e/timer-management/core-timer-functionality.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("Core Timer Functionality", () => {
  beforeEach(() => {
    cy.clock();
    Page.visit();
    cy.window({ timeout: 20000 }).should((win) => {
      expect(typeof win.loadAlert === "function").to.be.true;
    });
  });

  afterEach(() => {
    cy.clock().then((clock) => clock.restore());
  });

  it("creates and cancels message-device timers", () => {
    Page.loadAlertById("missed-check-in");

    // Missed Check-In protocol: Step 1 = Message device (2-minute timer)
    Page.startStep(1);
    Page.validateTimerActive("Waiting for device reply");

    // Cancel with valid cancellation reason
    Page.cancelTimerDropdown.select("User called in and confirmed they are okay");
    Page.validateTimerInactive();
  });

  it("creates and cancels EC callback timers", () => {
    Page.loadAlertById("fall-detection");

    // Fall Detection protocol:
    // Step 1 sub-steps: combined device/user calls
    Page.completeStep("1-1", { outcome: "no-answer", note: "Called device, no answer" });
    Page.completeStep("1-2", { outcome: "no-answer-voicemail", note: "Called user, no answer" });

    // Step 2 = Message device (creates 2-minute timer) — use the generic step helper
    Page.completeStep(2, { outcome: "no-response", note: "Sent message, no response" });

    // Step 3 = Emergency contacts — sub-step id format remains step-3-1 / step-3-2
    Page.completeEmergencyContact("step-3-1", {
      outcome: "ec-callback-30min-outbound",
      note: "EC will check and call back within 30 minutes",
    });

    Page.validateTimerActive("EC Callback");

    // Cancel EC timer
    Page.cancelTimerDropdown.select("Emergency contact called in and confirmed user is okay");
    Page.validateTimerInactive();
  });

  it("creates and cancels dispatch timers", () => {
    Page.loadAlertById("sos-immediate");

    // SOS protocol:
    // Step 1 = Call user
    Page.completeStep(1, { outcome: "no-answer-voicemail", note: "Called user, no answer" });

    // Step 2 = Dispatch. Start step, then complete with decision/service/note.
    Page.startStep(2);

    // Allow any auto-evaluation to settle
    cy.wait(1000);

    Page.completeDispatch({
      decision: "yes",
      service: "Emergency Medical Services (EMS)",
      note: "Dispatched EMS to location",
    });

    Page.validateTimerActive("Dispatch Follow-up");

    // Cancel with valid dispatch cancellation option
    Page.cancelTimerDropdown.select("Emergency contact called in and confirmed user is okay");
    Page.validateTimerInactive();
  });

  it("handles timer expiration correctly", () => {
    Page.loadAlertById("missed-check-in");

    // Start message timer (Step 1)
    Page.startStep(1);
    Page.validateTimerActive("Waiting for device reply");

    // Let timer expire (120 seconds for message-device)
    cy.tick(120000);

    // Verify timer expired and next step activated
    Page.validateTimerInactive();
    Page.validateLogEntry("Timer expired. Proceeding to next step");
  });

  it("prevents multiple timer instances", () => {
    Page.loadAlertById("fall-detection");

    // Start message timer (Step 2 for fall-detection)
    Page.startStep(2);
    Page.validateTimerActive();

    // Try to start another timer - should not create duplicate
    Page.startStep(2);

    // Should still have only one active timer
    Page.validateTimerActive();
    cy.get("#timerDisplay").should("have.length", 1);
  });
});
