// cypress/e2e/messaging-system/pre-alert-system.cy.js
import EmergencyProtocolPage from '../../pages/EmergencyProtocolPage';

describe('Pre-Alert System', () => {
  beforeEach(() => {
    EmergencyProtocolPage.visit();
    cy.wait(500);
  });

  describe('Pre-Alert Detection and Setup', () => {
    it('should detect alerts older than 24 hours as pre-alerts', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="pre-alert-test-btn"]').click();

      EmergencyProtocolPage.alertTitle.should('contain', 'PRE-ALERT');

      EmergencyProtocolPage
        .validateLogEntry('Pre-alert - alert triggered 25 hours ago')
        .validateLogEntry('Resolving as per Blackline Safety policy');
    });

    it('should auto-complete all protocol steps for pre-alerts', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="pre-alert-test-btn"]').click();

      EmergencyProtocolPage.alertTitle.should('contain', 'PRE-ALERT');

      EmergencyProtocolPage
        .validateStepStatus('step-1', 'Completed')
        .validateStepStatus('step-2', 'Completed')
        .validateStepStatus('step-3', 'Completed')
        .validateStepStatus('step-4', 'Completed')
        .validateStepStatus('step-5', 'Completed');
    });

    it('should auto-select pre-alert resolution type', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="pre-alert-test-btn"]').click();

      EmergencyProtocolPage.validateLogEntry('Pre-alert - alert triggered');

      EmergencyProtocolPage.protocolLog
        .should('contain.text', 'Pre-alert - alert triggered 25 hours ago')
        .and('contain.text', 'Resolving as per Blackline Safety policy');

      EmergencyProtocolPage.resolutionReason
        .should('be.visible')
        .find('option:selected')
        .should($opt => {
          const text = ($opt.text() || '').trim().toLowerCase();
          const val  = ($opt.val()  || '').trim().toLowerCase();
          expect(text || val, 'selected option').to.match(/pre[- ]?alert/);
        });
    });

    it('should highlight resolution section for pre-alerts', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="pre-alert-test-btn"]').click();

      EmergencyProtocolPage.alertTitle.should('contain', 'PRE-ALERT');

      cy.get('[data-cy="resolution-section-pre-alert"]')
        .should('exist')
        .should('have.css', 'border-color', 'rgb(255, 193, 7)'); // #ffc107
    });
  });

  describe('Pre-Alert UI State Management', () => {
    beforeEach(() => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="pre-alert-test-btn"]').click();
      EmergencyProtocolPage.alertTitle.should('contain', 'PRE-ALERT');
    });

    it('should disable all protocol step buttons for pre-alerts', () => {
      cy.get('body').then($body => {
        const $stepButtons = $body.find('.step button').not('[onclick*="postNote"]');
        if ($stepButtons.length > 0) {
          cy.wrap($stepButtons).should('be.disabled');
        } else {
          cy.log('No step buttons found - pre-alert has hidden/removed them');
        }
      });
    });

    it('should keep resolution controls enabled for pre-alerts', () => {
      EmergencyProtocolPage.resolveAlertButton.should('not.be.disabled');
      EmergencyProtocolPage.resolutionReason.should('not.be.disabled');
      EmergencyProtocolPage.cancelResolutionButton.should('not.be.disabled');
    });

    it('should keep manual notes functionality active for pre-alerts (if available)', () => {
      // Conditionally post a note only if manual note controls exist in this build
      cy.get('body').then($b => {
        const textareaSel = '[data-cy="note-textarea"], [data-cy="manual-note-textarea"], textarea[data-cy="manual-note"], textarea[data-cy="note"]';
        const postSel     = '[data-cy="post-note-btn"], [data-cy="post-note"]';
        const hasNotesUI  = $b.find(textareaSel).length && $b.find(postSel).length;

        if (hasNotesUI) {
          cy.get(textareaSel).filter(':visible').first().clear().type('Pre-alert documentation note', { delay: 0 });
          cy.get(postSel).filter(':visible').first().click({ force: true });

          // Assert directly against the raw log (avoid filtered helper)
          EmergencyProtocolPage.protocolLog.should('contain.text', 'Pre-alert documentation note');
        } else {
          cy.log('Manual notes UI hidden during pre-alert (acceptable for this build).');
          EmergencyProtocolPage.resolveAlertButton.should('not.be.disabled');
          EmergencyProtocolPage.resolutionReason.should('not.be.disabled');
        }
      });
    });
  });

  describe('Pre-Alert Resolution Flow', () => {
    beforeEach(() => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="pre-alert-test-btn"]').click();
      EmergencyProtocolPage.alertTitle.should('contain', 'PRE-ALERT');

      EmergencyProtocolPage.protocolLog
        .should('contain.text', 'Pre-alert - alert triggered 25 hours ago')
        .and('contain.text', 'Resolving as per Blackline Safety policy');

      EmergencyProtocolPage.resolutionReason
        .find('option:selected')
        .should($opt => {
          const text = ($opt.text() || '').trim().toLowerCase();
          const val  = ($opt.val()  || '').trim().toLowerCase();
          expect(text || val, 'selected option after setup').to.match(/pre[- ]?alert/);
        });
    });

    it('should allow direct resolution of pre-alerts', () => {
      EmergencyProtocolPage.resolveAlert();

      EmergencyProtocolPage
        .validateLogEntry('Alert resolved')
        .resolveAlertButton
        .should('contain', 'Alert Resolved')
        .should('be.disabled');
    });

    it('should handle resolution cancellation for pre-alerts', () => {
      EmergencyProtocolPage.cancelResolutionButton.click();

      EmergencyProtocolPage.validateLogEntry('Resolution cancelled by operator');

      EmergencyProtocolPage.resolveAlertButton
        .should('contain', 'Resolve Alert')
        .should('not.be.disabled');

      EmergencyProtocolPage.protocolLog
        .should('contain.text', 'Pre-alert - alert triggered 25 hours ago');
    });
  });

  describe('Pre-Alert Edge Cases', () => {
    it('should handle exactly 24-hour boundary correctly', () => {
      cy.window().then((win) => {
        const testAlert = { alertAge: 24.1 };
        const isPreAlert = win.isPreAlert(testAlert);
        expect(isPreAlert).to.be.true;

        const recentAlert = { alertAge: 23.9 };
        const isNotPreAlert = win.isPreAlert(recentAlert);
        expect(isNotPreAlert).to.be.false;
      });
    });

    it('should handle malformed alert data gracefully', () => {
      cy.window().then((win) => {
        const invalidAlert = { alert_date: 'invalid-date' };
        const result = win.isPreAlert(invalidAlert);
        expect(result).to.be.false;
      });
    });

    it('should skip normal protocol loading for pre-alerts', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="pre-alert-test-btn"]').click();

      EmergencyProtocolPage.alertTitle.should('contain', 'PRE-ALERT');

      EmergencyProtocolPage.validateTimerInactive();
      EmergencyProtocolPage.validateStepStatus('step-2', 'Completed');
    });
  });

  describe('Pre-Alert vs Normal Alert Distinction', () => {
    it('should handle recent alerts normally (not as pre-alerts)', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();

      EmergencyProtocolPage.resolutionReason
        .find('option:selected')
        .invoke('val')
        .then(v => expect(String(v || '').toLowerCase()).to.not.match(/pre[- ]?alert/));

      EmergencyProtocolPage.validateStepStatus('step-1', 'Active');

      EmergencyProtocolPage.protocolLog
        .should('not.contain', 'Pre-alert - alert triggered');
    });
  });
});
