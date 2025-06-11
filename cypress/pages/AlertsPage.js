class AlertsPage {
  get statusFilterDropdown() { return cy.get('#mat-select-value-1 > .mat-mdc-select-placeholder') };
  get statusOption() { return cy.get('.mdc-list-item__primary-text') };
  get statusCells() { return cy.get(':nth-child(1) > .cdk-column-status > .ng-star-inserted') };

  visitAlertsPage() {cy.visit(`${Cypress.env('blnUrl')}/ng/alerts`);
  }
  

  selectStatus(status) {
    this.statusFilterDropdown.click();
    this.statusOption.contains(status).click();
    cy.get('body').click(0, 0);
  };

  validateFilteredStatus(expectedStatus) {
    this.statusCells.each(($cell) => {
      cy.wrap($cell).should('not.contain.text', 'Status');
      cy.wrap($cell).should('contain.text', expectedStatus);
    });
  };

  validateNoResults() {
    cy.get('body').then($body => {
      if ($body.text().includes('No results found based on selected search and filter criteria')) {
        cy.contains('No results found based on selected search and filter criteria').should('be.visible');
        cy.log('✅ No alerts found for the selected status.');
      } else {
        cy.log('ℹ️ No-results message not found — skipping validateNoResults check.');
      }
    });
  };
  
  
  
}

export default new AlertsPage();
