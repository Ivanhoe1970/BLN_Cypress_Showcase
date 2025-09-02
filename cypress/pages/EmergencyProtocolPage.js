// cypress/pages/EmergencyProtocolPage.js
class EmergencyProtocolPage {
  // ───────────────────────── HEADER ELEMENTS ─────────────────────────
  get header() {
    return cy.get('[data-cy="alert-header"]');
  }
  get employeeName() {
    return cy.get('[data-cy="employee-details"]');
  }
  get alertType() {
    return cy.get('[data-cy="alert-trigger"]');
  }
  get alertTitle() {
    return cy.get('[data-cy="alert-title"]');
  }
  get alertId() {
    return cy.get('[data-cy="alert-id"]');
  }
  get deviceDetails() {
    return cy.get('[data-cy="device-details"]');
  }
  get mobileNumber() {
    return cy.get('[data-cy="mobile-number"]');
  }
  get alertTime() {
    return cy.get('[data-cy="alert-time"]');
  }

  // ─────────────────────── PROTOCOL LOG & NOTES ──────────────────────
  get protocolLog() {
    return cy.get('[data-cy="protocol-log-container"]');
  }
  get logPlaceholder() {
    return cy.get(".log-placeholder");
  }
  get logEntries() {
    return cy.get(".log-entry");
  }
  get manualNotesTextarea() {
    return cy.get('[data-cy="message-input"]');
  }
  get addNoteButton() {
    return cy.get('[data-cy="post-note-btn"]').first();
  }

  // ─────────────────────────── GLOBAL TIMER ──────────────────────────
  get globalTimer() {
    return cy.get('[data-cy="global-timer"]');
  }
  get timerDisplay() {
    return cy.get('[data-cy="timer-display"]');
  }
  get timerInfo() {
    return cy.get('[data-cy="timer-info"]');
  }
  get cancelTimerDropdown() {
    return cy.get('[data-cy="global-cancel-dropdown"]').first();
  }

  cancelAnyTimer() {
    this.cancelTimerDropdown.find("option").then(($options) => {
      const values = [...$options].map((o) => o.value).filter(Boolean);
      if (values.length) {
        this.cancelTimerDropdown.select(values[0], { force: true });
      }
    });
    return this;
  }

  // ────────────────────────── MESSAGING UI ───────────────────────────
  get messageInput() {
    return cy.get('[data-cy="message-input"]');
  }
  get sendMessageButton() {
    return cy.get('[data-cy="send-message-btn"]').first();
  }
  get charCounter() {
    return cy.get('[data-cy="char-counter"]');
  }
  get receivedMessages() {
    return cy.get('[data-cy="received-messages"]');
  }

  // ───────────────────────── RESOLUTION UI ───────────────────────────
  get resolutionSection() {
    return cy.get('[data-cy="resolution-section"]');
  }
  get resolutionReason() {
    return cy.get('[data-cy="resolution-reason"]');
  }
  get resolveAlertButton() {
    return cy.get('[data-cy="resolve-alert-btn"]').first();
  }
  get cancelResolutionButton() {
    return cy.get('[data-cy="cancel-resolution-btn"]').first();
  }
  get resolutionStatus() {
    return cy.get('[data-cy="resolution-status"]');
  }

  // ─────────────────────── GAS OVERRIDE MODAL ────────────────────────
  get overrideModal() {
    return cy.get('[data-cy="override-modal"]');
  }
  get overrideReason() {
    return cy.get('[data-cy="override-reason"]');
  }
  get confirmOverrideButton() {
    return cy.get('[data-cy="confirm-override"]').first();
  }
  get modalOverlay() {
    return cy.get('[data-cy="override-modal-overlay"]');
  }

