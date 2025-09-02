import EmergencyProtocolPage from '../../pages/EmergencyProtocolPage';

describe('Gas Override Modal', () => {
  beforeEach(() => {
    EmergencyProtocolPage.visit();
    cy.wait(500);
  });

  describe('Modal Trigger and Blocking', () => {
    it('should show override modal when attempting to resolve with HIGH gas levels', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      
      EmergencyProtocolPage.validateGasReading('h2s', null, 'HIGH');
      EmergencyProtocolPage.resolveAlertButton.click();
      
      EmergencyProtocolPage.overrideModal.should('be.visible');
      EmergencyProtocolPage.overrideReason.should('be.visible');
      EmergencyProtocolPage.confirmOverrideButton.should('be.disabled');
    });

    it('should close modal on cancel and keep alert unresolved', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      
      EmergencyProtocolPage.resolveAlertButton.click();
      EmergencyProtocolPage.overrideModal.should('be.visible');
      
      cy.get('[data-cy="cancel-override"]').click();
      
      EmergencyProtocolPage.overrideModal.should('not.be.visible');
      EmergencyProtocolPage.resolveAlertButton
        .should('not.be.disabled')
        .should('contain', 'Resolve Alert');
        
      // No override audit trail should be created
      EmergencyProtocolPage.protocolLog.should('not.contain', 'Override cancelled');
    });
  });

  describe('Override Reason Validation', () => {
    beforeEach(() => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      EmergencyProtocolPage.resolveAlertButton.click();
      EmergencyProtocolPage.overrideModal.should('be.visible');
    });

    it('should require override reason selection before enabling confirm', () => {
      EmergencyProtocolPage.confirmOverrideButton.should('be.disabled');
      EmergencyProtocolPage.overrideReason.select('sensor-error');
      EmergencyProtocolPage.confirmOverrideButton.should('not.be.disabled');
    });

    it('should support all override reason options', () => {
      const reasons = ['sensor-error', 'user-confirmed-safety', 'ec-confirmed-safety', 'bump-test', 'other'];
      
      cy.wrap(reasons).each(reason => {
        EmergencyProtocolPage.overrideReason.select(reason);
        EmergencyProtocolPage.confirmOverrideButton.should('not.be.disabled');
      });
    });
  });

  describe('Override Confirmation Flow', () => {
    it('should successfully override with sensor error reason', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      
      EmergencyProtocolPage.resolveWithOverride('sensor-error');
      
      EmergencyProtocolPage.validateLogEntry('Alert resolved (Override: Sensor error)');
      EmergencyProtocolPage.resolveAlertButton
        .should('be.disabled')
        .should('contain', 'Alert Resolved');
    });

    it('should successfully override with user confirmed safety reason', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      
      EmergencyProtocolPage.resolveWithOverride('user-confirmed-safety');
      
      EmergencyProtocolPage.validateLogEntry('Alert resolved (Override: User confirmed they are okay)');
      EmergencyProtocolPage.resolveAlertButton.should('be.disabled');
    });

    it('should successfully override with emergency contact confirmation', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      
      EmergencyProtocolPage.resolveWithOverride('ec-confirmed-safety');
      
      EmergencyProtocolPage.validateLogEntry('Alert resolved (Override: Emergency contact confirmed user is okay)');
      EmergencyProtocolPage.resolveAlertButton.should('be.disabled');
    });
  });

  describe('Gas Reading Display in Modal', () => {
    it('should display current gas readings in override modal', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      
      EmergencyProtocolPage.resolveAlertButton.click();
      EmergencyProtocolPage.overrideModal.should('be.visible');
      
      cy.get('[data-cy="override-gas-reading"]')
        .should('be.visible')
        .should('contain', 'Current Gas Reading')
        .should('contain', 'HIGH');
    });
  });

  describe('Normal Gas Level Bypass', () => {
    it('should resolve directly when gas levels are NORMAL without showing override modal', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      
      EmergencyProtocolPage.setGasLevel('h2s', 1.2);
      EmergencyProtocolPage.validateGasReading('h2s', null, 'NORMAL');
      
      EmergencyProtocolPage.resolveAlert();
      
      EmergencyProtocolPage.overrideModal.should('not.be.visible');
      EmergencyProtocolPage.validateLogEntry('Alert resolved');
      EmergencyProtocolPage.resolveAlertButton.should('be.disabled');
    });
  });

  describe('Resolution Reason Integration', () => {
    it('should show override modal regardless of resolution reason when gas is HIGH', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      
      const reasons = ['incident-without-dispatch', 'incident-with-dispatch', 'false-alert-without-dispatch', 'false-alert-with-dispatch'];
      
      cy.wrap(reasons).each(reason => {
        EmergencyProtocolPage.resolutionReason.select(reason);
        EmergencyProtocolPage.resolveAlertButton.click();
        
        EmergencyProtocolPage.overrideModal.should('be.visible');
        
        cy.get('[data-cy="cancel-override"]').click();
        EmergencyProtocolPage.overrideModal.should('not.be.visible');
      });
    });
  });

  describe('Modal Content Validation', () => {
    beforeEach(() => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      EmergencyProtocolPage.resolveAlertButton.click();
    });

    it('should display proper modal title and message', () => {
      cy.get('[data-cy="override-modal"]')
        .should('be.visible')
        .and('contain.text', 'Gas levels are still elevated')
        .and('contain.text', 'Are you sure you want to resolve this alert?');
    });

    it('should show all override reason options', () => {
      const expectedOptions = [
        'Sensor error',
        'User confirmed they are okay', 
        'Emergency contact confirmed user is okay',
        'Bump Test/Calibration in progress',
        'Other'
      ];
      
      EmergencyProtocolPage.overrideReason.find('option').then(options => {
        const actualOptions = Array.from(options).map(o => o.text).filter(text => text.trim());
        expectedOptions.forEach(expectedOption => {
          expect(actualOptions.join(' ')).to.include(expectedOption);
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple override attempts correctly', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      
      // First attempt - cancel
      EmergencyProtocolPage.resolveAlertButton.click();
      EmergencyProtocolPage.overrideModal.should('be.visible');
      cy.get('[data-cy="cancel-override"]').click();
      EmergencyProtocolPage.overrideModal.should('not.be.visible');
      
      // Second attempt - complete override
      EmergencyProtocolPage.resolveAlertButton.click();
      EmergencyProtocolPage.overrideModal.should('be.visible');
      EmergencyProtocolPage.resolveWithOverride('sensor-error');
      
      EmergencyProtocolPage.validateLogEntry('Alert resolved (Override: Sensor error)');
    });

    it('should clear override reason selection when modal is reopened', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="h2s-standard-flow-btn"]').click();
      
      // First attempt - select reason but cancel
      EmergencyProtocolPage.resolveAlertButton.click();
      EmergencyProtocolPage.overrideReason.select('sensor-error');
      cy.get('[data-cy="cancel-override"]').click();
      
      // Second attempt - reason should be cleared
      EmergencyProtocolPage.resolveAlertButton.click();
      EmergencyProtocolPage.overrideReason.should('have.value', '');
      EmergencyProtocolPage.confirmOverrideButton.should('be.disabled');
    });
  });
});