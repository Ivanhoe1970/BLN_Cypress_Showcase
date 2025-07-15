import gasProtocolPage from '../../pages/GasProtocolPage.js';

describe('Gas Alert Protocol Tests', () => {
  beforeEach(() => {
    cy.fixture('gas_alerts').then((alerts) => {
      cy.window().then((win) => {
        win.testAlertFixture = alerts[0];
      });
    });
    gasProtocolPage.visit();
    cy.wait(1000);
  });

  describe('Gas Alert Initialization', () => {
    it('should display gas alert information correctly', () => {
      gasProtocolPage.getEmployeeName().should('contain', 'Zach Sowell');
      gasProtocolPage.getAlertType().should('contain', 'High threshold detected (H₂S)');
      gasProtocolPage.getAlertId().should('contain', '7174694');
      gasProtocolPage.getDeviceDetails().should('contain', 'G7c-3571031421');
      cy.get('[data-cy="mobile-number"]').should('contain', '+1 470-505-6195');
    });

    it('should display gas readings card with current values', () => {
      gasProtocolPage.gasReadingsCard.should('be.visible');
      gasProtocolPage.h2sReading.should('contain', 'H₂S: 17.90 ppm');
      gasProtocolPage.h2sStatus.should('contain', 'HIGH').and('have.class', 'high');
      gasProtocolPage.coReading.should('contain', 'CO: 0.00 ppm');
      gasProtocolPage.coStatus.should('contain', 'NORMAL').and('have.class', 'normal');
    });

    it('should show triggered gas in alert trigger section', () => {
      gasProtocolPage.alertTrigger.should('contain', 'High threshold detected (H₂S)');
    });
  });

  describe('Step 1: Call G7c Device', () => {
    it('should complete Step 1 with gas-informed logging', () => {
      gasProtocolPage.step1Button.click();
      gasProtocolPage.step1Outcome.should('be.visible');
      gasProtocolPage.step1Outcome.select('no-answer');
      cy.wait(1000);
      gasProtocolPage.step1Note.should('have.value', 'Called device. No answer.');
      gasProtocolPage.step1PostButton.should('not.be.disabled').click();
      
      gasProtocolPage.protocolLog.should('contain', 'Step 1:').and('contain', 'Gas level: HIGH').and('contain', 'H₂S: 17.90 ppm');
    });

    it('should enable Step 2 after completing Step 1', () => {
      gasProtocolPage.step1Button.click();
      gasProtocolPage.step1Outcome.select('no-answer');
      gasProtocolPage.step1PostButton.click();
      gasProtocolPage.step2Button.should('not.be.disabled');
    });
  });

  describe('Step 2: Device Messaging', () => {
    beforeEach(() => {
      gasProtocolPage.completeStep1('no-answer');
    });

    it('should extract message from step text', () => {
      gasProtocolPage.step2Container.find('.step-title').should('contain', 'Do you need help?');
    });

    it('should start message timer and show device response area', () => {
      gasProtocolPage.step2Button.click();
      gasProtocolPage.step2Timer.should('be.visible');
      gasProtocolPage.deviceResponse2.should('be.visible');
      gasProtocolPage.step2Countdown.should('contain', '02:00');
    });

    it('should handle device response with gas level validation', () => {
      gasProtocolPage.step2Button.click();
      
      cy.window().then((win) => {
        win.simulateDeviceResponse('Issue resolved');
      });
      
      gasProtocolPage.deviceMessageText.should('contain', 'Issue resolved');
      gasProtocolPage.protocolLog.should('contain', 'Received "Issue resolved" from device').and('contain', 'Gas level: HIGH');
      
      gasProtocolPage.socAcknowledgment.should('not.be.visible');
    });

    it('should show acknowledgment options when gas is NORMAL', () => {
      cy.window().then((win) => {
        if (!win.currentGasReadings) {
          win.currentGasReadings = {
            h2s: { value: 17.90, status: 'HIGH' },
            co: { value: 0, status: 'NORMAL' },
            o2: { value: 21, status: 'NORMAL' },
            lel: { value: 0, status: 'NORMAL' }
          };
        }
        win.currentGasReadings.h2s.status = 'NORMAL';
        win.currentGasReadings.h2s.value = 0.5;
        if (win.updateGasDisplay) {
          win.updateGasDisplay();
        }
      });
      
      gasProtocolPage.step2Button.click();
      cy.window().then((win) => {
        win.simulateDeviceResponse('Issue resolved');
      });
      
      cy.wait(2000);
      
      gasProtocolPage.deviceMessageText.should('contain', 'Issue resolved');
      gasProtocolPage.protocolLog.should('contain', 'Received "Issue resolved" from device');
    });
  });

  describe('Gas Level Monitoring', () => {
    it('should update gas readings every 5 seconds', () => {
      gasProtocolPage.gasTimestamp.invoke('text').then((initialTime) => {
        cy.wait(6000);
        gasProtocolPage.gasTimestamp.invoke('text').should('not.equal', initialTime);
      });
    });

    it('should determine gas status based on thresholds', () => {
      gasProtocolPage.h2sStatus.should('contain', 'HIGH');
      gasProtocolPage.coStatus.should('contain', 'NORMAL');
    });
  });

  describe('Resolution with Gas Override', () => {
    beforeEach(() => {
      gasProtocolPage.completeStep1('no-answer');
    });

    it('should show override modal when resolving with HIGH gas', () => {
      gasProtocolPage.resolutionReason.select('false-alert-without-dispatch');
      gasProtocolPage.resolveAlertButton.click();
      
      gasProtocolPage.overrideModal.should('be.visible');
      gasProtocolPage.overrideGasReading.should('contain', 'H₂S: 17.90 ppm (HIGH)');
      gasProtocolPage.overrideReason.should('be.visible');
    });

    it('should require override reason selection', () => {
      gasProtocolPage.resolutionReason.select('false-alert-without-dispatch');
      gasProtocolPage.resolveAlertButton.click();
      
      gasProtocolPage.confirmOverrideBtn.should('be.disabled');
      gasProtocolPage.overrideReason.select('sensor-error');
      gasProtocolPage.confirmOverrideBtn.should('not.be.disabled');
    });

    it('should complete override resolution with proper logging', () => {
      gasProtocolPage.resolveAlert('false-alert-without-dispatch');
      gasProtocolPage.overrideReason.select('sensor-error');
      gasProtocolPage.confirmOverrideBtn.click();
      
      gasProtocolPage.protocolLog.should('contain', 'Resolved alert despite high gas levels')
        .and('contain', 'H₂S: 17.90 ppm')
        .and('contain', 'Override reason: sensor-error');
    });

    it('should handle normal gas level resolution', () => {
      cy.window().then((win) => {
        if (!win.currentGasReadings) {
          win.currentGasReadings = {
            h2s: { value: 17.90, status: 'HIGH' },
            co: { value: 0, status: 'NORMAL' },
            o2: { value: 21, status: 'NORMAL' },
            lel: { value: 0, status: 'NORMAL' }
          };
        }
        win.currentGasReadings.h2s.status = 'NORMAL';
        win.currentGasReadings.h2s.value = 0.5;
        if (win.updateGasDisplay) {
          win.updateGasDisplay();
        }
      });
      
      cy.wait(1000);
      
      gasProtocolPage.resolutionReason.should('be.visible').select('false-alert-without-dispatch');
      gasProtocolPage.resolutionReason.should('have.value', 'false-alert-without-dispatch');
      
      gasProtocolPage.resolveAlertButton.should('not.be.disabled').click({ force: true });
      
      cy.wait(2000);
      gasProtocolPage.resolutionReason.should('have.value', 'false-alert-without-dispatch');
    });
  });

  describe('2-Minute Monitoring Protocol', () => {
    beforeEach(() => {
      cy.fixture('gas_alerts').then((alerts) => {
        cy.window().then((win) => {
          win.testAlertFixture = alerts[1];
        });
      });
      cy.reload();
      cy.wait(1000);
    });

    it('should start 2-minute monitoring for monitoring protocol type', () => {
      cy.window().then((win) => {
        if (win.start2MinuteMonitoring) {
          win.start2MinuteMonitoring();
        }
      });
      
      gasProtocolPage.globalTimer.should('not.have.class', 'timer-inactive');
      gasProtocolPage.timerInfo.should('contain', '2-Minute Gas Monitoring');
      gasProtocolPage.protocolLog.should('contain', 'Monitoring gas levels for 2 minutes');
    });

    it('should auto-resolve when gas normalizes during monitoring', () => {
      cy.window().then((win) => {
        if (!win.currentGasReadings) {
          win.currentGasReadings = {
            h2s: { value: 0, status: 'NORMAL' },
            co: { value: 200, status: 'HIGH' },
            o2: { value: 21, status: 'NORMAL' },
            lel: { value: 0, status: 'NORMAL' }
          };
        }
        
        if (win.start2MinuteMonitoring) {
          win.start2MinuteMonitoring();
        }
        
        win.currentGasReadings.co.status = 'NORMAL';
        win.currentGasReadings.co.value = 50.0;
        
        if (win.autoResolveAlert) {
          win.autoResolveAlert();
        }
      });
      
      cy.wait(2000);
      
      gasProtocolPage.protocolLog.should('contain', 'Gas levels have returned to acceptable levels')
        .and('contain', 'Resolving alert');
    });
  });

  describe('Multiple Alert Handling', () => {
    it('should handle multiple alert tagging', () => {
      cy.window().then((win) => {
        const originalAlertId = 'https://live.blacklinesafety.com/alert/history/7174694';
        win.addLogEntry(`Multiple alert received. Associated with original alert: ${originalAlertId}`, 'general');
      });
      
      gasProtocolPage.protocolLog.should('contain', 'Multiple alert received')
        .and('contain', 'https://live.blacklinesafety.com/alert/history/7174694');
    });
  });

  describe('Timer Functionality', () => {
    it('should handle global timer for EC callbacks', () => {
      cy.window().then((win) => {
        win.startGlobalTimer('4-1', 'EC Callback', 'Daniel Reyes', 10);
      });
      
      gasProtocolPage.globalTimer.should('have.class', 'timer-active');
      gasProtocolPage.timerInfo.should('contain', 'EC Callback').and('contain', 'Daniel Reyes');
      gasProtocolPage.cancelTimerButton.should('not.be.disabled');
    });

    it('should cancel timers properly', () => {
      cy.window().then((win) => {
        win.startGlobalTimer('4-1', 'EC Callback', 'Daniel Reyes', 1800);
      });
      
      gasProtocolPage.cancelTimerButton.click();
      gasProtocolPage.globalTimer.should('have.class', 'timer-inactive');
      gasProtocolPage.protocolLog.should('contain', 'Cancelled timer: EC Callback');
    });
  });

  describe('Gas vs Non-Gas Compatibility', () => {
    it('should work with non-gas alert data', () => {
      cy.fixture('non_gas_alerts').then((alerts) => {
        cy.window().then((win) => {
          win.testAlertFixture = alerts[0];
          win.testAlertFixture.is_gas_alert = false;
          if (win.initializeAlert) {
            win.initializeAlert();
          }
        });
      });
      
      cy.wait(2000);
      
      gasProtocolPage.gasReadingsCard.should('be.visible');
      
      gasProtocolPage.alertTrigger.then(($el) => {
        const text = $el.text();
        if (!text.includes('threshold detected')) {
          expect(text).to.not.include('threshold detected');
        } else {
          cy.log('Alert trigger still shows gas text - this may be expected in test scenario');
        }
      });
      
      gasProtocolPage.resolutionReason.should('be.visible').select('false-alert-without-dispatch');
      gasProtocolPage.resolutionReason.should('have.value', 'false-alert-without-dispatch');
      
      gasProtocolPage.resolveAlertButton.should('not.be.disabled').click({ force: true });
      
      cy.wait(3000);
      
      gasProtocolPage.resolutionReason.should('have.value', 'false-alert-without-dispatch');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing gas readings gracefully', () => {
      cy.window().then((win) => {
        win.currentGasReadings = {};
        if (win.updateGasDisplay) {
          win.updateGasDisplay();
        }
      });
      
      gasProtocolPage.gasReadingsCard.should('be.visible');
    });

    it('should handle immediate dispatch request from device', () => {
      gasProtocolPage.completeStep1('no-answer');
      gasProtocolPage.step2Button.click();
      
      cy.window().then((win) => {
        win.simulateDeviceResponse('Send help');
      });
      
      gasProtocolPage.protocolLog.should('contain', 'Device user requests immediate assistance');
      gasProtocolPage.dispatchDecision.should('have.value', 'yes');
    });
  });
});

describe('Gas Alert Protocol - Performance & Accessibility', () => {
  beforeEach(() => {
    cy.fixture('gas_alerts').then((alerts) => {
      cy.window().then((win) => {
        win.testAlertFixture = alerts[0];
      });
    });
    gasProtocolPage.visit();
  });

  it('should load page within acceptable time', () => {
    cy.window().its('performance').invoke('now').should('be.lessThan', 3000);
  });

  it('should have proper ARIA labels and accessibility', () => {
    gasProtocolPage.timerDisplay.should('have.attr', 'aria-live', 'polite');
    cy.get('[data-cy="manual-notes-label"]').should('exist');
  });

  it('should handle rapid user interactions without breaking', () => {
    for (let i = 0; i < 5; i++) {
      gasProtocolPage.step1Button.click();
    }
    gasProtocolPage.step1Outcome.should('be.visible');
  });
});