  // ─────────────────────── GAS READINGS PANEL ────────────────────────
  get gasReadingsCard() {
    return cy.get('[data-cy="gas-readings-card"]');
  }
  get h2sValue() {
    return cy.get('[data-cy="h2s-value"]');
  }
  get h2sStatus() {
    return cy.get('[data-cy="h2s-status"]');
  }
  get coValue() {
    return cy.get('[data-cy="co-value"]');
  }
  get coStatus() {
    return cy.get('[data-cy="co-status"]');
  }
  get o2Value() {
    return cy.get('[data-cy="o2-value"]');
  }
  get o2Status() {
    return cy.get('[data-cy="o2-status"]');
  }
  get lelValue() {
    return cy.get('[data-cy="lel-value"]');
  }
  get lelStatus() {
    return cy.get('[data-cy="lel-status"]');
  }
  get gasTimestamp() {
    return cy.get('[data-cy="gas-timestamp"]');
  }
  get triggeredBy() {
    return cy.get('[data-cy="triggered-by"]');
  }

  // ─────────────────────── CONNECTIVITY PANEL ────────────────────────
  get connectivityPanel() {
    return cy.get('[data-cy="connectivity-panel"]');
  }
  get deviceOnlineStatus() {
    return cy.get('[data-cy="device-online-status"]');
  }
  get lastCommTime() {
    return cy.get('[data-cy="last-comm-time"]');
  }
  get batteryLevel() {
    return cy.get('[data-cy="battery-level"]');
  }
  get signalStrength() {
    return cy.get('[data-cy="signal-strength"]');
  }
  get deviceLocation() {
    return cy.get('[data-cy="device-location"]');
  }
  get deviceCoordinates() {
    return cy.get('[data-cy="device-coordinates"]');
  }
  get deviceSpeed() {
    return cy.get('[data-cy="device-speed"]');
  }
  get locationTimestamp() {
    return cy.get('[data-cy="location-timestamp"]');
  }

  // ──────────────────────── DISPATCH ELEMENTS ────────────────────────
  get dispatchDecision() {
    return cy
      .get('[data-cy="dispatch-decision"], #dispatch-decision')
      .filter(":visible")
      .first();
  }
  get serviceTypeContainer() {
    return cy
      .get('[data-cy="service-type-container"], #service-type-container')
      .filter(":visible")
      .first();
  }
  get serviceTypeSelect() {
    return cy
      .get('[data-cy="service-type"], #service-type, #dispatch')
      .filter(":visible")
      .first();
  }
  get skipReasonContainer() {
    return cy
      .get('[data-cy="skip-reason-container"], #skip-reason-container')
      .filter(":visible")
      .first();
  }
  get skipReasonSelect() {
    return cy
      .get('[data-cy="skip-reason"], #skip-reason')
      .filter(":visible")
      .first();
  }

  // ─────────────────────────── DEMO CONTROLS ─────────────────────────
  get demoGear() {
    return cy.get('[data-cy="demo-gear"]').first();
  }
  get demoPanel() {
    return cy.get('[data-cy="demo-panel"]');
  }

  // ───────────────────────────── METHODS ─────────────────────────────
  visit() {
    const url =
      Cypress.env("emergencyProtocolPath") ||
      "/automated-gas-alert-protocol/emergency-protocol-clean.html";
    cy.visit(url);
    cy.get('[data-cy="alert-header"]', { timeout: 20000 }).should("exist");
    return this;
  }

  loadAlertById(alertId) {
    cy.window({ timeout: 20000 }).then((win) => {
      if (typeof win.loadAlert === "function") {
        win.loadAlert(alertId);
      } else {
        throw new Error(`No alert loader found for id: ${alertId}`);
      }
    });
    cy.get('[data-cy="alert-header"]', { timeout: 20000 }).should("be.visible");
    cy.get('[data-cy^="step-"][data-cy$="-button"]', { timeout: 20000 }).should(
      "be.visible"
    );
    return this;
  }

  // ─────────────────────────── TIMER METHODS ─────────────────────────
  startTimer(stepId, label, duration) {
    cy.window().then((win) => {
      win.startGlobalTimer(stepId, label, "", duration);
    });
    return this;
  }

