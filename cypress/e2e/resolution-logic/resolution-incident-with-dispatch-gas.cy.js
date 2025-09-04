// cypress/e2e/resolution-logic/resolution-incident-with-dispatch-gas.cy.js
// Scope: Gas alert stays HIGH → dispatch "yes" → resolution preselects "incident-with-dispatch"
// and requires an override (since gas is HIGH).
import Page from "../../pages/EmergencyProtocolPage";

const expectIncidentWithDispatchSelected = () => {
  Page.resolutionReason
    .should("be.visible")
    .should(($sel) => {
      const val = ($sel.val() || "").trim();
      const label = $sel.find("option:selected").text().trim();
      const ok =
        val === "incident-with-dispatch" ||
        /incident.*with\s*dispatch/i.test(label);
      expect(
        ok,
        `expected "Incident with dispatch" (val="${val}", text="${label}")`
      ).to.be.true;
    });
};

describe("Resolution Reason — Incident WITH Dispatch (Gas, HIGH → Override)", () => {
  beforeEach(() => {
    cy.clock(Date.now(), [
      "Date",
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
    ]);
    Page.visit();
    cy.window({ timeout: 20000 }).should((win) => {
      expect(typeof win.loadAlert, "app bootstrap").to.eq("function");
    });
  });

  afterEach(() => cy.clock().then((c) => c.restore()));

  it("blocks while HIGH, dispatches, and resolves as 'Incident with dispatch' via override", () => {
    // Gas alert that remains HIGH (no normalization)
    Page.loadAlertById("gas-high-threshold");

    // Header + HIGH gas sanity
    Page.header.should("be.visible");
    Page.employeeName.should("contain.text", "Zach");
    Page.h2sStatus.should("contain.text", "HIGH");

    // Step 1: device call → no answer
    Page.completeStep(1, {
      outcome: "no-answer",
      note: "No answer on device.",
    });

    // Step 2: expect dispatch conditions to evaluate "yes"
    cy.get('[data-cy="dispatch-decision"]')
      .should("be.visible")
      .then(($sel) => {
        if (!$sel.val()) {
          cy.window().then((win) => {
            if (typeof win.silentlyUpdateDispatchConditions === "function") {
              win.silentlyUpdateDispatchConditions();
            }
          });
        }
      })
      .should("have.value", "yes");

    // Post a dispatch note (step ID-agnostic, uses POM)
    Page.completeDispatch({
      note: "Called dispatch; EMS requested to last known location.",
    });

    // Follow-up timer starts
    Page.validateTimerActive("Dispatch Follow-up");

    // Gas remains HIGH → resolution dropdown should be blank before closure
    Page.h2sStatus.should("contain.text", "HIGH");
    Page.resolutionReason.should("have.value", "");

    // Provide closure:
    // If a cancel/closure dropdown exists while the timer is ACTIVE, use it now.
    // Otherwise, fall back to letting the follow-up timer expire.
    cy.get("body").then(($b) => {
      if ($b.find('[data-cy="global-cancel-dropdown"]').length) {
        // Use POM getter for robustness (same selector under the hood)
        Page.cancelTimerDropdown.select("dispatch-no-emergency", { force: true });
      } else {
        // OPTION B: Let the follow-up timer expire to trigger preselection
        cy.tick(30 * 60 * 1000);
        Page.validateTimerInactive();
      }
    });

    // NOW app should preselect "Incident with dispatch"
    expectIncidentWithDispatchSelected();

    // Gas is HIGH → resolving requires override
    Page.resolveAlert(); // uses the currently selected reason
    Page.overrideModal.should("be.visible");
    Page.overrideReason.select("user-confirmed-safety", { force: true });
    Page.confirmOverrideButton.should("not.be.disabled").click({ force: true });

    // Final assertions
    Page.resolutionStatus.should("contain.text", "Completed");
    Page.validateLogEntry(/alert resolved/i);
  });
});
