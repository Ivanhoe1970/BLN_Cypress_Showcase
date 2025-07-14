describe('Simple Test', () => {
    it('should pass', () => {
      // Just a basic test to verify Cypress is working
      expect(true).to.equal(true);
    });
  
    it('should visit a page', () => {
      cy.visit('https://www.google.com');
      cy.title().should('contain', 'Google');
    });
  });