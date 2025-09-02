import EmergencyProtocolPage from '../../pages/EmergencyProtocolPage';

// Helper: lenient but meaningful — a skipped step should appear blocked by ANY signal:
// - visually dimmed (opacity < 0.95) OR
// - pointer-events: none OR
// - no visible "start" buttons (data-cy="*-button" or onclick*="startStep")
const assertSkippedStepsDisabled = () => {
  cy.get('#protocol-content .step:visible').each(($el) => {
    const status = ($el.find('[data-cy$="-status"], .status-badge').first().text() || '')
      .toLowerCase();

    if (!status.includes('skipped')) return;

    const op = parseFloat($el.css('opacity') || '1');
    const dimmed = op < 0.95;
    const peNone = ($el.css('pointer-events') || '').toLowerCase() === 'none';
    const noStartButtons =
      $el.find('[data-cy$="-button"]:visible, button[onclick*="startStep"]:visible').length === 0;

    const looksBlocked = dimmed || peNone || noStartButtons;
    expect(looksBlocked, 'skipped step appears blocked').to.be.true;
  });
};

describe('Emergency Contacts Sub-Steps', () => {
  beforeEach(() => {
    EmergencyProtocolPage.visit();
    cy.wait(500);
  });

  // --- Structure & sequencing -------------------------------------------------

  describe('Sub-Step Structure and Progression', () => {
    it('should display EC sub-steps; group active, sub-steps pending', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();

      // Fall Detection: step 1 is combined → use sub:1
      EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: 'no-answer', note: 'No answer' });
      EmergencyProtocolPage.completeStep(2, { outcome: 'no-response', note: 'No response' });

      cy.get('[data-cy="step-3-1"]').should('be.visible');
      cy.get('[data-cy="step-3-2"]').should('be.visible');

      // Group 3 is Active, sub-steps are Pending until engaged
      EmergencyProtocolPage.validateStepStatus('step-3', 'Active');
      EmergencyProtocolPage.validateStepStatus('step-3-1', 'Pending');
      EmergencyProtocolPage.validateStepStatus('step-3-2', 'Pending');
    });

    it('should make next EC sub-step available (Pending) after completing the previous', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();

      EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: 'no-answer', note: 'No answer' });
      EmergencyProtocolPage.completeStep(2, { outcome: 'no-response', note: 'No response' });

      // Complete EC #1 -> EC #2 becomes available (Pending) for engagement
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'no-answer-voicemail',
        note: 'Left voicemail for EC1'
      });

      EmergencyProtocolPage.validateStepStatus('step-3-1', 'Completed');
      EmergencyProtocolPage.validateStepStatus('step-3-2', 'Pending'); // not auto-Active
    });
  });

  // --- Resolution outcomes (prepared, not auto-completed) ---------------------

  describe('Emergency Contact Resolution Outcomes', () => {
    beforeEach(() => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();
      EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: 'no-answer', note: 'No answer' });
      EmergencyProtocolPage.completeStep(2, { outcome: 'no-response', note: 'No response' });
    });

    it('prepares resolution when EC confirms user is okay (not auto-completed)', () => {
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'confirmed-ok',
        note: 'EC confirmed user is okay'
      });

      // Future steps marked skipped
      EmergencyProtocolPage.validateStepStatus('step-3-2', 'Skipped');
      EmergencyProtocolPage.validateStepStatus('step-4', 'Skipped');

      // Resolution prepared (reason set, button enabled); NOT completed yet
      EmergencyProtocolPage.resolutionReason.should('have.value', 'false-alert-without-dispatch');
      EmergencyProtocolPage.resolveAlertButton.should('be.enabled');
      EmergencyProtocolPage.resolutionStatus
        .invoke('text')
        .then(t => expect((t || '').toLowerCase()).to.not.include('completed'));

      // Skipped steps appear blocked by at least one signal
      assertSkippedStepsDisabled();
    });

    it('prepares resolution when user calls back during EC step (not auto-completed)', () => {
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'user-callback',
        note: 'User called in, confirmed okay'
      });

      EmergencyProtocolPage.validateStepStatus('step-3-2', 'Skipped');
      EmergencyProtocolPage.validateStepStatus('step-4', 'Skipped');

      EmergencyProtocolPage.resolveAlertButton.should('be.enabled');
      EmergencyProtocolPage.resolutionStatus
        .invoke('text')
        .then(t => expect((t || '').toLowerCase()).to.not.include('completed'));

      assertSkippedStepsDisabled();
    });

    it('prepares resolution when EC calls back confirming safety (not auto-completed)', () => {
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'ec-callback',
        note: 'EC called back, user safe'
      });

      EmergencyProtocolPage.validateStepStatus('step-3-2', 'Skipped');
      EmergencyProtocolPage.validateStepStatus('step-4', 'Skipped');

      EmergencyProtocolPage.resolveAlertButton.should('be.enabled');
      EmergencyProtocolPage.resolutionStatus
        .invoke('text')
        .then(t => expect((t || '').toLowerCase()).to.not.include('completed'));

      assertSkippedStepsDisabled();
    });
  });

  // --- 30-minute callback timer ----------------------------------------------

  describe('30-Minute Callback Timer Scenarios', () => {
    beforeEach(() => {
      cy.clock(Date.now(), ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']);
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();
      EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: 'no-answer', note: 'No answer' });
      EmergencyProtocolPage.completeStep(2, { outcome: 'no-response', note: 'No response' });
    });

    it('starts 30-minute timer when EC agrees to check and call back', () => {
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'ec-callback-30min-outbound',
        note: 'EC will check and call back'
      });

      EmergencyProtocolPage.validateTimerActive('EC Callback');
      EmergencyProtocolPage.validateStepStatus('step-3-1', 'Waiting');
    });

    it('cancels timer early when EC calls back and prepares resolution', () => {
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'ec-callback-30min-outbound',
        note: 'EC will check and call back'
      });

      EmergencyProtocolPage.validateTimerActive();
      EmergencyProtocolPage.cancelTimer('ec-callback');

      EmergencyProtocolPage.validateTimerInactive();
      EmergencyProtocolPage.validateStepStatus('step-3-2', 'Skipped');
      EmergencyProtocolPage.validateStepStatus('step-4', 'Skipped');

      EmergencyProtocolPage.resolveAlertButton.should('be.enabled');
      EmergencyProtocolPage.resolutionStatus
        .invoke('text')
        .then(t => expect((t || '').toLowerCase()).to.not.include('completed'));

      assertSkippedStepsDisabled();
    });

    it('proceeds to the next EC when callback timer expires', () => {
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'ec-callback-30min-outbound',
        note: 'EC will check and call back'
      });

      EmergencyProtocolPage.waitForTimerExpiry(1800);

      // After expiry: EC2 becomes available but not auto-started
      EmergencyProtocolPage.validateStepStatus('step-3-2', 'Pending');
      EmergencyProtocolPage.validateStepStatus('step-4', 'Active');
    });
  });

  // --- Contact attempt outcomes ----------------------------------------------

  describe('Contact Attempt Outcomes', () => {
    beforeEach(() => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();
      EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: 'no-answer', note: 'No answer' });
      EmergencyProtocolPage.completeStep(2, { outcome: 'no-response', note: 'No response' });
    });

    it('handles no answer and makes next EC available', () => {
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'no-answer-voicemail',
        note: 'Left voicemail'
      });

      EmergencyProtocolPage.validateStepStatus('step-3-1', 'Completed');
      EmergencyProtocolPage.validateStepStatus('step-3-2', 'Pending');
    });

    it('handles wrong-number outcome', () => {
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'wrong-number',
        note: 'Wrong number'
      });

      EmergencyProtocolPage.validateStepStatus('step-3-1', 'Completed');
      EmergencyProtocolPage.validateStepStatus('step-3-2', 'Pending');
    });

    it('handles unable-to-connect outcome', () => {
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'unable-to-connect',
        note: 'Unable to connect'
      });

      EmergencyProtocolPage.validateStepStatus('step-3-1', 'Completed');
      EmergencyProtocolPage.validateStepStatus('step-3-2', 'Pending');
    });
  });

  // --- All ECs exhausted ------------------------------------------------------

  describe('All Emergency Contacts Exhausted', () => {
    beforeEach(() => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();
      EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: 'no-answer', note: 'No answer' });
      EmergencyProtocolPage.completeStep(2, { outcome: 'no-response', note: 'No response' });
    });

    it('activates Dispatch when all ECs are unreachable', () => {
      EmergencyProtocolPage.completeEmergencyContact('step-3-1', {
        outcome: 'no-answer-voicemail',
        note: 'EC1 no answer'
      });

      EmergencyProtocolPage.completeEmergencyContact('step-3-2', {
        outcome: 'wrong-number',
        note: 'EC2 wrong number'
      });

      EmergencyProtocolPage.validateStepStatus('step-3', 'Completed');
      EmergencyProtocolPage.validateStepStatus('step-4', 'Active');
    });
  });

  // --- Info display -----------------------------------------------------------

  describe('Emergency Contact Information Display', () => {
    it('shows contact information for each EC sub-step', () => {
      EmergencyProtocolPage.openDemoPanel();
      cy.get('[data-cy="fall-detection-test-btn"]').click();

      EmergencyProtocolPage.completeStep(1, { sub: 1, outcome: 'no-answer', note: 'No answer' });
      EmergencyProtocolPage.completeStep(2, { outcome: 'no-response', note: 'No response' });

      cy.get('[data-cy="step-3-1-contact-info"]').should('be.visible');
      cy.get('[data-cy="step-3-2-contact-info"]').should('be.visible');
    });
  });
});
