// ========================================
// Custom Commands + Page Object Aliases
// ========================================

import EmergencyProtocolPage from '../pages/EmergencyProtocolPage'

Cypress.Commands.add('gasPage', () =>
  cy.wrap(EmergencyProtocolPage, { log: false })
)

Cypress.Commands.add('protocolPage', () =>
  cy.wrap(EmergencyProtocolPage, { log: false })
)

// ========================================
// LOCAL TESTING COMMANDS (Emergency Protocol)
// ========================================

Cypress.Commands.add('loadLocalAlert', (alertId) => {
  cy.window({ timeout: 20000 }).then((win) => {
    if (typeof win.loadAlert === "function") {
      win.loadAlert(alertId);
    } else {
      throw new Error(`No alert loader found for id: ${alertId}`);
    }
  });
  cy.get('[data-cy="alert-header"], #alert-header', { timeout: 10000 }).should("be.visible");
});

Cypress.Commands.add('setGasLevel', (gasType, value, status = null) => {
  cy.window().then((win) => {
    if (typeof win.setGasLevel === 'function') {
      win.setGasLevel(gasType, value);
    } else {
      const unit = gasType === 'o2' ? ' %vol' : gasType === 'lel' ? ' %LEL' : ' ppm';
      const valueEl = document.getElementById(`${gasType}-value`);
      const statusEl = document.getElementById(`${gasType}-status`);
      
      if (valueEl) valueEl.textContent = `${value}${unit}`;
      if (statusEl && status) {
        statusEl.textContent = status;
        statusEl.className = `gas-status ${status.toLowerCase()}`;
      }
    }
  });
});

Cypress.Commands.add('setGasNormal', (gasType = 'h2s') => {
  cy.window().then((win) => {
    if (typeof win.setGasNormal === 'function') {
      win.setGasNormal();
    } else if (typeof win.triggerGasNormalization === 'function') {
      const config = {
        gasNormalization: {
          enabled: true,
          targetLevels: {}
        }
      };
      config.gasNormalization.targetLevels[gasType] = { value: 0.5, status: 'NORMAL' };
      win.triggerGasNormalization(config);
    } else {
      const statusEl = document.getElementById(`${gasType}-status`);
      const valueEl = document.getElementById(`${gasType}-value`);
      if (statusEl) {
        statusEl.textContent = 'NORMAL';
        statusEl.className = 'gas-status normal';
      }
      if (valueEl) valueEl.textContent = '0.50 ppm';
    }
  });
});

Cypress.Commands.add('setGasHigh', (gasType = 'h2s', value = 17.90) => {
  cy.window().then((win) => {
    if (typeof win.setGasHigh === 'function') {
      win.setGasHigh();
    } else {
      const unit = gasType === 'o2' ? ' %vol' : gasType === 'lel' ? ' %LEL' : ' ppm';
      const statusEl = document.getElementById(`${gasType}-status`);
      const valueEl = document.getElementById(`${gasType}-value`);
      if (statusEl) {
        statusEl.textContent = 'HIGH';
        statusEl.className = 'gas-status high';
      }
      if (valueEl) valueEl.textContent = `${value}${unit}`;
    }
  });
});

Cypress.Commands.add('simulateDeviceResponse', (message) => {
  cy.window().then((win) => {
    if (typeof win.testResponse === 'function') {
      win.testResponse(message);
    } else if (typeof win.simulateDeviceResponse === 'function') {
      win.simulateDeviceResponse(message, true);
    } else {
      throw new Error('No device response simulator found on window');
    }
  });
});

Cypress.Commands.add('waitForTimer', (shouldBeActive = true) => {
  if (shouldBeActive) {
    cy.get('[data-cy="global-timer"], #globalTimer', { timeout: 10000 })
      .should('not.have.class', 'timer-inactive');
    cy.get('[data-cy="timer-display"], #timerDisplay')
      .invoke('text').should('match', /\d{2}:\d{2}/);
  } else {
    cy.get('[data-cy="global-timer"], #globalTimer')
      .should('have.class', 'timer-inactive');
    cy.get('[data-cy="timer-display"], #timerDisplay')
      .should('contain.text', '--:--');
  }
});

Cypress.Commands.add('cancelTimer', (reason = 'custom', customText = 'Test cancellation') => {
  cy.get('[data-cy="global-cancel-dropdown"], select[onchange*="handleGlobalTimerCancellation"]')
    .select(reason, { force: true });
  
  if (reason === 'custom') {
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(customText);
    });
  }
});

Cypress.Commands.add('verifyLogContains', (text) => {
  cy.get('[data-cy="protocol-log-container"], #protocolLog')
    .should('contain.text', text);
});

Cypress.Commands.add('addNote', (noteText) => {
  cy.get('[data-cy="manual-notes"], #manual-notes')
    .clear().type(noteText, { delay: 0 });
  cy.get('[data-cy="post-note-btn"], button[onclick="addManualNote()"]')
    .click({ force: true });
});

Cypress.Commands.add('resolveWithReason', (reason) => {
  cy.get('[data-cy="resolution-reason"], #resolution-reason')
    .select(reason, { force: true });
  cy.get('[data-cy="resolve-alert-btn"], button[onclick="resolveAlert()"]')
    .click({ force: true });
});

Cypress.Commands.add('handleOverrideModal', (overrideReason) => {
  cy.get('[data-cy="override-modal"], #overrideModal')
    .should('be.visible');
  cy.get('[data-cy="override-reason"], #override-reason')
    .select(overrideReason, { force: true });
  cy.get('[data-cy="confirm-override-btn"], #confirmOverrideBtn')
    .should('not.be.disabled')
    .click({ force: true });
});

Cypress.Commands.add('setDeviceOffline', (reason = 'battery') => {
  cy.window().then((win) => {
    if (typeof win.setDeviceOffline === 'function') {
      win.setDeviceOffline(reason);
    }
  });
});

Cypress.Commands.add('setDeviceOnline', () => {
  cy.window().then((win) => {
    if (typeof win.setDeviceOnline === 'function') {
      win.setDeviceOnline();
    }
  });
});

// ========================================
// UTILITY COMMANDS
// ========================================

Cypress.Commands.add('waitForPageLoad', (timeout = 10000) => {
  cy.get('[data-cy="loading-indicator"]', { timeout }).should('not.exist');
  cy.get('[data-cy="page-content"]').should('be.visible');
});

Cypress.Commands.add('verifyTimestamp', (selector, expectedFormat = 'MM/DD/YYYY HH:mm:ss') => {
  cy.get(selector).should('be.visible').then(($el) => {
    const ts = $el.text();
    expect(ts).to.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
  });
});

// ========================================
// ACCESSIBILITY COMMANDS
// ========================================

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y();
});

Cypress.Commands.add('verifyKeyboardNavigation', (selectors) => {
  selectors.forEach((selector) => {
    cy.get(selector).focus().should('have.focus');
    cy.get(selector).type('{enter}');
  });
});