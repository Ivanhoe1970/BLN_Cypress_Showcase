describe('Gas Alert Protocol - Step Logging Test', () => {
    beforeEach(() => {
      cy.visit('http://127.0.0.1:5500/automated-basic-gas-alert-protocol.html');
    });
  
    it('Step 1 logs default note and starts timer after posting', () => {
      cy.get('[data-cy="step-1"] textarea')
        .should('have.value', '')
        .then(() => {
          cy.get('[data-cy="step-1"] .step-button').click();
          cy.get('[data-cy="step-1-note"]')
            .should('contain.value', 'Sent message to the device');
        });
  
      cy.get('[data-cy="step-1-post"]').click();
  
      cy.get('[data-cy="log-list"]')
        .contains('Step 1: Sent message to the device')
        .should('exist');
  
      cy.get('#step1-timer')
        .should('contain.text', 'Waiting:')
        .should('be.visible');
    });
  
    it("Step 2 logs the specialist's reviewed note", () => {
      cy.get('[data-cy="step-2"] .step-button').click();
      cy.get('[data-cy="step-2-note"]')
        .should('contain.value', "Called user's device. No answer.");
  
      cy.get('[data-cy="step-2-note"]').clear().type("Called user's device. No response at 14:00.");
  
      cy.get('[data-cy="step-2-post"]').click();
      cy.get('[data-cy="log-list"]')
        .contains("Step 2: Called user's device. No response at 14:00.")
        .should('exist');
    });
  
    it('Step 4-1 logs action and selected outcome', () => {
      cy.get('[data-cy=step-4-1-action]').click();
  
      cy.get('[data-cy=step-4-1-note]')
        .should('have.value', 'Called Taylor Davis at +1-780-311-5279');
  
      cy.get('[data-cy=outcome-4-1]').select('Call answered, information shared');
      cy.get('[data-cy=step-4-1-post]').click();
  
      cy.get('[data-cy="log-list"]')
        .should('include.text', 'Step 4-1: Called Taylor Davis at +1-780-311-5279. Call answered, information shared');
    });
  
    it('Step 4-2 logs action and selected outcome', () => {
      cy.get('[data-cy=step-4-2-action]').click();
  
      cy.get('[data-cy=step-4-2-note]')
        .should('have.value', 'Called Jamie Davis at +1-905-829-5863');
  
      cy.get('[data-cy=outcome-4-2]').select('No answer, left voicemail');
      cy.get('[data-cy=step-4-2-post]').click();
  
      cy.get('[data-cy="log-list"]')
        .should('include.text', 'Step 4-2: Called Jamie Davis at +1-905-829-5863. No answer, left voicemail');
    });
  });
  