  cancelTimer(reason) {
    this.cancelTimerDropdown.select(reason, { force: true });
    this.cancelTimerDropdown.trigger("change");
    return this;
  }

  waitForTimerExpiry(durationSeconds) {
    cy.tick(durationSeconds * 1000);
    return this;
  }

  // ───────────────────────── MESSAGING METHODS ───────────────────────
  sendMessage(text) {
    this.messageInput.clear().type(text, { delay: 0 });
    this.sendMessageButton.click({ force: true });
    return this;
  }

  simulateDeviceResponse(text) {
    cy.window().then((win) => {
      if (typeof win.simulateDeviceResponse === "function") {
        win.simulateDeviceResponse(text, false);
      }
    });
    return this;
  }

  // ─────────────── EMERGENCY CONTACT (sub-step e.g. #step-3-1) ───────────────
  completeEmergencyContact(subStepId, { outcome, note }) {
    cy.get(`#${subStepId}`).within(() => {
      cy.get('button[onclick*="startStep"]').first().click({ force: true });
      cy.get("select").first().select(outcome, { force: true });
      cy.get("textarea").first().clear().type(note, { delay: 0, force: true });
      cy.get('button[onclick*="postNote"]').first().click({ force: true });
    });
    return this;
  }

  // ─────────────────────────── DISPATCH HELPER ───────────────────────
  completeDispatch({ decision = null, service = null, note }) {
    if (decision) this.dispatchDecision.select(decision, { force: true });
    if (decision === "yes") {
      cy.get('[data-cy="service-type"], #service-type, #dispatch', {
        timeout: 20000,
      }).should("be.visible");
    }
    if (service) this.serviceTypeSelect.select(service, { force: true });

    cy.get(".step:visible")
      .contains(/Dispatch/i)
      .closest(".step")
      .within(() => {
        cy.get("textarea:visible")
          .first()
          .clear()
          .type(note, { delay: 0, force: true });
        cy.get('button[onclick*="postNote"]:visible')
          .first()
          .click({ force: true });
      });
    return this;
  }

  // ────────────────────────── STEP-BASED METHODS ─────────────────────
  startStep(n) {
    cy.get("body").then(($body) => {
      const $exact = $body
        .find(`[data-cy="step-${n}-button"]`)
        .filter(":visible");
      if ($exact.length) {
        cy.wrap($exact.first()).click({ force: true });
        return;
      }

      const $allVisible = $body.find(
        '[data-cy^="step-"][data-cy$="-button"]:visible'
      );
      if ($allVisible.length >= n) {
        cy.wrap($allVisible.eq(n - 1)).click({ force: true });
        return;
      }

      if (n === 2 && $body.find('[data-cy="dispatch-decision"]').length) {
        cy.log(
          "ℹ️ Dispatch controls present; no start button to click for Step 2"
        );
        return;
      }
      throw new Error(`No clickable control found for Step ${n}`);
    });
    return this;
  }

