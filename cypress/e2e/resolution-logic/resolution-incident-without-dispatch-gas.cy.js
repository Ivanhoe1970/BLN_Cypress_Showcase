// cypress/e2e/resolution-logic/resolution-incident-without-dispatch-gas.cy.js
// Scope: Gas alert normalizes to NORMAL → no dispatch → resolution preselects "incident-without-dispatch"
// and resolves without override.
import Page from "../../pages/EmergencyProtocolPage";

const expectIncidentWithoutDispatchSelected = () => {
  Page.resolutionReason
    .should("be.visible")
    .should(($sel) => {
      const val   = ($sel.val() || "").trim();
      const label = $sel.find("option:selected").text().trim();
      const ok = val === "incident-without-dispatch" || /incident.*without\s*dispatch/i.test(label);
      expect(ok, `expected "Incident without dispatch" (val="${val}", text="${label}")`).to.be.true;
    });
};

describe("Resolution Reason — Incident WITHOUT Dispatch (Gas, NORMAL)", () => {
  beforeEach(() => {
    cy.clock(Date.now(), ["Date","setTimeout","clearTimeout","setInterval","clearInterval"]);
    Page.visit();
    cy.window({ timeout: 20000 }).should((win) => {
      expect(typeof win.loadAlert, "app bootstrap").to.eq("function");
    });
  });

  afterEach(() => cy.clock().then((c) => c.restore()));

  it("allows resolution as 'Incident without dispatch' once gas NORMAL", () => {
    // Monitoring alert that normalizes after ~60s (per your JSON)
    Page.loadAlertById("o2-depletion-resolves");

    // Start monitoring (your app may auto-start; if not, trigger the step)
    // If your monitoring is mapped to a specific step, adapt the step number:
    Page.startTimer("monitoring-start", "Monitoring", 120);  // if your app exposes this; otherwise remove

    // Advance clock to trigger normalization (JSON says ~60s)
    cy.tick(60 * 1000);

    // Confirm gas is NORMAL (O₂ example)
    Page.validateGasReading("o2", null, "NORMAL"); // status only
    Page.validateTimerInactive();                  // monitoring done

    // Ensure no dispatch decision is set (or explicitly "no")
    cy.get('[data-cy="dispatch-decision"]').should(($sel) => {
      const v = ($sel.val() || "").trim();
      expect(v === "" || v === "no", "dispatch not required").to.be.true;
    }).then(($sel) => {
      if ($sel && $sel.length) Page.selectDispatchDecision("no");
    });

    // ✅ Provide a closure signal on the non-dispatch path
    // (Call user and mark as confirmed-ok — tolerant POM handles step layout)
    Page.completeStep(2, {
      outcome: "confirmed-ok",
      note: "User confirmed they are fine.",
    });

    // Now the app should preselect "Incident without dispatch" (retryable assertion)
    expectIncidentWithoutDispatchSelected();

    // Resolve without override (gas is NORMAL)
    Page.resolveAlert(); // current selected reason
    Page.resolutionStatus.should("contain.text", "Completed");
    Page.validateLogEntry(/alert resolved/i);
  });
});
