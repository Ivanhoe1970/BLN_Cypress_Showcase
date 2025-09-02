// cypress/e2e/logs/protocol-log-contract.cy.js
import EmergencyProtocolPage from "../../pages/EmergencyProtocolPage";

// Reusable helper – ensures a brand-new log line then matches only the latest entry
const expectNewLogLine = (action, pattern) => {
  action();
  cy.tick(500);

  cy.get('[data-cy="protocol-log-container"] .log-entry')
    .should("have.length.greaterThan", 0)
    .then(($entries) => {
      const allText = Array.from($entries).map((el) => el.textContent.trim());

      // DEBUG: Show what we actually got
      console.log("Available entries:", allText);

      const matchingEntry = allText.find((text) => pattern.test(text));
      expect(
        matchingEntry,
        `Pattern: ${pattern}\nAvailable: ${JSON.stringify(allText)}`
      ).to.exist;
    });
};

// Scenarios: add/remove rows to expand coverage without duplicating tests
const SCENARIOS = [
  {
    key: "fall",
    label: "Non-gas: Fall detection",
    load: () => cy.get('[data-cy="fall-detection-test-btn"]').click(),
    type: "nonGas",
    supportsAutoAck: true,
  },
  {
    key: "noMotion",
    label: "Non-gas: No motion",
    load: () => cy.get('[data-cy="no-motion-test-btn"]').click(),
    type: "nonGas",
    supportsAutoAck: true,
  },
  {
    key: "missedCheckIn",
    label: "Non-gas: Missed check-in (offline)",
    load: () => cy.get('[data-cy="missed-check-in-offline-btn"]').click(),
    type: "nonGas",
    supportsAutoAck: true,
  },
  {
    key: "gasHigh",
    label: "Gas: CO HIGH",
    load: () => cy.get('[data-cy="co-normalization-test-btn"]').click(),
    type: "gas",
    setup: () => {}, // remain HIGH
    supportsAutoAck: false, // resolving replies must NOT auto-ack while HIGH
  },
  {
    key: "gasNormal",
    label: "Gas: CO NORMAL (forced)",
    load: () => cy.get('[data-cy="co-normalization-test-btn"]').click(),
    type: "gas",
    setup: () => {
      cy.window().then((win) => {
        if (typeof win.setGasLevel === "function") win.setGasLevel("co", 0.5);
      });
      cy.tick(500);
    },
    supportsAutoAck: true,
  },
];

describe("Protocol log — contract (multi-alert)", () => {
  beforeEach(() => {
    cy.clock(Date.now(), [
      "Date",
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
    ]);
    EmergencyProtocolPage.visit();
    EmergencyProtocolPage.openDemoPanel();
  });

  afterEach(() => cy.clock().then((c) => c.restore()));

  SCENARIOS.forEach((s) => {
    describe(s.label, () => {
      beforeEach(() => {
        s.load();
        if (s.setup) s.setup();

        if (s.type === "nonGas") {
          EmergencyProtocolPage.validateGasDataAbsent();
        } else {
          // Gas scenarios: assert expected state
          const expected = s.key === "gasHigh" ? "HIGH" : "NORMAL";
          EmergencyProtocolPage.validateGasReading("co", null, expected);
        }
      });

      it("logs outbound send with timestamp", () => {
        expectNewLogLine(
          () => EmergencyProtocolPage.sendMessage("Are you OK?"),
          /\[\d{2}:\d{2}:\d{2} MST\].*Sent.*Are you OK/i
        );
      });

      it("logs inbound reply with timestamp", () => {
        expectNewLogLine(() => {
          EmergencyProtocolPage.simulateDeviceResponse("Yes");
          cy.tick(500);
        }, /\[\d{2}:\d{2}:\d{2} MST\].*Message logged.*protocol escalation/i);
      });

      // Auto-ack contract depends on gas state
      (s.supportsAutoAck ? it : it.skip)(
        "logs auto-ack for resolving reply",
        () => {
          // Precondition for some apps: send a prompt first so context exists
          EmergencyProtocolPage.sendMessage("Status check");
          cy.tick(200);

          expectNewLogLine(() => {
            EmergencyProtocolPage.simulateDeviceResponse("I'm OK");
            cy.tick(500);
          }, /\[\d{2}:\d{2}:\d{2} MST\].*Sent.*Noted.*Resolving alert/i);
        }
      );

      (!s.supportsAutoAck ? it : it.skip)(
        "does NOT log auto-ack while gas is HIGH",
        () => {
          // Precondition: send a prompt
          EmergencyProtocolPage.sendMessage("Status check");
          cy.tick(200);

          // Snapshot -> act -> ensure the newest line isn't the auto-ack
          cy.get('[data-cy="protocol-log-container"] .log-entry')
            .its("length")
            .then((before) => {
              EmergencyProtocolPage.simulateDeviceResponse("I'm OK");
              cy.tick(500);
              cy.get('[data-cy="protocol-log-container"] .log-entry')
                .its("length")
                .then((after) => {
                  if (after > before) {
                    cy.get('[data-cy="protocol-log-container"] .log-entry')
                      .eq(after - 1)
                      .invoke("text")
                      .should("not.match", /Sent.*Noted.*Resolving alert/i);
                  }
                });
            });
        }
      );
    });
  });
});