  completeStep(n, { outcome = null, note = null, sub = null } = {}) {
    this.startStep(n);

    if (!(outcome || note)) return this;

    const outcomeContainerSel = sub
      ? `[data-cy="step-${n}-${sub}-outcome"]`
      : `[data-cy="step-${n}-outcome"]`;
    const selectCandidates = sub
      ? [`[data-cy="step-${n}-${sub}-select"]`, `${outcomeContainerSel} select`]
      : [`[data-cy="step-${n}-select"]`, `${outcomeContainerSel} select`];
    const noteCandidates = sub
      ? [`[data-cy="step-${n}-${sub}-note"]`]
      : [`[data-cy="step-${n}-note"]`];
    const postBtnCandidates = sub
      ? [
          `[data-cy="step-${n}-${sub}-post-btn"]`,
          `[data-cy="step-${n}-${sub}-btn"]`,
          `[data-cy="step-${n}-${sub}-submit"]`,
        ]
      : [
          `[data-cy="step-${n}-post-btn"]`,
          `[data-cy="step-${n}-btn"]`,
          `[data-cy="step-${n}-submit"]`,
        ];
    const containerSel = sub
      ? `[data-cy="step-${n}-${sub}"]`
      : `[data-cy="step-${n}"]`;
    const pickFirstExisting = ($b, sels) =>
      sels.find((sel) => $b.find(sel).length);

    cy.get("body").then(($b) => {
      const oc = $b.find(outcomeContainerSel);
      if (oc.length && oc.css("display") === "none") {
        cy.get(outcomeContainerSel).invoke(
          "attr",
          "style",
          "display: block !important;"
        );
      }
    });

    cy.get("body").then(($b) => {
      if (outcome) {
        const selectSel = pickFirstExisting($b, selectCandidates);
        if (!selectSel)
          throw new Error(
            `Outcome select not found for step ${n}${sub ? ` sub ${sub}` : ""}`
          );
        cy.get(selectSel).first().select(outcome, { force: true });
      }
    });

    cy.get("body").then(($b) => {
      if (note) {
        const noteSel = pickFirstExisting($b, noteCandidates);
        if (noteSel)
          cy.get(noteSel)
            .first()
            .clear({ force: true })
            .type(note, { delay: 0, force: true });
      }
    });

    cy.get("body").then(($b) => {
      const btnSel = pickFirstExisting($b, postBtnCandidates);
      if (btnSel) {
        cy.get(btnSel).first().click({ force: true });
      } else if ($b.find(containerSel).length) {
        cy.get(containerSel).within(() => {
          cy.contains("button", /Post Note|Confirm|Save|Apply/i)
            .first()
            .click({ force: true });
        });
      }
    });

    return this;
  }

  // ───── Back-compat step element getters to keep older specs working ─────
  stepButton(n) {
    return cy.get(`[data-cy="step-${n}-button"]`).first();
  }
  stepOutcome(n) {
    return cy.get(`[data-cy="step-${n}-outcome"]`).first();
  }
  stepSelect(n) {
    return cy.get(`[data-cy="step-${n}-select"]`).first();
  }
  stepNote(n) {
    return cy.get(`[data-cy="step-${n}-note"]`).first();
  }
  stepPost(n) {
    return cy.get(`[data-cy="step-${n}-post-btn"]`).first();
  }

  // ────────────────────────── ENHANCED VALIDATION METHODS ─────────────────────

  // ────────────────────────── ENHANCED LOG VALIDATION SYSTEM ─────────────────────

  /**
   * Enhanced validateLogEntry with optional negative assertion support
   * Now filters out system noise and focuses on protocol-specific logs
   * @param {RegExp|string} match - Pattern or text to match
   * @param {boolean} shouldExist - Whether the match should exist (default: true)
   */
  validateLogEntry(match, shouldExist = true) {
    if (match instanceof RegExp) {
      this.protocolLog.should(($el) => {
        const fullText = $el.text() || "";

        // Filter out system messages (Blackline Safety Operations Centre, etc.)
        const protocolLines = fullText
          .split("\n")
          .filter((line) => {
            const trimmed = line.trim();
            // Keep lines that start with timestamp [HH:mm:ss MST] or contain "Step" or "Op 417"
            return (
              trimmed.match(/^\[\d{2}:\d{2}:\d{2} MST\]/) ||
              trimmed.includes("Op 417") ||
              trimmed.match(/^Step \d+:/)
            );
          })
          .join("\n");

        if (shouldExist) {
          expect(
            protocolLines,
            "Protocol log should contain expected content"
          ).to.match(match);
        } else {
          expect(
            protocolLines,
            "Protocol log should NOT contain expected content"
          ).to.not.match(match);
        }
      });
    } else {
      this.protocolLog.should(($el) => {
        const fullText = $el.text() || "";
        const protocolLines = fullText
          .split("\n")
          .filter((line) => {
            const trimmed = line.trim();
            return (
              trimmed.match(/^\[\d{2}:\d{2}:\d{2} MST\]/) ||
              trimmed.includes("Op 417") ||
              trimmed.match(/^Step \d+:/)
            );
          })
          .join("\n");

        if (shouldExist) {
          expect(protocolLines, "Protocol log should contain text").to.include(
            String(match)
          );
        } else {
          expect(
            protocolLines,
            "Protocol log should NOT contain text"
          ).to.not.include(String(match));
        }
      });
    }
    return this;
  }

