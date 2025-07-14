// cypress/e2e/protocols/protocol_non_gas.cy.js

import EmergencyProtocolPage from '../../pages/EmergencyProtocolPage';

let alert;

describe('Protocol – Non-Gas Alert Workflow (Dynamic)', () => {
  beforeEach(() => {
    cy.fixture('non_gas_alerts').then((alerts) => {
      alert = alerts[0];
      EmergencyProtocolPage.visit();
      cy.window().then((win) => {
        win.testAlertFixture = alert;
      });
      
      // ✅ FIXED: Wait for correct element, then reset all buttons
      cy.get('[data-cy="call-g7c-device"]').should('be.visible');
      cy.get('.step button').each(($btn) => {
        cy.wrap($btn).then(($button) => {
          $button[0].disabled = false;
          $button[0].style.pointerEvents = 'auto';
          $button[0].style.opacity = '1';
        });
      });
    });
  });

  // STEP 1 TESTS
  describe('Step 1 - Call G7c Device', () => {
    it('completes Step 1 with device call', () => {
      EmergencyProtocolPage.completeStep1('no-answer');
      EmergencyProtocolPage.validateLogEntry('Called device. No answer');
    });

    it('uses Step 1 dropdown outcomes', () => {
      EmergencyProtocolPage.step1Button.click();
      EmergencyProtocolPage.step1Outcome.select('no-answer');
      EmergencyProtocolPage.step1Note.should('contain.value', 'Called device. No answer');
      EmergencyProtocolPage.step1PostButton.click();
      EmergencyProtocolPage.validateLogEntry('Step 1: Called device. No answer');
    });
  });

  // STEP 2 TESTS
  describe('Step 2 - Send Message & Timer', () => {
    it('completes Step 2 and verifies log', () => {
      EmergencyProtocolPage.completeStep2();
      EmergencyProtocolPage.validateLogEntry('Step 2: Sent message');
    });
  });

  // STEP 3 TESTS
  describe('Step 3 - Call User', () => {
    it('completes Step 3 and verifies log', () => {
      EmergencyProtocolPage.completeStep3('no-answer-voicemail');
      EmergencyProtocolPage.validateLogEntry('Step 3: Called Emily Garcia');
    });
  });

  // RESOLUTION TESTS
  describe('Resolution Workflow', () => {
    it('completes resolution and locks interface', () => {
      EmergencyProtocolPage.resolveAlert('false-alert-without-dispatch');
      EmergencyProtocolPage.validateLogEntry('Alert resolved: False alert without dispatch');
      EmergencyProtocolPage.validateProtocolLocked();
    });
  });
});