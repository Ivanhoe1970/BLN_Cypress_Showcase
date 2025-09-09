import Page from "../../../pages/EmergencyProtocolPage";

describe("Dispatch Coordination Integration", () => {
  beforeEach(() => {
    cy.clock();
    Page.visit();
  });

  afterEach(() => {
    cy.clock().then((clock) => clock.restore());
    Page.clearAlert();
  });

  it("should validate dispatch readiness conditions", () => {
    Page.loadAlertById("sos-immediate");

    // Check for dispatch decision elements
    Page.dispatchDecision.should("be.visible");

    // Verify dispatch options
    Page.dispatchDecision.select("yes");
    Page.serviceTypeContainer.should("be.visible");
    Page.serviceTypeSelect.should("be.visible");
  });

  it("should handle emergency services coordination", () => {
    Page.loadAlertById("h2s-response");

    // Progress through protocol to dispatch step
    cy.tick(3000);

    // Set up dispatch
    Page.dispatchDecision.select("yes").should("have.value", "yes");
    Page.serviceTypeSelect.should("be.visible").select("Fire Department");

    // Verify the chosen service is reflected in UI (not via logs)
    cy.get("#dispatch option:selected")
      .invoke("text")
      .should("match", /fire department/i);

    // (Optional) small tick if UI re-renders after selection
    cy.tick(200);
  });

  it("should enforce offline constraints: messaging blocked and dispatch not ready", () => {
    Page.loadAlertById("missed-check-in-offline");

    // Give the UI a moment under cy.clock()
    cy.tick(500);

    // Step 1 dropdown has the offline outcome; select it and post
    cy.get('[data-cy="step-1-select"]')
      .should("be.visible")
      .then(($sel) => {
        const opt = [...$sel[0].options].find((o) =>
          /Unable to send text message,\s*device offline/i.test(o.text)
        );
        expect(opt, "Step 1 offline outcome option").to.exist;
        cy.wrap($sel).select(opt.value);
      });
    cy.get('[data-cy="step-1-post-btn"]').should("be.enabled").click();

    // Log reflects the chosen offline outcome for Step 1
    Page.validateLogEntry(
      /Step\s*1.*Unable to send text message,\s*device offline/i
    );

    // Device connectivity panel: Last Communication > 30 minutes ago
    Page.lastCommTime
      .should("be.visible")
      .invoke("text")
      .then((txt) => {
        const m = txt.match(/(\d+)\s*minutes?\s*ago/i);
        expect(m, `last comm text: "${txt}"`).to.not.be.null;
        const minutes = parseInt(m[1], 10);
        expect(minutes, "Last communication minutes ago").to.be.greaterThan(30);
      });

    // Dispatch readiness: "Dispatch conditions met?" should be "No"
    // (dispatch blocked while device is offline / last comm > 30 min)
    Page.dispatchDecision.should("be.visible").should("have.value", "no");
  });

  it("should validate complete dispatch workflow", () => {
    Page.loadAlertById("sos-immediate");

    // Sanity: SOS protocol loaded (UI, not logs)
    cy.tick(200);
    Page.alertType.should("contain.text", "SOS");

    // Dispatch decision is system-evaluated. Ensure it's set to YES.
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

    // Select the EMS service robustly (label or value may include "(EMS)")
    Page.serviceTypeSelect.should("be.visible").then(($sel) => {
      const opts = [...$sel[0].options];
      const opt = opts.find(
        (o) =>
          /Emergency\s+Medical\s+Services/i.test(o.text) ||
          /Emergency\s+Medical\s+Services\s*\(EMS\)/i.test(o.value)
      );
      expect(opt, "EMS service option").to.exist;
      cy.wrap($sel).select(opt.value);
    });

    // Post the dispatch note (no free-form typing at dispatch)
    cy.get('[data-cy="step-2-post-btn"]:visible').click();

    // Dispatch follow-up timer should be running now
    Page.validateTimerActive("Dispatch Follow-up");

    // === Required policy step: receive a callback that CONFIRMS OK ===
    // Use any of: 'user-callback' | 'ec-callback' | 'dispatch-user-okay' | 'dispatch-no-emergency'
    cy.get('[data-cy="global-cancel-dropdown"]')
      .should("be.visible")
      .select("user-callback", { force: true });

    // Resolution should be preselected to "False alert WITH dispatch"
    cy.get('[data-cy="resolution-reason"]')
      .should("be.visible")
      .then(($sel) => {
        const value = ($sel.val() || "").trim();
        const text = $sel.find("option:selected").text().trim();
        const re = /false\s*alert.*with\s*dispatch/i;
        expect(
          value === "false-alert-with-dispatch" || re.test(text),
          `Expected resolution "False alert with dispatch" (value="${value}", text="${text}")`
        ).to.be.true;
      });

    // Resolve and verify outcome
    Page.resolveAlertButton.click();
    Page.validateLogEntry(
      /user.*confirmed.*ok|emergency contact.*confirmed.*ok|dispatch.*(user.*ok|no emergency)/i
    );
    Page.validateLogEntry(/Alert resolved/i);
  });

  it("should handle dispatch skip scenarios", () => {
    Page.loadAlertById("missed-check-in-offline"); // offline => system should auto-select "No"

    // Allow auto-evaluation under cy.clock(); nudge if helper exists.
    cy.tick(500);
    cy.get('[data-cy="dispatch-decision"]')
      .should("be.visible")
      .then(($sel) => {
        if (!$sel.val() || /^(?:pending)?$/.test(String($sel.val()))) {
          cy.window().then((win) => {
            if (typeof win.silentlyUpdateDispatchConditions === "function") {
              win.silentlyUpdateDispatchConditions();
            }
          });
          cy.tick(200);
        }
        const val = ($sel.val() || "").trim();
        const text = $sel.find("option:selected").text().trim();
        // Accept either raw value 'no' OR visible label "No"
        expect(
          val === "no" || /^no$/i.test(text),
          `dispatch decision (value="${val}", text="${text}")`
        ).to.be.true;
      });

    // Assert the "Unmet Dispatch Condition:" panel is visible
    cy.contains(/Unmet Dispatch Condition:/i).should("be.visible");

    // Inside that panel, the reason <select> should be present and show the "Device offline..." option
    cy.contains(/Unmet Dispatch Condition:/i)
      .parent()
      .find("select")
      .should("be.visible")
      .find("option:selected")
      .invoke("text")
      .should(
        "match",
        /Device\s*offline.*last\s*comm\s*>\s*30\s*min.*battery\s*≤?\s*10%.*signal\s*≤?\s*10%/i
      );

    // If the step has a Post Note button, click it (ok if not present)
    cy.get("body").then(($b) => {
      const btn =
        $b.find('[data-cy="step-4-post-btn"]:visible')[0] ||
        $b.find('button:contains("Post Note"):visible')[0];
      if (btn) cy.wrap(btn).click({ force: true });
    });

    // Resolve WITHOUT dispatch
    Page.resolutionReason
      .should("be.visible")
      .select("false-alert-without-dispatch")
      .should("have.value", "false-alert-without-dispatch"); // verify the path

    Page.resolveAlertButton.click();

    // Final outcome logs
    Page.validateLogEntry(/Unable to dispatch.*Device offline/i); // reason we skipped
    Page.validateLogEntry(/Alert resolved/i); // closure happened
  });

  it("should validate dispatch readiness criteria", () => {
    Page.loadAlertById("h2s-response");

    // Verify device status affects dispatch readiness
    Page.assertDeviceStatus("online");

    // Verify location data present
    Page.deviceLocation.should("be.visible");
    Page.deviceCoordinates.should("be.visible");

    // Verify battery and signal for dispatch readiness
    Page.batteryLevel.should("be.visible");
    Page.signalStrength.should("be.visible");
  });
});
