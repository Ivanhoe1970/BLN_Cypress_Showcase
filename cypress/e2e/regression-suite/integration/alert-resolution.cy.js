import Page from "../../../pages/EmergencyProtocolPage";

describe('Alert Resolution Integration', () => {
  beforeEach(() => {
    cy.clock();
    Page.visit();
  });

  afterEach(() => {
    cy.clock().then((clock) => clock.restore());
    Page.clearAlert();
  });

  it('should complete full resolution workflow for non-gas alert', () => {
    Page.loadAlertById('fall-detection');

    cy.tick(2000);

    cy.get('[data-cy="resolution-reason"] option[value="false-alert-without-dispatch"]')
      .should('exist');
    cy.get('[data-cy="resolution-reason"]').select('false-alert-without-dispatch');
    cy.get('[data-cy="resolve-alert-btn"]').click();

    Page.validateLogEntry(/Alert resolved/i);
  });

  it('should handle resolution with required fields validation', () => {
    Page.loadAlertById('no-motion');

    cy.get('[data-cy="resolution-section"]').should('be.visible');
    cy.get('[data-cy="resolution-reason"]').should('exist');

    cy.get('[data-cy="resolution-reason"]').select('false-alert-without-dispatch');
    cy.get('[data-cy="resolve-alert-btn"]').click();

    Page.validateLogEntry(/Alert resolved/i);
  });

  it('should maintain audit trail through resolution', () => {
    Page.loadAlertById('sos-immediate');
  
    // Enable dispatch and pick a service
    cy.get('#dispatch-decision', { timeout: 10000 })
      .should('be.visible')
      .select('yes')
      .should('have.value', 'yes');
  
    cy.get('#dispatch', { timeout: 10000 })
      .should('be.visible')
      .select('Fire Department');
  
    // Sanity: service actually selected
    cy.get('#dispatch option:selected')
      .invoke('text')
      .should('match', /fire department/i);
  
    // Resolution: false alert WITH dispatch
    cy.get('[data-cy="resolution-reason"] option[value="false-alert-with-dispatch"]')
      .should('exist');
    cy.get('[data-cy="resolution-reason"]').select('false-alert-with-dispatch');
    cy.get('[data-cy="resolve-alert-btn"]').click();
  
    // Verify resolution UI completed (avoid brittle log text for "dispatch")
    cy.get('[data-cy="resolution-section"]')
      .should('contain.text', 'Completed')
      .and('contain.text', 'False alert with dispatch');
  
    // Lifecycle log entries that are stable
    Page.validateLogEntry(/Alert triggered by device/i);
    Page.validateLogEntry(/Alert received by server/i);
    Page.validateLogEntry(/Alert acknowledged/i);
    Page.validateLogEntry(/Alert resolved/i);
  });
    
  it('should handle resolution cancellation', () => {
    Page.loadAlertById('fall-detection');
  
    // ensure resolution UI is initialized (you’re using cy.clock)
    cy.tick(2000);
  
    cy.get('[data-cy="resolution-reason"]', { timeout: 10000 })
      .should('be.visible')
      .select('false-alert-without-dispatch');
  
    // tiny tick to let any re-render finish, then click a *stable* reference
    cy.tick(0);
    cy.get('[data-cy="cancel-resolution-btn"]', { timeout: 10000 })
      .should('be.visible')
      .then($btn => cy.wrap($btn).click());
  
    // Dropdown is reset by cancel
    cy.get('[data-cy="resolution-reason"]').should('have.value', '');
  });  

  it('should validate gas override resolution workflow', () => {
    Page.loadAlertById('gas-high-threshold');
  
    // Choose any valid reason; gas HIGH will force an override before finalizing
    cy.get('[data-cy="resolution-reason"]')
      .should('be.visible')
      .select('incident-without-dispatch');
  
    // Open the override modal via the visible Resolve button (avoid hidden demo-panel buttons)
    cy.get('[data-cy="resolve-alert-btn"]', { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click();
  
    // Complete the override
    cy.get('[data-cy="override-modal"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="override-reason"]').should('be.visible').select('user-confirmed-safety');
    cy.get('[data-cy="confirm-override"]').should('not.be.disabled').click();
  
    // Verify override path completed
    Page.validateLogEntry(/override/i);
    Page.validateLogEntry(/Alert resolved/i);
  });
    
  it('should handle automatic resolution prefill', () => {
    Page.loadAlertById('pre-alert-test');

    // Auto-prefill is to set the select value to "pre-alert"
    cy.get('[data-cy="resolution-reason"]', { timeout: 5000 })
      .should('have.value', 'pre-alert');

    // Visual cue for pre-alert styling also appears
    cy.get('[data-cy="resolution-section-pre-alert"]').should('exist');

    // Resolve
    cy.get('[data-cy="resolve-alert-btn"]').click();

    // Verify both the system pre-alert entry and final resolution appear
    Page.validateLogEntry(/Pre-alert\s*-\s*alert triggered/i);
    Page.validateLogEntry(/Alert resolved/i);
  });
});
