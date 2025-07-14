describe('Gas Alert Protocol - Smoke Test', () => {
    beforeEach(() => {
        cy.visit('http://127.0.0.1:5500/automated-basic-gas-alert-protocol.html');
    });
  
    it('loads all major protocol sections', () => {
      // Page title and headings
      cy.contains('Gas Alert Protocol');
      cy.contains('Logs');
      cy.contains('Steps');
      cy.contains('Resolution');
  
      // Step 1
      cy.get('[data-cy=step-1]').should('exist');
      cy.get('#step-1-note').should('exist');
      cy.contains('Send message to device');
  
      // Step 2
      cy.get('[data-cy=step-2]').should('exist');
      cy.get('#step-2-note').should('exist');
      cy.contains("Call user's device");
  
      // Step 4 emergency contacts
      cy.get('[data-cy=step-4]').should('exist');
      cy.get('#step-4-1').should('exist');
      cy.get('#step-4-2').should('exist');
      cy.contains('Call Taylor Davis');
      cy.contains('Call Jamie Davis');
  
      // Follow-up timer
      cy.get('#follow-up-container').should('exist');
  
      // Resolution block
      cy.contains('Current Gas Level:');
      cy.get('#resolution-reason').should('exist');
      cy.contains('Resolve Alert');
      cy.contains('Cancel Resolution');
    });
  });
  