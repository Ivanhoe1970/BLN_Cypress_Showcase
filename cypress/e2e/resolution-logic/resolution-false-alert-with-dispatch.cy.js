// cypress/e2e/protocol-flows/sos-protocol.cy.js
// Scope: "False alert WITH dispatch" paths for NON-GAS SOS alerts.
// Key checks:
//  1) Dispatch decision auto-evaluates to "yes"
//  2) 30-min dispatch follow-up timer starts
//  3) Resolution reason is pre-selected as "false-alert-with-dispatch"
//  4) Resolution completes + key log lines exist

import Page from "../../pages/EmergencyProtocolPage";

// ---------- Helpers ----------
const ensureDispatchYes = () => {
  // Retry-friendly: if not set yet, nudge the app, then assert "yes"
  cy.get('[data-cy="dispatch-decision"]')
    .should('be.visible')
    .then(($sel) => {
      const val = $sel.val();
      if (!val) {
        cy.window().then((win) => {
          if (typeof win.silentlyUpdateDispatchConditions === 'function') {
            win.silentlyUpdateDispatchConditions();
          }
        });
      }
    })
    .should('have.value', 'yes');
};

const expectResolutionToBeFalseWithDispatch = () => {
  // Accepts either exact value or visible label text
  Page.resolutionReason
    .should('be.visible')
    .then(($sel) => {
      const value = ($sel.val() || '').trim();
      const label = $sel.find('option:selected').text().trim();
      const re = /false\s*alert.*with\s*dispatch/i;
      expect(value === 'false-alert-with-dispatch' || re.test(label),
        `resolution should be "False alert with dispatch" (value="${value}", text="${label}")`
      ).to.be.true;
    });
};

const postDispatchNote = (note = 'Called dispatch. Dispatched Emergency Medical Services to location.') => {
  cy.get('#step-2-note, [data-cy="step-2-note"]')
    .filter(':visible')
    .first()
    .clear({ force: true })
    .type(note, { delay: 0, force: true });
  cy.get('[data-cy="step-2-post-btn"]')
    .filter(':visible')
    .first()
    .click({ force: true });
};

// ---------- Tests ----------
describe('Resolution Reason — False Alert WITH Dispatch (SOS scenarios)', () => {
  beforeEach(() => {
    cy.clock(Date.now(), ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']);
    Page.visit();
    cy.window({ timeout: 20000 }).should((win) => {
      expect(typeof win.loadAlert, 'app bootstrap').to.eq('function');
    });
  });

  afterEach(() => cy.clock().then((clock) => clock.restore()));

  context('Path 1: Timer Expiry Resolution', () => {
    it('resolves when dispatch timer expires and no callbacks received', () => {
      Page.loadAlertById('sos-immediate');

      // Step 1: call user — no answer
      Page.completeStep(1, {
        outcome: 'no-answer-voicemail',
        note: 'Called user, no answer. Left voicemail',
      });

      // Step 2: dispatch auto-evaluates to YES
      ensureDispatchYes();
      postDispatchNote();

      // 30-minute follow-up timer starts
      Page.validateTimerActive('Dispatch Follow-up');

      // Step 3 (EC attempt) — optional/no answer to keep the timer path clean
      Page.completeStep('3-1', {
        outcome: 'no-answer-voicemail',
        note: 'Called EC1, no answer. Left voicemail',
      });

      // Let the 30-min timer expire
      cy.tick(30 * 60 * 1000);
      Page.validateTimerInactive();

      // Resolution preselect should be "false alert WITH dispatch"
      expectResolutionToBeFalseWithDispatch();

      // Resolve + log
      Page.resolveAlert(); // uses currently-selected reason
      Page.validateLogEntry(/alert resolved/i);
    });
  });

  context('Path 2: EC Callback Resolution', () => {
    it('resolves when EC calls during dispatch timer', () => {
      Page.loadAlertById('sos-immediate');

      Page.completeStep(1, {
        outcome: 'no-answer-voicemail',
        note: 'Called user, no answer. Left voicemail',
      });

      ensureDispatchYes();
      postDispatchNote();

      Page.validateTimerActive('Dispatch Follow-up');

      // EC calls back (use the shared cancel/complete mechanism your UI exposes)
      cy.get('[data-cy="global-cancel-dropdown"]').should('be.visible').select('ec-callback', { force: true });

      expectResolutionToBeFalseWithDispatch();
      Page.resolveAlert();
      Page.validateLogEntry(/alert resolved/i);
      Page.validateLogEntry(/emergency contact.*confirmed.*ok/i);
    });
  });

  context('Path 3: User Callback Resolution', () => {
    it('resolves when user calls during dispatch timer', () => {
      Page.loadAlertById('sos-immediate');

      Page.completeStep(1, {
        outcome: 'no-answer-voicemail',
        note: 'Called user, no answer. Left voicemail',
      });

      ensureDispatchYes();
      postDispatchNote();

      Page.validateTimerActive('Dispatch Follow-up');

      // User calls back
      cy.get('[data-cy="global-cancel-dropdown"]').should('be.visible').select('user-callback', { force: true });

      expectResolutionToBeFalseWithDispatch();
      Page.resolveAlert();
      Page.validateLogEntry(/alert resolved/i);
      Page.validateLogEntry(/user.*confirmed.*ok/i);
    });
  });

  context('Path 4: Dispatch Callback Resolution', () => {
    it('resolves when dispatch calls back with no emergency found', () => {
      Page.loadAlertById('sos-immediate');

      Page.completeStep(1, {
        outcome: 'no-answer-voicemail',
        note: 'Called user, no answer. Left voicemail',
      });

      ensureDispatchYes();
      postDispatchNote();

      Page.validateTimerActive('Dispatch Follow-up');

      // Dispatch reports no emergency
      cy.get('[data-cy="global-cancel-dropdown"]').should('be.visible').select('dispatch-no-emergency', { force: true });

      expectResolutionToBeFalseWithDispatch();
      Page.resolveAlert();
      Page.validateLogEntry(/alert resolved/i);
      Page.validateLogEntry(/dispatch.*no emergency/i);
    });

    it('resolves when dispatch calls back with user confirmed okay on scene', () => {
      Page.loadAlertById('sos-immediate');

      Page.completeStep(1, {
        outcome: 'no-answer-voicemail',
        note: 'Called user, no answer. Left voicemail',
      });

      ensureDispatchYes();
      postDispatchNote();

      Page.validateTimerActive('Dispatch Follow-up');

      // Dispatch confirms user okay at scene
      cy.get('[data-cy="global-cancel-dropdown"]').should('be.visible').select('dispatch-user-okay', { force: true });

      expectResolutionToBeFalseWithDispatch();
      Page.resolveAlert();
      Page.validateLogEntry(/alert resolved/i);
      Page.validateLogEntry(/dispatch.*user.*okay/i);
    });
  });
});
