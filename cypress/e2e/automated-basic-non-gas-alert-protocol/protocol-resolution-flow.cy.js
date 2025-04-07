describe('Protocol Workflow - Resolution Flow', () => {
    beforeEach(() => {
      cy.visit('http://127.0.0.1:5500/automated-basic-non-gas-alert-protocol/index.html');
    });
  
    it('resolves the alert and visually locks the protocol', () => {
      // Select resolution reason
      cy.get('[data-cy=resolution-select]').select('Incident with dispatch');
  
      // Click resolve
      cy.get('[data-cy=resolve-alert-btn]').click();
  
      // Check log contains resolution reason
      cy.get('[data-cy=log-list]')
        .should('contain.text', 'Alert resolved. Reason: Incident with dispatch');
  
      // Check all steps are visually grayed out
      cy.get('.step').each(($step) => {
        cy.wrap($step).should('have.class', 'resolved-step');
      });
  
      // Check cancel button appears
      cy.get('[data-cy=cancel-resolution-btn]').should('be.visible');
    });
  
    it('cancels resolution and re-enables steps', () => {
      // Resolve first
      cy.get('[data-cy=resolution-select]').select('False alert with dispatch');
      cy.get('[data-cy=resolve-alert-btn]').click();
  
      // Then cancel
      cy.get('[data-cy=cancel-resolution-btn]').click();
  
      // Verify log
      cy.get('[data-cy=log-list]')
        .should('contain.text', 'Resolution canceled. Protocol re-opened.');
  
      // Steps should no longer be grayed out
      cy.get('.step').each(($step) => {
        cy.wrap($step).should('not.have.class', 'resolved-step');
      });
  
      // Cancel button should disappear
      cy.get('[data-cy=cancel-resolution-btn]').should('not.be.visible');
    });
  });
  