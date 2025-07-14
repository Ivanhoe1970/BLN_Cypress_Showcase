import EmergencyProtocolPage from '../../../pages/EmergencyProtocolPage';

describe('Protocol Workflow - Steps Logging Flow', () => {
    beforeEach(() => {
        EmergencyProtocolPage.visit();
        EmergencyProtocolPage.loadFixture('alerts.json');
    });

    it('completes Step 2 with message sending and logs correctly', () => {
        // Complete Step 1 first to enable Step 2
        EmergencyProtocolPage.completeStep1('no-answer');

        // Click the Step 2 button
        EmergencyProtocolPage.step2Button.click();

        // Check textarea is pre-populated with message content
        EmergencyProtocolPage.step2Note
            .should('contain.value', 'Sent message "Do you need help?" to G7c device')
            .should('contain.value', 'Waiting 2 minutes for device user reply');

        // Verify local timer appears
        cy.get('#step-2-timer').should('be.visible');
        cy.get('#step-2-countdown').should('contain.text', '02:00');

        // Post the note
        EmergencyProtocolPage.step2PostButton.click();

        // Verify it appears in the logs with correct format
        EmergencyProtocolPage.validateLogEntry('Step 2: Sent message "Do you need help?" to G7c device');
        
        // Verify log entry has proper timestamp and operator ID
        EmergencyProtocolPage.protocolLog.should('contain.text', 'MDT]');
        EmergencyProtocolPage.protocolLog.should('contain.text', 'Op 417');

        // Verify step is marked as completed
        EmergencyProtocolPage.validateStepCompleted(2);

        // Verify Step 3 becomes enabled
        EmergencyProtocolPage.step3Button.should('not.be.disabled');
    });

    it('completes Step 3 user call with outcome and logs correctly', () => {
        // Complete Steps 1 and 2 first
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();

        // Click the Step 3 button
        EmergencyProtocolPage.step3Button.click();

        // Verify Emily Garcia contact info is displayed
        cy.contains('👤 Emily Garcia').should('be.visible');
        cy.contains('📞 +1-313-635-3171').should('be.visible');

        // Choose an outcome
        EmergencyProtocolPage.step3Outcome.select('no-answer-voicemail');

        // Check textarea is auto-populated with Emily Garcia's info
        EmergencyProtocolPage.step3Note
            .should('contain.value', 'Called Emily Garcia at +1-313-635-3171')
            .should('contain.value', 'No answer, left voicemail');

        // Post the note
        EmergencyProtocolPage.step3PostButton.click();

        // Verify it appears in the logs with correct format
        EmergencyProtocolPage.validateLogEntry('Step 3: Called Emily Garcia at +1-313-635-3171. No answer, left voicemail');

        // Verify step completion and next step enabling
        EmergencyProtocolPage.validateStepCompleted(3);
        EmergencyProtocolPage.step41Button.should('not.be.disabled');
    });

    it('completes Step 4-1 emergency contact with outcome and logs correctly', () => {
        // Complete Steps 1-3 first
        EmergencyProtocolPage.completeBasicProtocol();

        // Click the Step 4-1 button (Daniel Reyes)
        EmergencyProtocolPage.step41Button.click();

        // Verify Daniel Reyes contact info is displayed
        cy.contains('👤 Daniel Reyes').should('be.visible');
        cy.contains('📞 +1-587-333-9271').should('be.visible');
        cy.contains('🏷️ Site Supervisor').should('be.visible');

        // Choose an outcome that creates a timer
        EmergencyProtocolPage.step41Outcome.select('waiting-30-minutes');

        // Check textarea is auto-populated with Daniel Reyes info
        EmergencyProtocolPage.step41Note
            .should('contain.value', 'Called Daniel Reyes at +1-587-333-9271')
            .should('contain.value', 'Spoke with EC, who will check on user and call back')
            .should('contain.value', 'Waiting 30 minutes');

        // Post the note
        EmergencyProtocolPage.step41PostButton.click();

        // Verify it appears in the logs with correct format
        EmergencyProtocolPage.validateLogEntry('Step 4-1: Called Daniel Reyes at +1-587-333-9271. Spoke with EC, who will check on user and call back. Waiting 30 minutes');

        // Verify timer starts for this EC callback
        EmergencyProtocolPage.validateTimerActive('EC Callback');
        EmergencyProtocolPage.timerInfo.should('contain.text', 'Daniel Reyes');

        // Verify step completion and Step 4-2 enabling
        EmergencyProtocolPage.validateStepCompleted('4-1');
        EmergencyProtocolPage.step42Button.should('not.be.disabled');
    });

    it('completes Step 4-2 emergency contact with different outcome and logs correctly', () => {
        // Complete Steps 1-3 and 4-1 first
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.completeStep41('no-answer-voicemail');

        // Click the Step 4-2 button (Vanessa Liu)
        EmergencyProtocolPage.step42Button.click();

        // Verify Vanessa Liu contact info is displayed
        cy.contains('👤 Vanessa Liu').should('be.visible');
        cy.contains('📞 +1-780-452-1189').should('be.visible');
        cy.contains('🏷️ Control Room Operator').should('be.visible');

        // Choose a different outcome
        EmergencyProtocolPage.step42Outcome.select('confirmed-ok');

        // Check textarea is auto-populated with Vanessa Liu info
        EmergencyProtocolPage.step42Note
            .should('contain.value', 'Called Vanessa Liu at +1-780-452-1189')
            .should('contain.value', 'Confirmed user is okay and advised to resolve alert');

        // Post the note
        EmergencyProtocolPage.step42PostButton.click();

        // Verify it appears in the logs with correct format
        EmergencyProtocolPage.validateLogEntry('Step 4-2: Called Vanessa Liu at +1-780-452-1189. Confirmed user is okay and advised to resolve alert');

        // Verify step completion
        EmergencyProtocolPage.validateStepCompleted('4-2');

        // Verify resolution auto-suggestion for confirmed OK
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');
    });

    it('validates all Step 3 outcomes and their auto-population', () => {
        // Complete prerequisite steps
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();

        const step3Outcomes = [
            {
                value: 'no-answer-voicemail',
                expectedText: 'Called Emily Garcia at +1-313-635-3171. No answer, left voicemail.'
            },
            {
                value: 'no-answer-already-left',
                expectedText: 'Called Emily Garcia at +1-313-635-3171. No answer, voicemail already left.'
            },
            {
                value: 'wrong-number',
                expectedText: 'Called Emily Garcia at +1-313-635-3171. Wrong number.'
            },
            {
                value: 'confirmed-ok',
                expectedText: 'Called Emily Garcia at +1-313-635-3171. Spoke with Emily Garcia, confirmed they are OK. Resolving alert.'
            }
        ];

        step3Outcomes.forEach((outcome, index) => {
            // Refresh page for clean state (except first iteration)
            if (index > 0) {
                EmergencyProtocolPage.visit();
                EmergencyProtocolPage.loadFixture('alerts.json');
                EmergencyProtocolPage.completeStep1('no-answer');
                EmergencyProtocolPage.completeStep2();
            }

            // Start Step 3
            EmergencyProtocolPage.step3Button.click();

            // Select outcome
            EmergencyProtocolPage.step3Outcome.select(outcome.value);

            // Verify auto-populated text
            EmergencyProtocolPage.step3Note.should('contain.value', outcome.expectedText);

            // Post and verify log
            EmergencyProtocolPage.step3PostButton.click();
            EmergencyProtocolPage.validateLogEntry(`Step 3: ${outcome.expectedText}`);
        });
    });

    it('validates all Step 4-1 outcomes and their logging patterns', () => {
        // Complete prerequisite steps
        EmergencyProtocolPage.completeBasicProtocol();

        const step41Outcomes = [
            {
                value: 'waiting-30-minutes',
                expectedText: 'Called Daniel Reyes at +1-587-333-9271. Spoke with EC, who will check on user and call back. Waiting 30 minutes.',
                startsTimer: true
            },
            {
                value: 'confirmed-ok',
                expectedText: 'Called Daniel Reyes at +1-587-333-9271. Confirmed user is okay and advised to resolve alert.',
                startsTimer: false
            },
            {
                value: 'no-answer-voicemail',
                expectedText: 'Called Daniel Reyes at +1-587-333-9271. No answer, left voicemail.',
                startsTimer: false
            },
            {
                value: 'number-invalid',
                expectedText: 'Called Daniel Reyes at +1-587-333-9271. Number invalid, changed, or out of service.',
                startsTimer: false
            }
        ];

        step41Outcomes.forEach((outcome, index) => {
            // Refresh page for clean state (except first iteration)
            if (index > 0) {
                EmergencyProtocolPage.visit();
                EmergencyProtocolPage.loadFixture('alerts.json');
                EmergencyProtocolPage.completeBasicProtocol();
            }

            // Start Step 4-1
            EmergencyProtocolPage.step41Button.click();

            // Select outcome
            EmergencyProtocolPage.step41Outcome.select(outcome.value);

            // Verify auto-populated text
            EmergencyProtocolPage.step41Note.should('contain.value', outcome.expectedText);

            // Post and verify log
            EmergencyProtocolPage.step41PostButton.click();
            EmergencyProtocolPage.validateLogEntry(`Step 4-1: ${outcome.expectedText}`);

            // Check timer behavior
            if (outcome.startsTimer) {
                EmergencyProtocolPage.validateTimerActive('EC Callback');
                EmergencyProtocolPage.timerInfo.should('contain.text', 'Daniel Reyes');
            } else {
                EmergencyProtocolPage.validateTimerInactive();
            }
        });
    });

    it('validates log entry formatting and metadata consistency', () => {
        // Complete several steps to generate multiple log entries
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.addManualNote('Manual note between steps');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('no-answer-voicemail');

        // Verify log entry format consistency
        EmergencyProtocolPage.protocolLog.within(() => {
            // Check that all entries have timestamps
            cy.get('.log-entry').each(($entry) => {
                cy.wrap($entry).should('contain.text', 'MDT]');
                cy.wrap($entry).should('contain.text', 'Op 417');
            });

            // Check step entries have correct styling
            cy.get('.log-entry.step').should('have.length', 3); // Steps 1, 2, 3
            cy.get('.log-entry.step').each(($entry) => {
                cy.wrap($entry).should('have.css', 'border-left-color', 'rgb(0, 123, 255)');
            });

            // Check manual note has different styling
            cy.get('.log-entry:not(.step):not(.timer):not(.resolution)').should('contain.text', 'Manual note between steps');
        });
    });

    it('validates log ordering and chronological accuracy', () => {
        // Complete steps with manual notes interspersed
        EmergencyProtocolPage.completeStep1('no-answer');
        
        // Wait a moment to ensure different timestamps
        cy.wait(1000);
        EmergencyProtocolPage.addManualNote('First manual note');
        
        cy.wait(1000);
        EmergencyProtocolPage.completeStep2();
        
        cy.wait(1000);
        EmergencyProtocolPage.addManualNote('Second manual note');

        // Verify entries appear in reverse chronological order (newest first)
        EmergencyProtocolPage.protocolLog.within(() => {
            cy.get('.log-entry').eq(0).should('contain.text', 'Second manual note');
            cy.get('.log-entry').eq(1).should('contain.text', 'Step 2:');
            cy.get('.log-entry').eq(2).should('contain.text', 'First manual note');
            cy.get('.log-entry').eq(3).should('contain.text', 'Step 1:');
        });
    });

    it('validates custom note editing and posting workflow', () => {
        // Complete Step 1 to enable Step 2
        EmergencyProtocolPage.completeStep1('no-answer');

        // Start Step 2 and edit the pre-filled note
        EmergencyProtocolPage.step2Button.click();
        
        // Clear and add custom content
        EmergencyProtocolPage.step2Note.clear();
        EmergencyProtocolPage.step2Note.type('Custom message sent to device: "Are you safe?" Device user did not respond after 5 minutes.');

        // Post the custom note
        EmergencyProtocolPage.step2PostButton.click();

        // Verify custom note appears in log
        EmergencyProtocolPage.validateLogEntry('Step 2: Custom message sent to device');
        EmergencyProtocolPage.validateLogEntry('Device user did not respond');

        // Verify step is completed with custom note
        EmergencyProtocolPage.validateStepCompleted(2);
    });

    it('validates step progression and button state changes during logging', () => {
        // Verify initial state
        EmergencyProtocolPage.validateStepActive(1);
        EmergencyProtocolPage.step2Button.should('be.disabled');

        // Complete Step 1 and verify progression
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.validateStepCompleted(1);
        EmergencyProtocolPage.step2Button.should('not.be.disabled');
        EmergencyProtocolPage.validateStepActive(2);

        // Complete Step 2 and verify progression
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.validateStepCompleted(2);
        EmergencyProtocolPage.step3Button.should('not.be.disabled');
        EmergencyProtocolPage.validateStepActive(3);

        // Complete Step 3 and verify Step 4-1 is enabled (Step 4-2 enabled after 4-1)
EmergencyProtocolPage.completeStep3('no-answer-voicemail');
EmergencyProtocolPage.validateStepCompleted(3);
EmergencyProtocolPage.step41Button.should('not.be.disabled');
// Step 4-2 is not enabled yet - it gets enabled after Step 4-1 is completed

// Complete Step 4-1 to enable Step 4-2
EmergencyProtocolPage.completeStep41('no-answer-voicemail');
EmergencyProtocolPage.validateStepCompleted('4-1');
EmergencyProtocolPage.step42Button.should('not.be.disabled'); // Now Step 4-2 should be enabled

        // Verify Step 5 remains active throughout (dispatch always available)
        EmergencyProtocolPage.validateStepActive(5);
    });
});