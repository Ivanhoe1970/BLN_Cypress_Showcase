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
    });
  });

  // STEP 1
  it('completes Step 1 using helper', () => {
    protocol.completeStep(1, 'Called the device.');
  });

  // STEP 2
  it('completes Step 2, waits for timer, and verifies log', () => {
    cy.clock();
    protocol.getStep2Button().click();
    protocol.getStep2Note().should('contain.value', "Do you need help?");
    protocol.getStep2Post().click();
    protocol.verifyStep2TimerFlow();
    cy.clock().then(clock => clock.restore());
  });

  it('cancels Step 2 timer and logs cancellation', () => {
    cy.clock();
    protocol.getStep2Button().click();
    protocol.getStep2Post().click();
    protocol.getStep2TimerCancel().click();
    protocol.verifyLogContains('Timer cancelled by specialist.');
    protocol.getStep2TimerBox().should('not.be.visible');
  });

  // STEP 3
  it('completes Step 3 and verifies log + completion', () => {
    cy.then(() => {
      const expected = `Called ${alert.user} at ${alert.mobile}.`;
      protocol.getStep3Button().click();
      protocol.getStep3Note().should('have.value', expected);
      protocol.getStep3Post().click();
      protocol.verifyLogContains(`Step 3: ${expected}`);
      protocol.getStep3Container().should('have.class', 'completed-step');
    });
  });

  // STEP 4 – EC1 (Negative Outcomes)
  const ec1Outcomes = [
    "No answer, left voicemail.",
    "No answer, voicemail box full.",
    "No answer, voicemail box not set up.",
    "Unable to connect.",
    "Number invalid, changed, or out of service."
  ];

  ec1Outcomes.forEach((outcome) => {
    it(`Step 4-1 logs outcome: ${outcome}`, () => {
      const ec1 = alert.ec1;
      const base = `Called ${ec1.name} at ${ec1.number}`;

      cy.visit(Cypress.env('protocolPath'));
      cy.get('[data-cy="step-4-1"] .step-button').click();
      cy.get('[data-cy="outcome-4-1"]').select(outcome);
      cy.get('[data-cy="step-4-1-note"]').should('contain.value', base);
      cy.get('#step-4-1 .post-note-button').click();
      protocol.verifyLogContains(`Step 4-1: ${base}. ${outcome}`);
      cy.get('[data-cy="step-4-1"]').should('have.class', 'completed-step');
    });
  });

  // STEP 4 – EC2 (Timer + Follow-up)
  it('Step 4-2 triggers 30-minute timer with EC callback', () => {
    const ec2 = alert.ec2;
    cy.clock();
    protocol.getStep4_2Button().click();
    protocol.selectStep4_2Outcome('Spoke with EC, who will check on user and call back. Waiting 30 minutes.');
    protocol.getStep4_2Post().click();
    protocol.getStep4TimerBox().should('be.visible');
    cy.tick(10000);
    protocol.verifyLogContains(`Step 4: 30-minute wait completed. Call back ${ec2.name} at ${ec2.number}. | Op 417`);
  });

  it('Step 4-2 confirms user is OK and logs correctly', () => {
    const ec2 = alert.ec2;
    cy.clock();
    protocol.getStep4_2Button().click();
    protocol.selectStep4_2Outcome('Spoke with EC, who will check on user and call back. Waiting 30 minutes.');
    protocol.getStep4_2Post().click();
    cy.tick(10000);
    protocol.getStep4_2Button().click();
    protocol.selectStep4_2Outcome('Spoke with EC, confirmed user is OK.');
    protocol.getStep4_2Post().click();
    protocol.verifyLogContains(`Step 4-2: Called ${ec2.name} at ${ec2.number}. Spoke with EC, confirmed user is OK.`);
  });

  it('cancels Step 4 timer and logs cancellation', () => {
    cy.clock();
    protocol.getStep4_2Button().click();
    protocol.selectStep4_2Outcome('Spoke with EC, who will check on user and call back. Waiting 30 minutes.');
    protocol.getStep4_2Post().click();
    protocol.getStep4TimerCancel().click();
    protocol.verifyLogContains('Timer cancelled by specialist.');
    protocol.getStep4TimerBox().should('not.be.visible');
  });

  // STEP 5 – Dispatch flow
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
        expect($el.val()).to.include(`requested ${option} to the following location: ${alert.last_location}`);
      });
      protocol.getStep5Post().click();
      protocol.getStep5TimerBox().should('be.visible');
      cy.tick(10000);
      protocol.verifyLogContains('Step 5: 30-minute follow-up due. Call dispatch to check on outcome.');
    });
  });

  it('skips Step 5 dispatch and logs reason', () => {
    protocol.getStep5DispatchDecision().select('no');
    cy.get('#skip-reason').select('Device is offline', { force: true });
    protocol.getStep5Post().click();
    protocol.verifyLogContains(
      'Step 5: Unable to dispatch. Reason: Device is offline. Repeating Steps 1–4 until someone is reached. | Op 417'
    );
  });
  
  
  it('cancels Step 5 timer and logs cancellation', () => {
    cy.clock();
    protocol.getStep5DispatchDecision().select('yes');
    protocol.getDispatchServiceType().select('EMS');
    protocol.getStep5Post().click();
    protocol.getStep5TimerCancel().click();
    protocol.verifyLogContains('Timer cancelled by specialist.');
    protocol.getStep5TimerBox().should('not.be.visible');
  });

  // FULL CHAIN
it('runs full Steps 1–5 with resolution', () => {
  const ec2 = alert.ec2;
  cy.clock();

  // Step 1
  protocol.getStep1Button().click();
  protocol.getStep1Post().click();
  protocol.verifyLogContains('Step 1: Called the device.');

  // Step 2
  protocol.getStep2Button().click();
  protocol.getStep2Post().click();
  cy.tick(10000);
  protocol.verifyLogContains('Step 2: 2-minute wait completed. Proceed to Step 3.');

  // Step 3
  protocol.getStep3Button().click();
  protocol.getStep3Post().click();
  protocol.verifyLogContains(`Step 3: Called ${alert.user} at ${alert.mobile}.`);

  // Step 4-2 with callback
  protocol.getStep4_2Button().click();
  protocol.selectStep4_2Outcome('Spoke with EC, who will check on user and call back. Waiting 30 minutes.');
  protocol.getStep4_2Post().click();
  cy.tick(10000);
  protocol.verifyLogContains(`Step 4: 30-minute wait completed. Call back ${ec2.name} at ${ec2.number}. | Op 417`);

  // Step 4-2 follow-up confirms OK
  protocol.getStep4_2Button().click();
  protocol.selectStep4_2Outcome('Spoke with EC, confirmed user is OK.');
  protocol.getStep4_2Post().click();
  protocol.verifyLogContains(`Step 4-2: Called ${ec2.name} at ${ec2.number}. Spoke with EC, confirmed user is OK.`);

  // Step 5 Dispatch
  protocol.getStep5DispatchDecision().select('yes');
  protocol.getDispatchServiceType().select('EMS and Police');
  protocol.getStep5Post().click();
  cy.tick(10000);
  protocol.verifyLogContains('Step 5: 30-minute follow-up due. Call dispatch to check on outcome.');

  // ✅ Resolution using value attribute
  cy.get('[data-cy="resolution-reason"]').first().select('incident-with-dispatch');
cy.get('[data-cy="resolution-reason"]').should('have.value', 'incident-with-dispatch'); // Wait for selection to complete
protocol.getResolveAlertButton().click();
});

});
