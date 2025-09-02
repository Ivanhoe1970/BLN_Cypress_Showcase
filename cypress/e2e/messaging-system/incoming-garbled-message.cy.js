// cypress/e2e/messaging-system/incoming-garbled-message.cy.js
import EmergencyProtocolPage from "../../pages/EmergencyProtocolPage";

// Helper: send a simulated device reply using whichever helper exists
function sendDeviceReply(text) {
  cy.window().then((win) => {
    if (typeof win.testResponse === "function") {
      win.testResponse(text);
    } else if (typeof win.simulateDeviceResponse === "function") {
      // legacy signature: (text, isResponse)
      win.simulateDeviceResponse(text, true);
    } else {
      throw new Error("No device response simulator available");
    }
  });
}

describe("Incoming garbled messages → initiate SOS protocol (ASCII-only)", () => {
  beforeEach(() => {
    EmergencyProtocolPage.visit();
    cy.wait(500);
    EmergencyProtocolPage.openDemoPanel();
    // Use a non-gas alert so messaging is the focus
    cy.get('[data-cy="fall-detection-test-btn"]').click();
  });

  it("symbolic garble initiates SOS", () => {
    sendDeviceReply(")(&&"); // ASCII symbols

    EmergencyProtocolPage.validateLogEntry(/Received .* Switching to SOS Protocol\./i);
    EmergencyProtocolPage.validateLogEntry(/SOS Protocol - Step 1: Sent "Do you need help\?"/i);

    EmergencyProtocolPage.timerInfo
      .invoke("text")
      .then((t) => {
        const s = (t || "").toLowerCase();
        expect(/sos|help|waiting.*reply|2\s*minutes/.test(s), `timer label was "${s}"`).to.be.true;
      });
  });

  it("high-entropy ASCII noise initiates SOS", () => {
    sendDeviceReply("@@{{}}##$$%%^^"); // ASCII punctuation noise

    EmergencyProtocolPage.validateLogEntry(/Received .* Switching to SOS Protocol\./i);
    EmergencyProtocolPage.validateLogEntry(/SOS Protocol - Step 1: Sent "Do you need help\?"/i);
  });

  it("unlikely token initiates SOS", () => {
    sendDeviceReply("uhsaD"); // random-looking ASCII token

    EmergencyProtocolPage.validateLogEntry(/Received .* Switching to SOS Protocol\./i);
    EmergencyProtocolPage.validateLogEntry(/SOS Protocol - Step 1: Sent "Do you need help\?"/i);
  });

  it('contextual "Understood" does NOT initiate SOS (continue path)', () => {
    // Put app into the message-waiting context first
    EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: "no-answer", note: "No answer" });
    EmergencyProtocolPage.completeStep(2, { outcome: "no-response", note: "No response" });

    sendDeviceReply("Understood");

    // Must NOT switch to SOS; app continues/escalates the protocol
    EmergencyProtocolPage.validateLogEntry(/Switching to SOS Protocol\./i, false);
    EmergencyProtocolPage.validateLogEntry(/Proceeding with protocol escalation/i, true);
    EmergencyProtocolPage.timerInfo.should("not.contain.text", "SOS");
  });
});
