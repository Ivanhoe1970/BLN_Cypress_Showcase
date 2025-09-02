// cypress/e2e/integration/protocol-workflow.cy.js
import Page from "../../pages/EmergencyProtocolPage";

/**
 * Protocol Workflow — Non-gas happy path (Fall Detection)
 * Steps: 1 (call) → 2 (message + timer) → 3 (user phone) → 4 (dispatch YES) → Resolve
 */

describe("Protocol Workflow — Non-gas happy path", () => {
  beforeEach(() => {
    cy.clock(Date.now(), [
      "Date",
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
    ]);
    Page.visit();

    // bootstrap
    cy.window({ timeout: 20000 }).should((win) => {
      const ready =
        typeof win.loadAlert === "function" &&
        typeof win.startGlobalTimer === "function";
      expect(ready, "app bootstrap").to.be.true;
    });

    // load full 5-step non-gas: Fall Detection
    if (typeof Page.loadAlertById === "function") {
      Page.loadAlertById("fall-detection");
    } else {
      if (typeof Page.openDemoPanel === "function") Page.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]')
        .should("be.visible")
        .click();
    }

    if (typeof Page.validateGasDataAbsent === "function")
      Page.validateGasDataAbsent();
  });

  afterEach(() => cy.clock().then((c) => c.restore()));

  it("executes full flow: device → message → user phone → dispatch → resolve", () => {
    // STEP 1: device call (note-only; some profiles have no outcome select)
    if (typeof Page.completeStep === "function") {
      Page.completeStep("1", { note: "No answer on device call." });
    } else {
      cy.get('[data-cy="step-1-button"]').click();
      cy.get('[data-cy="post-note"]').click();
    }

    // STEP 2: message + timer (cancel quickly)
    if (typeof Page.sendMessage === "function") {
      Page.sendMessage("Do you need help?");
    } else {
      cy.get('[data-cy="step-2-button"]').click();
      cy.get('[data-cy="post-note"]').click();
    }
    cy.tick(400);
    cy.get("body").then(($b) => {
      if ($b.find('[data-cy="global-cancel-button"]').length) {
        cy.get('[data-cy="global-cancel-button"]').click({ force: true });
      }
    });

    // STEP 3: user phone (note-only)
    if (typeof Page.completeStep === "function") {
      Page.completeStep("3", { note: "No answer on user phone." });
    } else {
      cy.get('[data-cy="step-3-button"]').click();
      cy.get('[data-cy="post-note"]').click();
    }

    // STEP 4: DISPATCH (matches your UI: decision, service type, note, post)
    cy.get('[data-cy="dispatch-decision"]').should("be.visible").select("yes");
    cy.get('[data-cy="dispatch-service-select"]')
      .should("be.visible")
      .select("Emergency Medical Services (EMS)"); // select by exact value

    cy.get('[data-cy="dispatch-note"], [data-cy="note-textarea"], textarea')
      .first()
      .clear()
      .type("Dispatched EMS; awaiting response.", { delay: 0 });

    // use the correct post button for Step 4
    cy.get('[data-cy="step-4-post-btn"]').click({ force: true }); // triggers follow-up timer if configured

    cy.tick(400);
    cy.get("body").then(($b) => {
      if ($b.find('[data-cy="global-cancel-button"]').length) {
        cy.get('[data-cy="global-cancel-button"]').click({ force: true });
      }
    });

    // RESOLUTION (non-gas allowed)
    Page.resolveAndAutoSelectReason().assertResolutionAutoSelected();
    Page.resolveAlertButton.should("be.enabled").click();

    // sanity
    cy.get('[data-cy="resolution-status"]').should("contain.text", "Completed");
  });
});