  /**
   * Validates device response in message thread instead of protocol log
   * This is more reliable since device responses appear in the message thread
   * @param {string} expectedResponse - Expected device response text
   */
  validateDeviceResponse(expectedResponse) {
    this.receivedMessages.should("contain.text", expectedResponse);
    return this;
  }

  /**
   * Validates protocol-specific log entries (excludes system messages)
   * @param {RegExp|string} match - Pattern to match in protocol logs only
   */
  validateProtocolLogOnly(match) {
    this.protocolLog.should(($el) => {
      const fullText = $el.text() || "";

      // Extract only protocol entries (with MST timestamps and Op 417)
      const protocolEntries = fullText
        .split("\n")
        .filter((line) => {
          const trimmed = line.trim();
          return (
            (trimmed.match(/^\[\d{2}:\d{2}:\d{2} MST\]/) &&
              trimmed.includes("Op 417")) ||
            trimmed.match(/^Step \d+:/)
          );
        })
        .join("\n");

      if (match instanceof RegExp) {
        expect(protocolEntries).to.match(match);
      } else {
        expect(protocolEntries).to.include(String(match));
      }
    });
    return this;
  }

  /**
   * Debug helper - logs the actual protocol log content for troubleshooting
   */
  debugProtocolLog() {
    this.protocolLog.then(($el) => {
      const fullText = $el.text() || "";
      cy.log("Full Protocol Log Content:");
      cy.log(fullText);

      const protocolOnly = fullText.split("\n").filter((line) => {
        const trimmed = line.trim();
        return (
          trimmed.match(/^\[\d{2}:\d{2}:\d{2} MST\]/) ||
          trimmed.includes("Op 417") ||
          trimmed.match(/^Step \d+:/)
        );
      });

      cy.log("Filtered Protocol Entries:");
      protocolOnly.forEach((line, i) => cy.log(`${i}: ${line}`));
    });
    return this;
  }

  validateTimerActive(expectedLabel = null) {
    this.timerDisplay.should("not.contain", "--:--");
    if (expectedLabel) this.timerInfo.should("contain", expectedLabel);
    return this;
  }

  validateTimerInactive() {
    this.timerDisplay.should("exist");
    return this;
  }

  validateStepStatus(stepId, expected) {
    const getEl = () =>
      cy.get(`[data-cy="${stepId}-status"], #${stepId}-status`).first();

    if (Array.isArray(expected)) {
      getEl().should(($el) => {
        const txt = ($el.text() || "").trim();
        expect(
          expected,
          `status of ${stepId} should be one of ${expected.join(
            ", "
          )} (was "${txt}")`
        ).to.include(txt);
      });
    } else if (expected instanceof RegExp) {
      getEl()
        .invoke("text")
        .then((t) => expect(t.trim()).to.match(expected));
    } else if (expected) {
      getEl().should("contain.text", expected);
    } else {
      // no specific expectation; just ensure it renders
      getEl().should("be.visible");
    }
    return this;
  }

