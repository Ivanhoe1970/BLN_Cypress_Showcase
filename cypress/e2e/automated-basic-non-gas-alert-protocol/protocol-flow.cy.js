describe('Protocol Workflow - Step 1 Logging Flow', () => {
    beforeEach(() => {
      cy.visit('http://127.0.0.1:5500/automated-basic-non-gas-alert-protocol/index.html');
    });
  
    it('completes Step 1 and logs the note correctly', () => {
      // Click the Step 1 button
      cy.get('[data-cy=step-1-action]').click();
  
      // Check that textarea is populated
      cy.get('[data-cy=step-1-note]')
        .should('have.value', "Sent message to the device: 'Do you need help?'");
  
      // Click post note
      cy.get('[data-cy=step-1-post]').click();
  
      // Confirm log entry is visible
      cy.get('#log-list')
        .contains("Step 1: Sent message to the device: 'Do you need help?'")
        .should('exist');
  
      // Confirm step has the completed visual
      cy.get('[data-cy=step-1]').should('have.class', 'completed-step');
    });
  });
  