// cypress/e2e/gas-scenarios/o2-monitoring.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe("O2 2-minute monitoring", () => {
  beforeEach(() => {
    cy.clock();
    Page.visit();
    cy.window({ timeout: 20000 }).should((win) => {
      expect(typeof win.loadAlert).to.eq("function");
    });
  });

  afterEach(() => cy.clock().then((c) => c.restore()));

  it("O2 depletion → monitoring runs full 2 min; levels normalize at ~60s; auto-resolves WITHOUT dispatch", () => {
    Page.loadAlertById("o2-depletion-resolves");

    // Monitoring timer starts; cancel dropdown absent or disabled
    Page.globalTimer.should("be.visible");
    Page.timerDisplay.should("not.contain", "--:--");
    cy.get("body").then(($b) => {
      const $dd = $b.find('[data-cy="global-cancel-dropdown"]');
      if ($dd.length) cy.wrap($dd).should("be.disabled");
    });

    // ~60s: O2 normalizes, but monitoring MUST keep running
    cy.tick(60_000);
    cy.get('#o2-reading .gas-value, [data-cy="o2-value"]')
      .filter(":visible")
      .first()
      .should("contain", "20.9");
    cy.get('#o2-reading .gas-status, [data-cy="o2-status"]')
      .filter(":visible")
      .first()
      .should("contain", "NORMAL");

    // Still running (not stopped yet)
    Page.timerDisplay.should("not.contain", "--:--");
    cy.get('[data-cy="timer-info"]').should(($el) => {
      expect(/No active timer/i.test($el.text())).to.eq(false);
    });

    // Finish the monitoring window (total = 120s)
    cy.tick(60_000);

    // Now the timer should stop (label OR --:--)
    cy.get('[data-cy="timer-info"]').should(($info) => {
      const disp = Cypress.$('[data-cy="timer-display"]').text();
      const stopped = /No active timer/i.test($info.text()) || /--:--/.test(disp);
      expect(stopped, "timer stopped after full 2 min").to.be.true;
    });

    // Some builds still require clicking Resolve (should be WITHOUT dispatch)
    cy.get("body").then(($b) => {
      if ($b.find('[data-cy="resolve-alert-btn"]').length) {
        const $reason = $b.find('[data-cy="resolution-reason"]');
        if ($reason.length) {
          const v = String($reason.val() || "");
          expect(/without[-\s]?dispatch/i.test(v)).to.eq(true);
        }
        Page.resolveAlert();
      }
    });

    // O2-only context and resolution present (robust to O₂ vs O2 and 'Corporate')
    Page.protocolLog.should("contain.text", "Alert resolved");
    Page.protocolLog.invoke("text").then((raw) => {
      // normalize Unicode subscript ₂ to plain 2
      const txt = raw.replace(/\u2082/g, "2");

      const hasO2   = /(?:\bO\s*2\b|Oxygen)/i.test(txt);
      const hasH2S  = /\bH\s*2S\b/i.test(txt);
      // Only treat 'CO' as the gas token (avoid 'Co' in 'Corporate')
      const hasCO   = /(?:\bCO\b(?=\s|:|$)|Carbon Monoxide)/i.test(txt);
      const hasLEL  = /\bLEL\b/i.test(txt);

      expect(hasO2,  "log mentions O2 (or Oxygen)").to.be.true;
      expect(hasH2S, "log should not mention H2S").to.be.false;
      expect(hasCO,  "log should not mention CO gas").to.be.false;
      expect(hasLEL, "log should not mention LEL").to.be.false;
    });
  });

  it("O2 enrichment → 2-min monitoring ends → Step 1 (Message) expires → Step 2 user CONFIRMS → resolve (override if shown)", () => {
    Page.loadAlertById("o2-enrichment-escalates");

    // Monitoring runs 2 minutes then escalates
    Page.timerDisplay.should("not.contain", "--:--");
    cy.tick(120_000);

    // Step 1: message device (no outcome select) → its 2-min timer expires
    Page.startStep(1);
    Page.globalTimer.should("be.visible");
    Page.timerDisplay.should("not.contain", "--:--");
    cy.tick(120_000);
    Page.timerInfo.should(($el) => expect(/No active timer/i.test($el.text())).to.be.true);

    // Step 2: user confirms ok (value may be 'confirmed-ok' or 'confirmed-okay')
    Page.startStep(2);
    cy.get('[data-cy="step-2-select"]').first().then(($sel) => {
      const vals = Array.from($sel[0].options).map((o) => o.value);
      const pick = vals.includes("confirmed-ok") ? "confirmed-ok" : "confirmed-okay";
      cy.wrap($sel).select(pick, { force: true });
    });
    cy.get('[data-cy="step-2-note"]').first().clear().type("User confirmed they are okay", { delay: 0, force: true });
    cy.get('[data-cy="step-2-post-btn"]').first().click({ force: true });

    // Resolve (if gas still HIGH, override modal will appear — choose a 'confirmed okay' reason)
    Page.resolveAlert();
    cy.get("body").then(($b) => {
      const $modal = $b.find('[data-cy="override-modal"]');
      if ($modal.length) {
        cy.wrap($modal).should("be.visible");
        cy.wrap($modal).find('[data-cy="override-reason"] option').then(($opts) => {
          let val = "";
          $opts.each((_, o) => {
            const t = (o.textContent || "").toLowerCase();
            if (t.includes("confirmed") && t.includes("okay")) val = o.value;
          });
          if (!val && $opts.length) val = $opts[0].value;
          cy.wrap($modal).find('[data-cy="override-reason"]').select(val, { force: true });
        });
        // Page.confirmOverrideButton should point to [data-cy="confirm-override"]
        Page.confirmOverrideButton.click({ force: true });
      }
    });

    Page.protocolLog.should("contain.text", "Alert resolved");
  });

  it("O2 enrichment → Step 1 expires → Step 2 user FAILS → Step 3 EC FAILS → DISPATCH → cancel follow-up → resolve WITH override", () => {
    Page.loadAlertById("o2-enrichment-escalates");

    // Escalate from monitoring
    Page.timerDisplay.should("not.contain", "--:--");
    cy.tick(120_000);

    // Step 1 message → let it expire
    Page.startStep(1);
    Page.timerDisplay.should("not.contain", "--:--");
    cy.tick(120_000);
    Page.timerInfo.should(($el) => expect(/No active timer/i.test($el.text())).to.be.true);

    // Step 2: user fails (no-answer or no-answer-voicemail)
    Page.startStep(2);
    cy.get('[data-cy="step-2-select"]').first().then(($sel) => {
      const vals = Array.from($sel[0].options).map((o) => o.value);
      const pick = vals.includes("no-answer-voicemail") ? "no-answer-voicemail" : "no-answer";
      cy.wrap($sel).select(pick, { force: true });
    });
    cy.get('[data-cy="step-2-note"]').first().clear().type("User: no answer", { delay: 0, force: true });
    cy.get('[data-cy="step-2-post-btn"]').first().click({ force: true });

    // Step 3-1: EC fails
    Page.startStep("3-1");
    cy.get('[data-cy="step-3-1-select"]').first().then(($sel) => {
      const vals = Array.from($sel[0].options).map((o) => o.value);
      const pick = vals.includes("no-answer-voicemail") ? "no-answer-voicemail" : "no-answer";
      cy.wrap($sel).select(pick, { force: true });
    });
    cy.get('[data-cy="step-3-1-note"]').first().clear().type("EC1: no answer", { delay: 0, force: true });
    cy.get('[data-cy="step-3-1-post-btn"]').first().click({ force: true });

    // Step 4: Dispatch → start follow-up timer
    Page.startStep(4);
    cy.get('[data-cy="dispatch-decision"]', { timeout: 20000 }).should("be.visible");
    Page.dispatchDecision.select("yes", { force: true });
    Page.serviceTypeSelect.select("Emergency Medical Services (EMS)", { force: true });
    cy.get('[data-cy="step-4-note"]').first().clear().type("Dispatched due to sustained O2 enrichment", { delay: 0, force: true });
    cy.get('[data-cy="step-4-post-btn"]').first().click({ force: true });
    Page.timerDisplay.should("not.contain", "--:--"); // dispatch follow-up running

    // Cancel dispatch follow-up → confirm timer stopped (label OR --:--)
    Page.cancelTimerDropdown.select("User called in and confirmed they are okay", { force: true });
    cy.get('[data-cy="timer-info"]').then(($info) => {
      cy.get('[data-cy="timer-display"]').then(($disp) => {
        const stopped = /No active timer/i.test($info.text()) || /--:--/.test($disp.text());
        expect(stopped, "timer stopped").to.be.true;
      });
    });

    // Resolve with override (gas still HIGH)
    Page.resolveAlert();
    cy.get('[data-cy="override-modal"]').should("be.visible");
    cy.get('[data-cy="override-reason"] option').then(($opts) => {
      let val = "";
      $opts.each((_, o) => {
        const t = (o.textContent || "").toLowerCase();
        if (t.includes("confirmed") && t.includes("okay")) val = o.value;
      });
      if (!val && $opts.length) val = $opts[0].value;
      cy.get('[data-cy="override-reason"]').select(val, { force: true });
    });
    // Page.confirmOverrideButton should point to [data-cy="confirm-override"]
    Page.confirmOverrideButton.click({ force: true });

    Page.protocolLog.should("contain.text", "Alert resolved");
  });
});
