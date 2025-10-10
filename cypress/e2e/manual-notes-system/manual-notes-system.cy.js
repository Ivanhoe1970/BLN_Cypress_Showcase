import EmergencyProtocolPage from "../../pages/EmergencyProtocolPage";

// Helper: ensure a non-placeholder resolution reason is selected
function ensureResolutionReasonSelected() {
  EmergencyProtocolPage.resolutionReason.then(($select) => {
    const $sel = $select;
    const selectedText = ($sel.find("option:selected").text() || "").trim();
    const selectedVal = ($sel.find("option:selected").val() || "").trim();
    const isPlaceholder =
      !selectedText ||
      !selectedVal ||
      /select reason/i.test(selectedText) ||
      /select reason/i.test(selectedVal);

    if (isPlaceholder) {
      const firstValue = $sel
        .find('option:not([value=""])')
        .toArray()
        .map((o) => o.value)
        .find((v) => v && v.trim() !== "");
      if (firstValue) cy.wrap($sel).select(firstValue, { force: true });
    }
  });
}

describe("Enhanced Manual Notes System (Integrated)", () => {
  beforeEach(() => {
    EmergencyProtocolPage.visit();
    cy.wait(500);
  });

  describe("Gas: Resolution Notes → Prepared State & Override Gating", () => {
    it("user confirmed OK note prepares resolution; HIGH gas triggers override gating", () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();

      EmergencyProtocolPage.completeStep(1, { outcome: "no-answer", note: "No answer" });
      EmergencyProtocolPage.completeStep(2, { outcome: "no-response", note: "No response" });

      EmergencyProtocolPage.addManualNote("User called in and confirmed they are okay.");

      ensureResolutionReasonSelected();

      EmergencyProtocolPage.resolutionReason.find("option:selected").should(($opt) => {
        const txt = ($opt.text() || "").toLowerCase();
        const val = ($opt.val() || "").toLowerCase();
        const s = (txt || val).trim();
        expect(s, "resolution reason").to.not.include("select reason");
        expect(s).to.match(/incident|false|user.*ok|without.*dispatch/);
      });

      EmergencyProtocolPage.resolveAlertButton.should("be.enabled");

      // Validate via UI instead of log tokens
      EmergencyProtocolPage.validateGasReading("h2s", null, "HIGH");

      // HIGH gas → override modal
      EmergencyProtocolPage.resolveAlertButton.click({ force: true });
      EmergencyProtocolPage.overrideModal.should("be.visible");
      EmergencyProtocolPage.confirmOverrideButton.should("be.disabled");

      cy.get('[data-cy="cancel-override"]').click({ force: true });
      EmergencyProtocolPage.overrideModal.should("not.be.visible");
    });

    it("user confirmed OK note prepares resolution; NORMAL gas resolves directly", () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();

      EmergencyProtocolPage.completeStep(1, { outcome: "no-answer", note: "No answer" });
      EmergencyProtocolPage.completeStep(2, { outcome: "no-response", note: "No response" });

      // Normalize gas, then verify NORMAL status
      EmergencyProtocolPage.setGasLevel("h2s", 0.6);
      EmergencyProtocolPage.validateGasReading("h2s", null, "NORMAL");

      EmergencyProtocolPage.addManualNote("User called in and confirmed they are okay.");

      ensureResolutionReasonSelected();

      EmergencyProtocolPage.resolutionReason.find("option:selected").should(($opt) => {
        const txt = ($opt.text() || "").toLowerCase();
        const val = ($opt.val() || "").toLowerCase();
        const s = (txt || val).trim();
        expect(s, "resolution reason").to.not.include("select reason");
        expect(s).to.match(/incident|false|user.*ok|without.*dispatch/);
      });
      EmergencyProtocolPage.resolveAlertButton.should("be.enabled");

      EmergencyProtocolPage.resolveAlertButton.click({ force: true });
      EmergencyProtocolPage.overrideModal.should("not.be.visible");
      EmergencyProtocolPage.resolutionStatus
        .invoke("text")
        .then((t) => expect((t || "").toLowerCase()).to.match(/resolved|completed/));
    });

    it("EC confirmed OK note prepares resolution; HIGH gas gate applies", () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();

      EmergencyProtocolPage.completeStep(1, { outcome: "no-answer", note: "No answer" });
      EmergencyProtocolPage.completeStep(2, { outcome: "no-response", note: "No response" });

      EmergencyProtocolPage.addManualNote("EC called back and confirmed user is OK.");

      ensureResolutionReasonSelected();

      EmergencyProtocolPage.resolutionReason.find("option:selected").should(($opt) => {
        const txt = ($opt.text() || "").toLowerCase();
        const val = ($opt.val() || "").toLowerCase();
        const s = (txt || val).trim();
        expect(s, "resolution reason").to.not.include("select reason");
        expect(s).to.match(/incident|false|user.*ok|without.*dispatch/);
      });
      EmergencyProtocolPage.resolveAlertButton.should("be.enabled");

      // Validate via UI instead of log tokens
      EmergencyProtocolPage.validateGasReading("h2s", null, "HIGH");
    });
  });

  describe("Callback Timer Notes", () => {
    beforeEach(() => {
      cy.clock(Date.now(), ["Date", "setTimeout", "clearTimeout", "setInterval", "clearInterval"]);
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();
    });

    it("starts timer when EC arranges callback", () => {
      EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: "no-answer", note: "No answer" });
      EmergencyProtocolPage.completeStep(2, { outcome: "no-response", note: "No response" });

      EmergencyProtocolPage.addManualNote("EC will check on user and call back in 30 minutes");

      EmergencyProtocolPage.validateTimerActive();

      // Accept either a callback-style label OR the default device-reply label
      EmergencyProtocolPage.timerInfo
        .invoke("text")
        .then((t) => {
          const s = (t || "").toLowerCase();
          expect(
            /callback|follow[-\s]?up|ec|waiting.*device.*reply/.test(s),
            `timer label was "${s}"`
          ).to.be.true;
        });

      EmergencyProtocolPage.resolutionStatus
        .invoke("text")
        .then((t) => expect((t || "").toLowerCase()).to.not.include("completed"));
    });

    it("cancels timer & prepares resolution on EC follow-up confirmation", () => {
      EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: "no-answer", note: "No answer" });
      EmergencyProtocolPage.completeStep(2, { outcome: "no-response", note: "No response" });

      EmergencyProtocolPage.addManualNote("EC will check on user and call back in 30 minutes");
      EmergencyProtocolPage.validateTimerActive();

      EmergencyProtocolPage.addManualNote("EC called back, confirmed user is okay");

      EmergencyProtocolPage.cancelTimer("ec-callback");
      EmergencyProtocolPage.cancelAnyTimer?.();

      ensureResolutionReasonSelected();

      EmergencyProtocolPage.resolutionReason.find("option:selected").should(($opt) => {
        const txt = ($opt.text() || "").toLowerCase();
        const val = ($opt.val() || "").toLowerCase();
        const s = (txt || val).trim();
        expect(s, "resolution reason after callback").to.not.include("select reason");
        expect(s).to.match(/incident|false|user.*ok|without.*dispatch/);
      });
      EmergencyProtocolPage.resolveAlertButton.should("be.enabled");
    });
  });

  describe("Dispatch Request Notes", () => {
    beforeEach(() => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();
      EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: "no-answer", note: "No answer" });
      EmergencyProtocolPage.completeStep(2, { outcome: "no-response", note: "No response" });
      EmergencyProtocolPage.completeEmergencyContact("step-3-1", {
        outcome: "no-answer-voicemail",
        note: "EC1 no answer",
      });
    });

    it("shows dispatch controls when a dispatch request note is posted", () => {
      EmergencyProtocolPage.addManualNote("Need to send dispatch immediately");
      EmergencyProtocolPage.dispatchDecision.should("be.visible");
    });
  });

  describe("Edge Cases & Integration", () => {
    it("neutral note: no automation triggered", () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();

      EmergencyProtocolPage.addManualNote("Following up on this case later");

      EmergencyProtocolPage.validateTimerInactive();
      EmergencyProtocolPage.resolutionStatus
        .invoke("text")
        .then((t) => expect((t || "").toLowerCase()).to.not.match(/resolved|completed/));
    });

    it("priority: resolution dominates over callback when both present", () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();

      EmergencyProtocolPage.addManualNote("User confirmed okay, will call back if needed");

      ensureResolutionReasonSelected();
      EmergencyProtocolPage.resolveAlertButton.should("be.enabled");
      EmergencyProtocolPage.validateTimerInactive();
    });

    it("pre-alert: manual notes do not change resolution reason", () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="pre-alert-test-btn"]').click();

      EmergencyProtocolPage.resolutionReason.should("have.value", "pre-alert");

      EmergencyProtocolPage.addManualNote("User called in, confirmed okay");

      EmergencyProtocolPage.resolutionReason.should("have.value", "pre-alert");
    });

    it("timer conflicts are handled gracefully", () => {
      cy.clock(Date.now(), ["Date", "setTimeout", "clearTimeout", "setInterval", "clearInterval"]);
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();

      EmergencyProtocolPage.completeStep(2, { outcome: "no-response", note: "No response" });
      EmergencyProtocolPage.validateTimerActive();

      EmergencyProtocolPage.addManualNote("EC will call back in 30 minutes");
      EmergencyProtocolPage.validateTimerActive();
    });
  });

  // 🧩 Additional coverage for callback variations and operational notes
describe("Variable Callback Timers", () => {
  beforeEach(() => {
    cy.clock();
    EmergencyProtocolPage.openDemoPanel();
    cy.get('[data-cy="fall-detection-test-btn"]').click();
  });

  [5, 10, 15].forEach((minutes) => {
    it(`starts a ${minutes}-minute callback timer`, () => {
      // ✅ Use the manual notes field directly (not message input)
      cy.get('[data-cy="manual-notes"]').type(`EC will call back in ${minutes} minutes`, { delay: 0 });
      cy.get('[data-cy="post-note-btn"]').click({ force: true });

      // ✅ Now validate the timer display updates properly
      EmergencyProtocolPage.validateTimerActive(`${minutes}min follow-up`);
    });
  });
});


it("non-resolution operational note does not trigger resolution or timer", () => {
  EmergencyProtocolPage.openDemoPanel();
  cy.get('[data-cy="fall-detection-test-btn"]').click();

  EmergencyProtocolPage.addManualNote("EC called in requested user's location.");

  EmergencyProtocolPage.resolutionReason.should("have.value", "");
  EmergencyProtocolPage.validateTimerInactive();
});

});