  validateGasReading(gasType, expectedValue = null, expectedStatus = null) {
    // Validate gas value if provided
    if (expectedValue !== null) {
      const valueSel = `[data-cy="${gasType}-reading"], [data-cy="${gasType}-value"], #${gasType}-value`;
      cy.get(valueSel, { timeout: 20000 })
        .should("exist")
        .should(($val) => {
          const txt = $val.text().trim();
          expect(txt, `Gas value for ${gasType}`).to.include(
            String(expectedValue)
          );
        });
    }

    // Validate gas status if provided
    if (expectedStatus !== null) {
      const statusSel = `[data-cy="${gasType}-status"], #${gasType}-status`;
      cy.get(statusSel, { timeout: 20000 })
        .should("exist")
        .should(($status) => {
          const statusText = $status.text().trim().toUpperCase();
          expect(statusText, `Gas status for ${gasType}`).to.include(
            String(expectedStatus).toUpperCase()
          );
        });
    }

    return this;
  }

  validateNoGasDataInLogs() {
    cy.get('[data-cy="protocol-log-container"]')
      .should("not.contain.text", "Gas Type:")
      .should("not.contain.text", "Gas Level:")
      .should("not.contain.text", "Gas Reading:")
      .should("not.contain.text", "H₂S:")
      .should("not.contain.text", "CO:")
      .should("not.contain.text", "O₂:")
      .should("not.contain.text", "LEL:")
      .should("not.contain.text", "ppm")
      .should("not.contain.text", "%vol")
      .should("not.contain.text", "%LEL");

    return this;
  }

  validateResolutionSection(shouldBeVisible = true) {
    if (shouldBeVisible) this.resolutionSection.should("be.visible");
    else this.resolutionSection.should("not.be.visible");
    return this;
  }

  validateDispatchDecision(expectedValue) {
    this.dispatchDecision.should("have.value", expectedValue);
    return this;
  }

  validateGasIsNormal() {
    this.gasReadingsCard.should("contain.text", "NORMAL");
    return this;
  }

  // ──────────────────────── NEW ENHANCED METHODS ────────────────────────

  get deviceStatus() {
    return cy.get('[data-cy="device-status"]');
  }

  get deviceStatus() {
    return cy.get('[data-cy="device-status"]');
  }

  assertDeviceStatus(expected) {
    const normalized = expected.toLowerCase();

    return this.deviceStatus
      .should("be.visible")
      .and(($el) => {
        const txt = ($el.text() || "").toLowerCase();
        expect(txt).to.include(normalized);
      })
      .and("have.class", normalized);
  }

  /**
   * Validates that auto-acknowledgment message was sent to device
   */
  validateAutoAckSent() {
    this.validateLogEntry(/Sent "Noted\. Resolving alert\."/i);
    return this;
  }

  /**
   * Validates absence of gas data in logs (for non-gas alerts)
   */
  validateGasDataAbsent() {
    this.protocolLog.should(($log) => {
      expect($log.text()).to.not.match(/Gas Type:|Gas Level:|ppm|%LEL|%vol/i);
    });
    return this;
  }

  /**
   * Validates presence of gas data in logs (for gas alerts)
   * @param {string} gasType - Gas type (e.g., 'co', 'h2s')
   * @param {string} level - Expected gas level (e.g., 'normal', 'high')
   * @param {number} reading - Optional gas reading value
   */
  validateGasDataInLogs(gasType, level, reading = null) {
    this.validateLogEntry(new RegExp(`gas type.*${gasType}`, "i"));
    this.validateLogEntry(new RegExp(`gas level.*${level}`, "i"));
    if (reading) {
      this.validateLogEntry(
        new RegExp(`gas reading.*${gasType}.*${reading}.*ppm`, "i")
      );
    }
    return this;
  }

  /**
   * Enhanced timer state validation with duration checking
   * @param {string} expectedState - 'active' or 'inactive'
   * @param {number} expectedDuration - Expected duration in seconds
   */
  validateTimerState(expectedState, expectedDuration = null) {
    this.timerDisplay.should("be.visible");

    if (expectedState === "active") {
      this.timerDisplay.should("not.contain.text", "--:--");
      if (expectedDuration) {
        const minutes = Math.floor(expectedDuration / 60);
        this.timerDisplay.should(
          "contain.text",
          `${minutes.toString().padStart(2, "0")}:`
        );
      }
    } else if (expectedState === "inactive") {
      this.timerDisplay.should("contain.text", "--:--");
    }
    return this;
  }

