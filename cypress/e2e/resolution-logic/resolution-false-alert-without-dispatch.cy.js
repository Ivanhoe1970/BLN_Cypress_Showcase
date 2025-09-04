// cypress/e2e/resolution-logic/simple-resolution-flow-tests.cy.js
import Page from "../../pages/EmergencyProtocolPage";

// Retry-friendly: keeps retrying until the selected option matches
const expectResolutionSelectedToMatch = (regex) => {
  Page.resolutionReason
    .should("be.visible")
    .find("option:selected")
    .invoke("text")
    .then((t) => t.trim())
    .should((txt) => expect(txt, "selected option text").to.match(regex));
};

describe("Resolution Reason — Non-gas False Alert WITHOUT Dispatch", () => {
  beforeEach(() => {
    cy.clock(Date.now(), ["Date","setTimeout","clearTimeout","setInterval","clearInterval"]);
    Page.visit();
    cy.window({ timeout: 20000 }).should((win) => {
      expect(typeof win.loadAlert, "loadAlert available").to.eq("function");
    });
    if (typeof Page.openDemoPanel === "function") Page.openDemoPanel();
  });

  afterEach(() => cy.clock().then((clock) => clock.restore()));

  it("runs message-first flow with timer, then resolves as false-alert", () => {
    // Load deterministic NON-GAS alert
    Page.loadAlertById("message-test");

    // Header sanity
    Page.alertType.should("not.contain.text", "Gas");
    Page.employeeName.should("contain.text", "Marcus");

    // STEP 1: message-first + timer visible/active
    Page.startStep(1);
    Page.validateTimerActive();

    // Simulate device reply → cancel timer
    cy.window().then((win) => {
      if (typeof win.testResponse === "function") win.testResponse("I'm OK");
      else if (typeof win.simulateDeviceResponse === "function") win.simulateDeviceResponse("I'm OK", true);
      else if (typeof Page.cancelAnyTimer === "function") Page.cancelAnyTimer();
    });
    Page.validateTimerInactive();

    // STEP 2: call user → confirmed OK
    Page.startStep(2);
    Page.stepSelect(2).then(($sel) => {
      const hasValue = Array.from($sel[0].options || []).some((o) => o.value === "confirmed-ok");
      if (hasValue) Page.stepSelect(2).select("confirmed-ok", { force: true });
      else Page.stepSelect(2).select(/confirmed\s*ok/i, { force: true });
    });
    Page.stepNote(2).clear().type("User confirmed they are fine.", { delay: 0 });
    Page.stepPost(2).click({ force: true });

    // ✅ NOW the app decides the resolution category → assert preselection here
    expectResolutionSelectedToMatch(/false\s*alert.*without\s*dispatch/i);

    // Log sanity
    Page.validateLogEntry("confirmed they are fine");

    // Resolve
    Page.resolveAlert("false-alert-without-dispatch");

    // Final status
    cy.get('[data-cy="resolution-status"], #resolution-status')
      .should("have.class", "completed")
      .and("contain.text", "Completed");

    Page.validateLogEntry("Resolving alert");
  });
});
