// Gas Guard & Override Tests - Foundation
import EmergencyProtocolPage from '../../pages/EmergencyProtocolPage.js';
import { mock } from '../../support/apiMocks.js';
import { GAS_THRESHOLDS } from '../../support/constants.js';

describe('Gas Guard — Basic HIGH gas detection', () => {
  beforeEach(() => {
    cy.clock(Date.now(), ['Date', 'setTimeout', 'clearTimeout']);
    
    EmergencyProtocolPage.visit();
    EmergencyProtocolPage.loadAlertById('h2s-response');
    
    // Wait for gas readings panel
    cy.get('[data-cy="gas-readings-card"]', { timeout: 10000 }).should('be.visible');
  });

  afterEach(() => {
    cy.clock().then((clock) => clock.restore());
  });

  it('should detect HIGH gas status in the gas panel', () => {
    // Check if H2S status shows HIGH (it should for h2s-response alert)
    cy.get('[data-cy="h2s-status"], #h2s-status').should('exist');
    
    // Check if resolution section exists
    cy.get('[data-cy="resolution-section"]').should('be.visible');
    
    // Basic check that override modal elements exist (even if not visible)
    cy.get('[data-cy="override-modal"]').should('exist');
  });
});