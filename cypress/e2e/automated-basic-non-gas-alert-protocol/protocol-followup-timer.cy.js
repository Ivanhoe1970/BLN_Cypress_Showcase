describe('Protocol Workflow - Follow-Up Timer Flow', () => {
    beforeEach(() => {
      cy.visit('http://127.0.0.1:5500/automated-basic-non-gas-alert-protocol/index.html');
    });
  
    it('starts, counts down, and logs the 30-minute follow-up timer correctly', () => {
      // Click the start timer button
      cy.get('[data-cy=start-timer-btn]').click();
  
      // Verify timer appears and shows countdown starting at 10
      cy.get('[data-cy=follow-up-container]').should('be.visible');
      cy.get('[data-cy=follow-up-countdown]').should('contain.text', '10');
  
      // Wait for timer to finish (10s max)
      cy.wait(11000);
  
      // Ensure timer is hidden and final log is recorded
      cy.get('[data-cy=follow-up-container]').should('not.be.visible');
      cy.get('[data-cy=log-list]')
        .should('contain.text', 'Follow-up time reached. Call Emergency Contact back.');
    });
  
    it('cancels the follow-up timer and logs it', () => {
      cy.get('[data-cy=start-timer-btn]').click();
  
      // Ensure countdown has started
      cy.get('[data-cy=follow-up-countdown]').should('exist');
  
      // Cancel it early
      cy.wait(3000);
      cy.get('[data-cy=cancel-timer-btn]').click();
  
      // Confirm cancellation log
      cy.get('[data-cy=log-list]')
        .should('contain.text', 'Follow-up canceled — Emergency Contact called back.');
  
      // Confirm UI is hidden
      cy.get('[data-cy=follow-up-container]').should('not.be.visible');
    });
  });
  