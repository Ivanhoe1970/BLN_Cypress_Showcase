// cypress/e2e/non_gas_message_test.cy.js
import Page from "../../pages/EmergencyProtocolPage";

describe('Non-gas protocol — Message Test', () => {
  beforeEach(() => {
    Page.visit();
  });

  it('runs message-first flow with timer, then resolves as false-alert', () => {
    // Use the AlertDataManager id you showed earlier
    Page.loadAlertById('message-test');

    // Header sanity
    Page.alertType.should('not.contain.text', 'Gas');
    Page.employeeName.should('contain.text', 'Marcus');

    // Step 1: message + timer expected
    Page.startStep(1);
    Page.validateTimerActive(); // shows mm:ss and .timer-active

    // Device replies → cancel the timer (support multiple app helpers)
    cy.window().then((win) => {
      if (typeof win.testResponse === 'function') {
        win.testResponse("I'm OK");
      } else if (typeof win.simulateDeviceResponse === 'function') {
        // legacy helper signature: (text, isResponse)
        win.simulateDeviceResponse("I'm OK", true);
      } else {
        // last-resort fallback: cancel via UI dropdown (keeps test robust)
        Page.cancelTimerByDropdown('custom', 'Device replied: OK');
      }
    });
    Page.validateTimerInactive();

    // Step 2: call user → confirmed OK
    Page.startStep(2);
    Page.stepSelect(2).select('confirmed-ok', { force: true });
    Page.stepNote(2).clear().type('User confirmed they are fine.', { delay: 0 });
    Page.stepPost(2).click({ force: true });
    Page.validateLogEntry('confirmed they are fine');

    // Resolve as non-gas, no dispatch
    // (value must match your <option value="...">, which is typically "false-alert-without-dispatch")
    Page.resolveAlert('false-alert-without-dispatch');
    Page.validateLogEntry('Resolving alert');
  });
});
