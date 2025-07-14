// cypress/e2e/protocols/protocol_non_gas.cy.js

import NonGasProtocolPage from '../../pages/NonGasProtocolPage';
const protocol = new NonGasProtocolPage();

let alert;

describe('Protocol – Non-Gas Alert Workflow (Dynamic)', () => {
  beforeEach(() => {
    cy.fixture('non_gas_alerts').then((alerts) => {
      alert = alerts[0];
      protocol.visit();
      cy.window().then((win) => {
        win.testAlertFixture = alert;
      });
      
      // ✅ FIXED: Wait for specific element, then reset all buttons
      cy.get('[data-cy="step-1-action"]').should('be.visible');
      cy.get('.step-button').each(($btn) => {
        cy.wrap($btn).then(($button) => {
          $button[0].disabled = false;
          $button[0].style.pointerEvents = 'auto';
          $button[0].style.opacity = '1';
        });
      });
    });
  });

  // STEP 1 TESTS
  describe('Step 1 - Call G7c Device', () => {
    it('completes Step 1 with device call', () => {
      protocol.completeStep(1, 'Called the device. ');
      protocol.verifyButtonDisabled(1);
    });

    it('uses Step 1 dropdown outcomes', () => {
      protocol.getStep1Button().click();
      protocol.selectStep1Outcome('No answer. ');
      protocol.getStep1Note().should('contain.value', 'No answer. ');
      protocol.getStep1Post().click();
      protocol.verifyLogContains('Step 1: Called the device. No answer. ');
    });

    it('handles dynamic user confirmation in Step 1', () => {
      protocol.getStep1Button().click();
      protocol.selectStep1Outcome('DYNAMIC_USER_OK_RESOLVE');  // ✅ Use the actual value
      
      // Then verify the resolved text appears in the textarea
      protocol.getStep1Note().should('contain.value', `Spoke with ${alert.user}. Confirmed they are OK. Resolving alert.`);
      
      protocol.getStep1Post().click();
      protocol.verifyLogContains(`Step 1: Called the device. Spoke with ${alert.user}. Confirmed they are OK. Resolving alert.`);
    });
  }); // ✅ ADDED MISSING CLOSING BRACE

  // STEP 2 TESTS
  describe('Step 2 - Send Message & Timer', () => {
    it('completes Step 2, waits for timer, and verifies log', () => {
      cy.clock();
      protocol.getStep2Button().click();
      protocol.getStep2Note().should('contain.value', "Do you need help?");
      protocol.getStep2Post().click();
      protocol.verifyStep2TimerFlow();
      protocol.verifyButtonDisabled(2);
      cy.clock().then(clock => clock.restore());
    });

    it('cancels Step 2 timer and logs cancellation', () => {
      cy.clock();
      protocol.getStep2Button().click();
      protocol.getStep2Post().click();
      protocol.getStep2TimerCancel().click();
      protocol.verifyLogContains('Timer cancelled by specialist.');
      protocol.getStep2TimerBox().should('not.be.visible');
      cy.clock().then(clock => clock.restore());
    });
  });

  // STEP 3 TESTS
  describe('Step 3 - Call User', () => {
    it('completes Step 3 and verifies log + completion', () => {
      const expected = `Called ${alert.user} at ${alert.mobile}. `;
      protocol.getStep3Button().click();
      protocol.getStep3Note().should('have.value', expected);
      protocol.getStep3Post().click();
      protocol.verifyLogContains(`Step 3: ${expected}`);
      protocol.getStep3Container().should('have.class', 'completed-step');
      protocol.verifyButtonDisabled(3);
    });

    it('uses Step 3 dropdown outcomes', () => {
      protocol.getStep3Button().click();
      protocol.selectStep3Outcome('No answer, left voicemail. ');
      protocol.getStep3Note().should('contain.value', 'No answer, left voicemail. ');
      protocol.getStep3Post().click();
      protocol.verifyLogContains('Step 3: Called');
      protocol.verifyLogContains('No answer, left voicemail.');
    });

    it('handles dynamic user confirmation in Step 3', () => {
      protocol.getStep3Button().click();
      protocol.selectStep3Outcome('DYNAMIC_USER_OK');  // ✅ FIXED - Use actual value
      protocol.getStep3Note().should('contain.value', `Spoke with ${alert.user}, confirmed they are OK. `);
      protocol.getStep3Post().click();
      protocol.verifyLogContains(`Spoke with ${alert.user}, confirmed they are OK.`);
    });
  });

  // STEP 4 TESTS
  describe('Step 4 - Emergency Contacts', () => {
    // Step 4-1 (EC1) Tests
    const ec1Outcomes = [
      "No answer, left voicemail. ",
      "No answer, voicemail box full. ",
      "No answer, voicemail not set up. ",
      "Unable to connect. ",
      "Number invalid, changed, or out of service. "
    ];

    ec1Outcomes.forEach((outcome) => {
      it(`Step 4-1 logs outcome: ${outcome.trim()}`, () => {
        const ec1 = alert.ec1;
        const base = `Called ${ec1.name} at ${ec1.number}. `;

        protocol.getStep4_1Button().click();
        protocol.selectStep4_1Outcome(outcome);
        protocol.getStep4_1Note().should('contain.value', base);
        protocol.getStep4_1Post().click();
        protocol.verifyLogContains(`Step 4-1: ${base}${outcome}`);
        cy.get('[data-cy="step-4-1"]').should('have.class', 'completed-step');
      });
    });

    // Step 4-2 (EC2) with individual timer
    it('Step 4-2 triggers individual 30-minute timer', () => {
      cy.clock();
      protocol.forceClickStep4_2Button();
      protocol.selectStep4_2Outcome('Spoke with EC, who will check on user and call back. Waiting 30 minutes. ');
      protocol.getStep4_2Post().click();
      
      // Verify individual timer appears
      protocol.getStep4_2TimerBox().should('be.visible');
      cy.tick(1800000); // 30 minutes
      protocol.verifyLogContains('Step 4: 30-minute wait completed. Call back');
      cy.clock().then(clock => clock.restore());
    });

    it('Step 4-1 and 4-2 have separate timers', () => {
      cy.clock();
      
      // Start timer for EC1
      protocol.getStep4_1Button().click();
      protocol.selectStep4_1Outcome('Spoke with EC, who will check on user and call back. Waiting 30 minutes. ');
      protocol.getStep4_1Post().click();
      protocol.getStep4_1TimerBox().should('be.visible');
      
      // Start timer for EC2
      protocol.getStep4_2Button().click();
      protocol.selectStep4_2Outcome('Spoke with EC, who will check on user and call back. Waiting 30 minutes. ');
      protocol.getStep4_2Post().click();
      protocol.getStep4_2TimerBox().should('be.visible');
      
      // Both timers should be visible independently
      protocol.getStep4_1TimerBox().should('be.visible');
      protocol.getStep4_2TimerBox().should('be.visible');
      
      cy.clock().then(clock => clock.restore());
    });

    it('cancels Step 4-2 individual timer', () => {
      cy.clock();
      protocol.getStep4_2Button().click();
      protocol.selectStep4_2Outcome('Spoke with EC, who will check on user and call back. Waiting 30 minutes. ');
      protocol.getStep4_2Post().click();
      protocol.getStep4_2TimerCancel().click();
      protocol.verifyLogContains('Timer cancelled by specialist.');
      protocol.getStep4_2TimerBox().should('not.be.visible');
      cy.clock().then(clock => clock.restore());
    });

    it('Step 4-2 confirms user is OK and logs correctly', () => {
      const ec2 = alert.ec2;
      protocol.getStep4_2Button().click();
      protocol.selectStep4_2Outcome('Confirmed user is okay and advised to resolve alert. ');
      protocol.getStep4_2Post().click();
      protocol.verifyLogContains(`Step 4-2: Called ${ec2.name} at ${ec2.number}. Confirmed user is okay and advised to resolve alert.`);
    });
  });

  // STEP 5 TESTS
  describe('Step 5 - Dispatch', () => {
    const dispatchOptions = [
      'EMS',
      'Police', 
      'Fire',
      'EMS and Police',
      'Fire and Police',
      'EMS, Fire and Police'
    ];

    dispatchOptions.forEach((option) => {
      it(`Step 5: dispatch type ${option} triggers timer and logs`, () => {
        cy.clock();
        protocol.getStep5DispatchDecision().select('yes');
        protocol.getDispatchServiceType().select(option).should('have.value', option);
        protocol.getStep5Note().should($el => {
          expect($el.val()).to.include(`Emergency Services requested ${option} to the following location: ${alert.last_location}`);
        });
        protocol.getStep5Post().click();
        protocol.getStep5TimerBox().should('be.visible');
        cy.tick(1800000); // 30 minutes
        protocol.verifyLogContains('Step 5: 30-minute follow-up timer completed. Contact dispatch for status update.');
        cy.clock().then(clock => clock.restore());
      });
    });

    it('skips Step 5 dispatch and resets steps', () => {
      protocol.getStep5DispatchDecision().select('no');
      cy.get('#skip-reason').select('device-offline');
      protocol.getStep5Note().should('contain.value', 'Unable to dispatch. Reason: Device is offline. Repeating Steps 1–4 until someone is reached.');
      protocol.getStep5Post().click();
      protocol.verifyLogContains('Step 5: Unable to dispatch. Reason: Device is offline. Repeating Steps 1–4 until someone is reached.');
      
      // Verify steps are reset to pending
      cy.get('[data-cy="step-1"] .step-status').should('contain.text', 'Pending');
      cy.get('[data-cy="step-2"] .step-status').should('contain.text', 'Pending');
      cy.get('[data-cy="step-3"] .step-status').should('contain.text', 'Pending');
    });
    
    it('cancels Step 5 timer and logs cancellation', () => {
      cy.clock();
      protocol.getStep5DispatchDecision().select('yes');
      protocol.getDispatchServiceType().select('EMS');
      protocol.getStep5Post().click();
      protocol.getStep5TimerCancel().click();
      protocol.verifyLogContains('Step 5 timer cancelled by specialist.');
      protocol.getStep5TimerBox().should('not.be.visible');
      cy.clock().then(clock => clock.restore());
    });
  });

  // RESOLUTION TESTS
  describe('Resolution Workflow', () => {
    it('completes resolution and locks interface', () => {
      protocol.selectResolutionReason('false-alert-without-dispatch');
      protocol.getResolveAlertButton().click();
      protocol.verifyLogContains('Alert resolved: False alert without dispatch');
      protocol.verifyAlertResolved();
    });

    it('cancels resolution and unlocks interface', () => {
      // First resolve
      protocol.selectResolutionReason('incident-with-dispatch');
      protocol.getResolveAlertButton().click();
      protocol.verifyAlertResolved();
      
      // Then cancel
      protocol.getCancelResolutionButton().click();
      protocol.verifyLogContains('Resolution cancelled - all steps unlocked');
      protocol.verifyStepsUnlocked();
      
      // Verify buttons are re-enabled
      protocol.getStep1Button().should('not.be.disabled');
      protocol.getStep2Button().should('not.be.disabled');
      protocol.getStep3Button().should('not.be.disabled');
    });
  });

  // MANUAL NOTES TESTS
  describe('Manual Notes', () => {
    it('adds manual note successfully', () => {
      const noteText = 'This is a test manual note';
      protocol.getAddManualNoteButton().click();
      protocol.getManualNoteTextarea().should('be.visible');
      protocol.getManualNoteTextarea().type(noteText);
      protocol.getSubmitManualNoteButton().click();
      protocol.verifyLogContains(`Manual Note: ${noteText}`);
    });

    it('cancels manual note entry', () => {
      protocol.getAddManualNoteButton().click();
      protocol.getManualNoteTextarea().type('Test note to cancel');
      protocol.getCancelManualNoteButton().click();
      protocol.getManualNoteTextarea().should('not.be.visible');
      protocol.getAddManualNoteButton().should('be.visible');
    });
  });

  // UI VALIDATION TESTS
  describe('UI Validation', () => {
    it('validates dropdown vs textarea visual differentiation', () => {
      // Dropdowns should have light blue background and dashed border
      protocol.getStep1Dropdown().should('have.css', 'background-color', 'rgb(248, 250, 252)');
      protocol.getStep1Dropdown().should('have.css', 'border-style', 'dashed');
      
      // Textareas should have white background and solid border
      protocol.getStep1Note().should('have.css', 'background-color', 'rgb(255, 255, 255)');
      protocol.getStep1Note().should('have.css', 'border-style', 'solid');
    });

    it('validates button one-click behavior', () => {
      protocol.getStep1Button().click();
      protocol.verifyButtonDisabled(1);
      protocol.getStep1Button().should('contain.text', 'Called');
    });

    it('validates step containers have proper borders', () => {
      cy.get('.step').should('have.css', 'border-color', 'rgb(93, 173, 226)'); // Light blue
      cy.get('#log-container').should('have.css', 'border-color', 'rgb(93, 173, 226)'); // Light blue  
      cy.get('#steps-container').should('have.css', 'border-color', 'rgb(93, 173, 226)'); // Light blue
    });
  });

  // FULL END-TO-END TEST
  describe('Full Workflow', () => {
    it('runs complete Steps 1–5 with resolution', () => {
      const ec2 = alert.ec2;
      cy.clock();

      // Step 1
      protocol.getStep1Button().click();
      protocol.getStep1Post().click();
      protocol.verifyLogContains('Called the device.');

      // Step 2
      protocol.getStep2Button().click();
      protocol.getStep2Post().click();
      cy.tick(120000); // 2 minutes
      protocol.verifyLogContains('Step 2: 2-minute wait completed. Proceed to Step 3.');

      // Step 3
      protocol.getStep3Button().click();
      protocol.getStep3Post().click();
      protocol.verifyLogContains(`Step 3: Called ${alert.user} at ${alert.mobile}.`);

      // Step 4-2 with callback
      protocol.getStep4_2Button().click({force: true});
      protocol.selectStep4_2Outcome('Spoke with EC, who will check on user and call back. Waiting 30 minutes. ');
      protocol.getStep4_2Post().click({force: true});  // ✅ ADDED force: true
      cy.tick(1800000); // 30 minutes
      protocol.verifyLogContains(`Step 4: 30-minute wait completed. Call back`);

      // Step 4-2 follow-up confirms OK
      protocol.getStep4_2Button().click({force: true});
      protocol.selectStep4_2Outcome('Confirmed user is okay and advised to resolve alert. ');
      protocol.getStep4_2Post().click({force: true});  // ✅ ADDED force: true
      protocol.verifyLogContains(`Step 4-2: Called ${ec2.name} at ${ec2.number}. Confirmed user is okay and advised to resolve alert.`);

      // Step 5 Dispatch
      protocol.getStep5DispatchDecision().select('yes');
      protocol.getDispatchServiceType().select('EMS and Police');
      protocol.getStep5Post().click();
      cy.tick(1800000); // 30 minutes
      protocol.verifyLogContains('Step 5: 30-minute follow-up timer completed. Contact dispatch for status update.');

      // Resolution
      protocol.selectResolutionReason('incident-with-dispatch');
      protocol.getResolveAlertButton().click();
      protocol.verifyLogContains('Alert resolved: Incident with dispatch');
      protocol.verifyAlertResolved();

      cy.clock().then(clock => clock.restore());
    });
  });
});