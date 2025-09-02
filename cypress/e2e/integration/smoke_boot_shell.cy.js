import Page from "../../pages/EmergencyProtocolPage";

describe("[tier0] App Shell - Initial State", () => {
  beforeEach(() => {
    Page.visit();
    cy.document().its("readyState").should("eq", "complete");
    cy.get("body").should("be.visible");
  });

  it("renders core panels and containers before any alert is loaded", () => {
    cy.get('[data-cy=protocol-log-container]').should('exist');
    cy.get('[data-cy=global-timer]').should('exist');
    cy.get('[data-cy=gas-readings-card]').should('exist');
    cy.get('[data-cy=connectivity-panel]').should('exist');
    cy.get('[data-cy=manual-notes]').should('exist');
    cy.get('[data-cy=protocol-content]').should('exist');
  });
});