import Page from "../../pages/EmergencyProtocolPage";

describe('Debug - Check What Elements Exist', () => {
  it('should show what elements are actually on the page', () => {
    cy.clock();
    Page.visit();
    Page.loadAlertById('gas-high-threshold');

    // let async renders/timers flush under cy.clock()
    cy.tick(500);

    // Debug: Log all elements with data-cy attributes
    cy.document().then((doc) => {
      const elements = doc.querySelectorAll('[data-cy]');
      console.log(`Found ${elements.length} elements with [data-cy]`);
      elements.forEach(el => {
        console.log(`Found element: [data-cy="${el.getAttribute('data-cy')}"]`);
      });
    });

    // Check what's actually in the gas panel
    cy.get('[data-cy*="gas"], [data-cy*="h2s"], [data-cy*="co"], [data-cy*="o2"]').each(($el) => {
      cy.log(`Gas element: ${$el.attr('data-cy')} - Text: ${$el.text()}`);
    });
  });
});
