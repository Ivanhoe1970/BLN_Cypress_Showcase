describe('Protocol Workflow - Step 2b and 4 Logging Flow', () => {
    beforeEach(() => {
      cy.visit('http://127.0.0.1:5500/automated-basic-non-gas-alert-protocol/index.html');
    });
  
    it('completes Step 2b and logs the note correctly', () => {
      // Click the Step 2b button
      cy.get('[data-cy=step-2b-action]').click();
  
      // Check textarea is populated
      cy.get('[data-cy=step-2b-note]')
        .should('contain.value', 'Called the user\'s phone number at 403-555-1234');
  
      // Post the note
      cy.get('[data-cy=step-2b-post]').click();
  
      // Verify it appears in the logs
      cy.get('[data-cy=log-list]')
        .should('contain.text', 'Step 2b: Called the user\'s phone number at 403-555-1234');
    });
  
    it('completes Step 4-1 with outcome and logs the note correctly', () => {
      // Click the Step 4-1 button
      cy.get('[data-cy=step-4-1-action]').click();
  
      // Choose an outcome
      cy.get('[data-cy=outcome-4-1]').select('Call answered, information shared');
  
      cy.get('[data-cy=step-4-1-note]')
  .should('contain.value', 'Called Taylor Davis at +1-780-311-5279');

  
      // Post the note
      cy.get('[data-cy=step-4-1-post]').click();
  
      // Verify it appears in the logs
      cy.get('[data-cy=log-list]')
      .should('include.text', 'Step 4-1: Called Taylor Davis at +1-780-311-5279. Call answered, information shared');    
    });
  });
  