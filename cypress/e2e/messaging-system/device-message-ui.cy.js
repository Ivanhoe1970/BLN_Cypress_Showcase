import EmergencyProtocolPage from "../../pages/EmergencyProtocolPage";

describe("Device Messaging UI - SEND button behavior", () => {
    beforeEach(() => {
      EmergencyProtocolPage.visit();
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();
    });
  
    it("updates SEND button enablement as message text changes during typing", () => {
      const input = EmergencyProtocolPage.messageInput;
      const sendBtn = EmergencyProtocolPage.sendMessageButton;
  
      sendBtn.should("be.disabled");
  
      input.type("Following up on this case");
      sendBtn.should("be.enabled");
  
      input.clear().type("User called in and confirmed they are okay");
      sendBtn.should("be.enabled");
  
      input.clear().type("EC will call back in 15 minutes");
      sendBtn.should("be.enabled");
  
      input.clear().type("Dispatch requested - EMS needed");
      sendBtn.should("be.enabled");
    });  
  });
  