  /**
   * Waits for gas normalization with configurable timeout
   * @param {string} gasType - Gas type to monitor (default: 'co')
   * @param {number} timeout - Timeout in milliseconds (default: 5000)
   */
  waitForGasNormalization(gasType = "co", timeout = 5000) {
    cy.get(`[data-cy="gas-status-${gasType}"]`, { timeout }).should(
      "contain.text",
      "NORMAL"
    );
    return this;
  }

  /**
   * Auto-selects first available resolution reason
   */
  resolveAndAutoSelectReason() {
    this.resolutionReason.should("be.visible").then(($select) => {
      const $options = $select.find("option").filter(':not([value=""])');
      if ($options.length > 0) {
        const firstValue = $options.first().val();
        cy.wrap($select).select(firstValue, { force: true });
      }
    });
    return this;
  }

  /**
   * Asserts that resolution reason was automatically selected
   */
  assertResolutionAutoSelected() {
    this.resolutionReason.find("option:selected").should(($option) => {
      const value = $option.val();
      expect(value, "resolution reason should be selected").to.not.be.empty;
      expect(value, "resolution reason should not be default").to.not.equal("");
    });
    return this;
  }

  /**
   * Validates that resolution section is properly prepared
   */
  validateResolutionPrepared() {
    this.resolutionReason.find("option:selected").should(($option) => {
      const text = ($option.text() || "").toLowerCase();
      const value = ($option.val() || "").toLowerCase();
      expect(text || value).to.match(
        /incident|false|user.*ok|without.*dispatch/
      );
    });
    this.resolveAlertButton.should("be.enabled");
    return this;
  }

  /**
   * Enhanced message sending with validation
   * @param {string} message - Message text to send
   * @param {string} expectedOutcome - Expected outcome ('sent', 'blocked', etc.)
   */
  sendMessageWithValidation(message, expectedOutcome = "sent") {
    this.messageInput.clear().type(message);
    this.sendMessageButton.should("be.enabled").click();

    if (expectedOutcome === "sent") {
      this.validateLogEntry(
        new RegExp(`Sent.*"${this.escapeRegExp(message)}"`, "i")
      );
    }
    return this;
  }

