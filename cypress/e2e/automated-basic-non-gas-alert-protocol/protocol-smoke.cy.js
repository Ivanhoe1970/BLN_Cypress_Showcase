describe('Protocol Workflow - Smoke Test', () => {
    beforeEach(() => {
      cy.visit('http://127.0.0.1:5500/automated-basic-non-gas-alert-protocol/index.html');
    });
  
    it('loads the Protocol Workflow page successfully', () => {
      // Check the main header
      cy.contains('h1', 'Protocol Workflow').should('be.visible');
  
      // Check Logs panel
      cy.get('#log-list').should('exist');
  
      // Check Steps panel
      cy.get('#steps-container').should('be.visible');
      cy.contains('h2', 'Steps').should('be.visible');
  
      // Check a sample step
      cy.contains('Step 1').should('exist');
      cy.contains('Step 2a').should('exist');
      cy.contains('Step 4').should('exist');
  
      // Check resolution section
      cy.get('.resolve-container').should('be.visible');
      cy.contains('button', 'Resolve Alert').should('exist');
    });
  });
  