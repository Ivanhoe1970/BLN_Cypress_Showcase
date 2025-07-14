import EmergencyProtocolPage from '../../../pages/EmergencyProtocolPage';

describe('Protocol Workflow - Follow-Up Timer Flow', () => {
    beforeEach(() => {
        EmergencyProtocolPage.visit();
        EmergencyProtocolPage.loadFixture('alerts.json');
    });

    it('starts 30-minute EC callback timer and validates countdown', () => {
        // Mock the clock to control time
        cy.clock();

        // Complete steps to trigger EC callback timer
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('no-answer-voicemail');

        // Complete Step 4-1 with "waiting 30 minutes" to trigger timer
        EmergencyProtocolPage.step41Button.click();
        EmergencyProtocolPage.step41Outcome.select('waiting-30-minutes');
        EmergencyProtocolPage.step41PostButton.click();

        // Verify global timer activates
        EmergencyProtocolPage.validateTimerActive('EC Callback');
        EmergencyProtocolPage.timerInfo.should('contain.text', 'Daniel Reyes');

        // Verify timer shows 30:00 initially
        EmergencyProtocolPage.timerDisplay.should('contain.text', '30:00');

        // Advance time by 5 minutes and verify countdown
        cy.tick(300000); // 5 minutes = 300,000ms
        EmergencyProtocolPage.timerDisplay.should('contain.text', '25:00');

        // Advance time by another 10 minutes
        cy.tick(600000); // 10 minutes = 600,000ms
        EmergencyProtocolPage.timerDisplay.should('contain.text', '15:00');

        // Verify log entry for timer start
        EmergencyProtocolPage.validateLogEntry('Started 30-minute timer: EC Callback for Daniel Reyes');
    });

    it('completes 30-minute timer and triggers expiration notification', () => {
        cy.clock();

        // Start EC callback timer
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('no-answer-voicemail');
        EmergencyProtocolPage.step41Button.click();
        EmergencyProtocolPage.step41Outcome.select('waiting-30-minutes');
        EmergencyProtocolPage.step41PostButton.click();

        // Verify timer is active
        EmergencyProtocolPage.validateTimerActive('EC Callback');

        // Fast forward to completion (30 minutes = 1,800,000ms)
        cy.tick(1800000);

        // Verify timer expiration notification appears
        cy.get('#timerNotification').should('be.visible');
        cy.get('#timerNotificationText').should('contain.text', 'EC Callback timer has expired');

        // Verify timer expiration is logged
        EmergencyProtocolPage.validateLogEntry('TIMER EXPIRED: EC Callback for Daniel Reyes');

        // Dismiss notification
        cy.get('[data-cy="dismiss-timer-notification"]').click();
        cy.get('#timerNotification').should('not.be.visible');
    });

    it('tests timer alert state in final 5 minutes', () => {
        cy.clock();

        // Start timer
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('no-answer-voicemail');
        EmergencyProtocolPage.step41Button.click();
        EmergencyProtocolPage.step41Outcome.select('waiting-30-minutes');
        EmergencyProtocolPage.step41PostButton.click();

        // Advance to 26 minutes (4 minutes remaining - should trigger alert)
        cy.tick(1560000); // 26 minutes = 1,560,000ms
        EmergencyProtocolPage.timerDisplay.should('contain.text', '04:00');

        // Verify timer enters alert state (red flashing)
        EmergencyProtocolPage.globalTimer.should('have.class', 'timer-alert');

        // Advance to 1 minute remaining
        cy.tick(180000); // 3 more minutes = 180,000ms
        EmergencyProtocolPage.timerDisplay.should('contain.text', '01:00');

        // Timer should still be in alert state
        EmergencyProtocolPage.globalTimer.should('have.class', 'timer-alert');
    });

    it('cancels active timer and logs cancellation', () => {
        cy.clock();

        // Start timer
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('no-answer-voicemail');
        EmergencyProtocolPage.step41Button.click();
        EmergencyProtocolPage.step41Outcome.select('waiting-30-minutes');
        EmergencyProtocolPage.step41PostButton.click();

        // Verify timer is active
        EmergencyProtocolPage.validateTimerActive('EC Callback');

        // Advance time by 5 minutes
        cy.tick(300000);
        EmergencyProtocolPage.timerDisplay.should('contain.text', '25:00');

        // Cancel the timer
        EmergencyProtocolPage.cancelTimerButton.click();

        // Verify timer is deactivated
        EmergencyProtocolPage.validateTimerInactive();

        // Verify cancellation is logged
        EmergencyProtocolPage.validateLogEntry('Cancelled timer: EC Callback');
    });

    it('tests Step 2 local timer with cy.tick', () => {
        cy.clock();

        // Complete Step 1 first
        EmergencyProtocolPage.completeStep1('no-answer');

        // Start Step 2 (should trigger 2-minute local timer)
        EmergencyProtocolPage.step2Button.click();

        // Verify local timer appears
        cy.get('#step-2-timer').should('be.visible');
        cy.get('#step-2-countdown').should('contain.text', '02:00');

        // Advance time by 30 seconds
        cy.tick(30000);
        cy.get('#step-2-countdown').should('contain.text', '01:30');

        // Advance time by another minute
        cy.tick(60000);
        cy.get('#step-2-countdown').should('contain.text', '00:30');

        // Complete the timer (it will show expiration message)
cy.tick(30000);
cy.get('#step-2-countdown').should('contain.text', 'TIMER EXPIRED');

        // Verify timer completion is logged
        EmergencyProtocolPage.validateLogEntry('2-minute message wait completed');
    });

    it('handles multiple timer scenarios with time control', () => {
        cy.clock();

        // Start first timer (EC callback for Daniel Reyes)
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('no-answer-voicemail');
        EmergencyProtocolPage.step41Button.click();
        EmergencyProtocolPage.step41Outcome.select('waiting-30-minutes');
        EmergencyProtocolPage.step41PostButton.click();

        // Verify first timer is active
        EmergencyProtocolPage.validateTimerActive('EC Callback');
        EmergencyProtocolPage.timerInfo.should('contain.text', 'Daniel Reyes');

        // Advance time by 10 minutes
        cy.tick(600000);
        EmergencyProtocolPage.timerDisplay.should('contain.text', '20:00');

        // Start second timer (should cancel first and start new one)
        EmergencyProtocolPage.step42Button.click();
        EmergencyProtocolPage.step42Outcome.select('waiting-30-minutes');
        EmergencyProtocolPage.step42PostButton.click();

        // Verify new timer replaced the old one (resets to 30:00)
        EmergencyProtocolPage.validateTimerActive('EC Callback');
        EmergencyProtocolPage.timerInfo.should('contain.text', 'Vanessa Liu');
        EmergencyProtocolPage.timerDisplay.should('contain.text', '30:00');

        // Verify log shows cancellation and new timer start
        EmergencyProtocolPage.validateLogEntry('Cancelled previous timer');
        EmergencyProtocolPage.validateLogEntry('Started 30-minute timer: EC Callback for Vanessa Liu');
    });

    it('tests dispatch follow-up timer with time control', () => {
        cy.clock();

        // Complete full protocol with dispatch
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.completeEmergencyContacts();
        
        // Make dispatch decision
        EmergencyProtocolPage.makeDispatchDecision('Yes', 'EMS');

        // Verify dispatch follow-up timer starts
        EmergencyProtocolPage.validateTimerActive('Dispatch Follow-up');
        EmergencyProtocolPage.timerInfo.should('contain.text', 'Check status with Emergency Services');
        EmergencyProtocolPage.timerDisplay.should('contain.text', '30:00');

        // Advance time by 15 minutes
        cy.tick(900000); // 15 minutes
        EmergencyProtocolPage.timerDisplay.should('contain.text', '15:00');

        // Advance to completion
        cy.tick(900000); // Another 15 minutes
        
        // Verify timer expiration
        cy.get('#timerNotification').should('be.visible');
        cy.get('#timerNotificationText').should('contain.text', 'Dispatch Follow-up timer has expired');
        
        // Verify expiration logged
        EmergencyProtocolPage.validateLogEntry('TIMER EXPIRED: Dispatch Follow-up');
    });

    it('validates timer accuracy and precision', () => {
        cy.clock();

        // Start timer
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('no-answer-voicemail');
        EmergencyProtocolPage.step41Button.click();
        EmergencyProtocolPage.step41Outcome.select('waiting-30-minutes');
        EmergencyProtocolPage.step41PostButton.click();

        // Test precise time intervals
const timeTests = [
    { advance: 60000, expected: '29:00' },    // 1 minute
    { advance: 300000, expected: '24:00' },   // 5 more minutes (6 total)
    { advance: 600000, expected: '14:00' },   // 10 more minutes (16 total)
    { advance: 840000, expected: '--:--' }    // 14 more minutes (30 total) - timer becomes inactive
];

        timeTests.forEach(test => {
            cy.tick(test.advance);
            EmergencyProtocolPage.timerDisplay.should('contain.text', test.expected);
        });

        // Verify timer expiration after exactly 30 minutes
        cy.get('#timerNotification').should('be.visible');
    });
});