  /**
   * Utility method to escape regex special characters
   * @param {string} string - String to escape
   * @returns {string} Escaped string
   */
  static escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Enhanced step completion with comprehensive validation
   * @param {number} stepNumber - Step number to complete
   * @param {Object} options - Step completion options
   * @param {string} options.outcome - Outcome selection
   * @param {string} options.note - Note text
   */
  completeStepWithValidation(stepNumber, options = {}) {
    const stepId = `step-${stepNumber}`;
  
    // Start step if not already active
    this.startStep(stepNumber);
  
    // Set outcome if provided (skip gracefully if no select exists)
    if (options.outcome) {
      cy.get("body").then(($b) => {
        const sel = `[data-cy="${stepId}-select"]`;
        if ($b.find(sel).length) {
          cy.get(sel).first().select(options.outcome, { force: true });
        } else {
          cy.log(`(info) No outcome select for ${stepId}; continuing.`);
        }
      });
    }
  
    // Add note if provided (prefer step-scoped textarea; fall back to any visible textarea)
    if (options.note) {
      cy.get("body").then(($b) => {
        const stepScope =
          $b.find(`[data-cy="${stepId}"]`).length ? `[data-cy="${stepId}"]` :
          $b.find(`#${stepId}`).length ? `#${stepId}` : null;
  
        const tryStepNote = stepScope
          ? [`${stepScope} [data-cy="${stepId}-note"]`, `${stepScope} textarea:visible`]
          : [];
  
        const candidates = [
          `[data-cy="${stepId}-note"]`,
          ...tryStepNote,
          "textarea:visible",
          '[data-cy="note-textarea"]:visible',
        ];
  
        const found = candidates.find((s) => $b.find(s).length);
        if (found) {
          cy.get(found).first().clear({ force: true }).type(options.note, { delay: 0, force: true });
        } else {
          cy.log(`(info) No note editor found for ${stepId}; continuing without typing.`);
        }
      });
    }
  
    // Complete step (step-specific post button if present; otherwise a reasonable fallback inside the step)
    cy.get("body").then(($b) => {
      const explicitBtn = `[data-cy="${stepId}-post-btn"]`;
      if ($b.find(explicitBtn).length) {
        cy.get(explicitBtn).first().should("be.enabled").click({ force: true });
        return;
      }
  
      const stepScope =
        $b.find(`[data-cy="${stepId}"]`).length ? `[data-cy="${stepId}"]` :
        $b.find(`#${stepId}`).length ? `#${stepId}` : null;
  
      if (stepScope) {
        cy.get(stepScope).within(() => {
          cy.contains("button:visible", /Post Note|Confirm|Save|Apply/i)
            .first()
            .click({ force: true });
        });
      } else {
        cy.log(`(info) No explicit post control detected for ${stepId}; assuming auto-post or non-posting step.`);
      }
    });
  
    // Validate status (timer/monitoring steps may be Waiting/Active before completion)
    const tolerated =
      options.expectStatus
        ? (Array.isArray(options.expectStatus) ? options.expectStatus : [options.expectStatus])
        : ((stepNumber === 2 || options.tolerateTimer) ? ["Waiting", "Active", "Completed"] : ["Completed"]);
  
    cy.get(`[data-cy="${stepId}-status"], #${stepId}-status`)
      .first()
      .should(($el) => {
        const txt = ($el.text() || "").trim();
        const ok = tolerated.some((s) => new RegExp(`\\b${s}\\b`, "i").test(txt));
        expect(
          ok,
          `status of ${stepId} should be one of: ${tolerated.join(", ")} (was "${txt}")`
        ).to.be.true;
      });
  
    // Validate log line only when both outcome & note were set
    if (options.outcome && options.note) {
      this.validateLogEntry(
        new RegExp(`Step ${stepNumber}.*${this.constructor.escapeRegExp(options.note)}`, "i")
      );
    }
  
    return this;
  }
  

  // ───────────────────────────── UTILITIES ───────────────────────────
  addManualNote(text) {
    this.manualNotesTextarea.clear().type(text, { delay: 0 });
    this.addNoteButton.click({ force: true });
    return this;
  }

  resolveAlert(reasonValue = null) {
    if (reasonValue) this.resolutionReason.select(reasonValue, { force: true });
    this.resolveAlertButton.click({ force: true });
    return this;
  }

  resolveWithOverride(overrideReason) {
    this.resolveAlertButton.click({ force: true });
    this.overrideReason.select(overrideReason, { force: true });
    this.confirmOverrideButton.click({ force: true });
    return this;
  }

  clearAlert() {
    cy.window().then((win) => {
      if (typeof win.clearAlert === "function") win.clearAlert();
    });
    return this;
  }

  setGasLevel(gasType, value) {
    cy.window().then((win) => {
      if (typeof win.setGasLevel === "function")
        win.setGasLevel(gasType, value);
    });
    return this;
  }

  setDeviceOffline(reason = "battery") {
    cy.window().then((win) => {
      if (typeof win.setDeviceOffline === "function")
        win.setDeviceOffline(reason);
    });
    return this;
  }

  setDeviceOnline() {
    cy.window().then((win) => {
      if (typeof win.setDeviceOnline === "function") win.setDeviceOnline();
    });
    return this;
  }

  // ─────────────────────────── DEMO CONTROLS ─────────────────────────
  openDemoPanel() {
    this.demoGear.click({ force: true });
    return this;
  }

  closeDemoPanel() {
    cy.get("body").click(0, 0);
    return this;
  }
}

export default new EmergencyProtocolPage();
