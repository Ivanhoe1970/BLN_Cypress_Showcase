describe('Protocol Workflow - Step 3 Dispatch Logic', () => {
    beforeEach(() => {
      cy.visit('http://127.0.0.1:5500/automated-basic-non-gas-alert-protocol/index.html');
    });
  
    it('handles "Yes" dispatch logic and logs correctly', () => {
      // Select "Yes" from dispatch dropdown
      cy.get('[data-cy=can-dispatch-select]').select('Yes');
  
      // Dispatch dropdown should appear
      cy.get('[data-cy=dispatch-type-select]').should('be.visible');
  
      // Select a dispatch type
      cy.get('[data-cy=dispatch-type-select]').select('EMS');
  
      // Click Dispatch button to prefill textarea
      cy.get('[data-cy=dispatch-btn]').click();
  
      // Check that the dispatch note appears in textarea
      cy.get('[data-cy=step-3-note]')
        .should('contain.value', 'Called dispatch, spoke to [Name]. Dispatched EMS to the following location');
  
      // Post the note
      cy.get('[data-cy=step-3-post]').click();
  
      // Check the log contains the correct dispatch message
      cy.get('[data-cy=log-list]')
        .should('contain.text', 'Step 3: Called dispatch, spoke to [Name]. Dispatched EMS to the following location');
    });

    it('handles "No" dispatch logic with skip reasons and logs correctly', () => {
        // Select "No" from dispatch dropdown
        cy.get('[data-cy=can-dispatch-select]').select('No');
      
        // Skip options should appear
        cy.get('[data-cy=skip-reason-1]').should('be.visible');
      
        // Select multiple skip reasons
        cy.get('[data-cy=skip-reason-1]').check();
        cy.get('[data-cy=skip-reason-4]').check(); // "Device is offline"
      
        // Click Skip Dispatch to prefill textarea
        cy.get('[data-cy=skip-dispatch-btn]').click();
      
        // Check that the skip note appears in textarea
        cy.get('[data-cy=step-3-note]')
          .should('contain.value', 'Dispatch skipped due to: Alert older than 24 hours, Device is offline.');
      
        // Post the note
        cy.get('[data-cy=step-3-post]').click();
      
        // Check the log contains the correct skip message
        cy.get('[data-cy=log-list]')
          .should('contain.text', 'Step 3: Dispatch skipped due to: Alert older than 24 hours, Device is offline.');
      });

      it('handles dispatch regardless logic and logs correctly', () => {
        cy.get('[data-cy=can-dispatch-select]').select('Dispatch regardless, as per protocol')
      
        // Dispatch options should appear
        cy.get('[data-cy=dispatch-type-select]').should('be.visible');
      
        // Choose a dispatch type
        cy.get('[data-cy=dispatch-type-select]').select('EMS + Fire');
      
        // Click Dispatch to auto-fill note
        cy.get('[data-cy=dispatch-btn]').click();
      
        // Verify dispatch message is in textarea
        cy.get('[data-cy=step-3-note]')
          .should('contain.value', 'Dispatched EMS + Fire to the following location');
      
        // Post the note
        cy.get('[data-cy=step-3-post]').click();
      
        // Check log contains the correct dispatch note
        cy.get('[data-cy=log-list]')
          .should('contain.text', 'Step 3: Called dispatch, spoke to [Name]. Dispatched EMS + Fire to the following location');
      });
      
  });
  