class AlertsPage {
  // Selectors
  get statusFilterDropdown() {
    return cy.get('[id="mat-select-value-1"]');
  }

  get statusOption() {
    return cy.get(".mdc-list-item__primary-text");
  }

  get statusCells() {
    return cy.get(':nth-child(1) > .cdk-column-status > .ng-star-inserted');
  }

  visitAlertsPage() {
    cy.visit("/ng/alerts");
  }

  selectStatus(status) {
    this.statusFilterDropdown.click();
    this.statusOption.contains(status).click();
    cy.get("body").click(0, 0); // Close dropdown
  }

  validateFilteredStatus(expectedStatus) {
    this.statusCells.each(($cell) => {
      cy.wrap($cell).should("not.contain.text", "Status"); // Ensure it's not the header cell
      cy.wrap($cell).should("contain.text", expectedStatus); // Ensure each cell contains the expected status
    });
  }

  validateNoResults() {
    cy.contains('No results found based on selected search and filter criteria', { timeout: 10000 }).should('be.visible');
    cy.log("✅ No alerts found for the selected status.");
  }
}

export default new AlertsPage();
