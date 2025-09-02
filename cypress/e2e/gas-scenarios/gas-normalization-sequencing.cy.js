// cypress/e2e/gas-scenarios/gas-normalization-sequencing.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("Gas normalization sequencing", () => {
  beforeEach(() => {
    cy.clock();
    Page.visit();
    cy.window({ timeout: 20000 }).should((win) => {
      expect(typeof win.loadAlert).to.eq("function");
    });
  });

  afterEach(() => cy.clock().then((c) => c.restore()));

  it("HIGH gas → Step 1 posted → NORMAL after ~3s → Step 2 timer canceled as 'confirmed OK' → resolve WITHOUT dispatch", () => {
    Page.loadAlertById("co-spontaneous");

    // STEP 1 — Call device, outcome: No answer → Post
    Page.startStep(1);
    cy.get('[data-cy="step-1-select"]')
      .first()
      .select("no-answer", { force: true });
    cy.get('[data-cy="step-1-note"]')
      .first()
      .clear()
      .type("Called device. No answer.", { delay: 0, force: true });
    cy.get('[data-cy="step-1-post-btn"]').first().click({ force: true });

    // Normalization is step-driven, applied after a deferred update (~3s)
    cy.tick(3000);
    Page.validateGasIsNormal();

    // Assert NORMAL at the panel level (robust, gas-agnostic)
    Page.gasReadingsCard.should("contain.text", "NORMAL");

    // Assert the CO value specifically (tolerant selector)
    cy.get('[data-cy="co-reading"], [data-cy="co-value"]').should(
      "contain",
      "0.5"
    );

    // STEP 2 — Message device (starts timer), then cancel with 'User called in, confirmed okay'
    Page.startStep(2);
    Page.validateTimerActive();
    Page.cancelTimer("User called in and confirmed they are okay");
    Page.validateTimerInactive(); // checks "--:--"

    // Resolution defaults to WITHOUT dispatch when gas is NORMAL
    cy.get('[data-cy="resolution-reason"]').should(($sel) => {
      const v = String($sel.val() || "");
      expect(/without[-\s]?dispatch/i.test(v)).to.eq(true);
    });

    // Resolve and confirm core log pieces (match actual log output)
    Page.resolveAlert();
    Page.validateLogEntry("Step 1: Called device. No answer.");
    Page.validateLogEntry('Step 2: Sent "Do you need help?" to device.');
    Page.validateLogEntry("CO is no longer exceeding the high threshold");
    Page.validateLogEntry("Current: CO 0.50 ppm");
    Page.validateLogEntry(
      "User called in and confirmed they are okay. Resolving alert."
    );
    Page.validateLogEntry("Gas Level: NORMAL");
    Page.validateLogEntry("Alert resolved");
    Page.validateLogEntry("Op 417");
  });
});
