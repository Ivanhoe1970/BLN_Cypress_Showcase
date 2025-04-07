describe('Protocol Workflow - Continue Protocol Flow', () => {
    beforeEach(() => {
      cy.visit('http://127.0.0.1:5500/automated-basic-non-gas-alert-protocol/index.html');
    });
  
    it('resets and highlights Steps 2b and 4 when Continue Protocol is clicked', () => {
      // Click "Continue Protocol"
      cy.get('[data-cy=continue-protocol-btn]').click();
  
      // Logs the correct action
      cy.get('[data-cy=log-list]')
        .should('contain.text', 'Repeat Steps 2b and 4 until someone is reached.');
  
      // Step 2b and Step 4 should be highlighted
      cy.get('[data-cy=step-2b]')
        .should('have.class', 'highlighted-step');
  
      cy.get('[data-cy=step-4]')
        .should('have.class', 'highlighted-step');
    });
  });
  