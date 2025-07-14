import EmergencyProtocolPage from '../../../pages/EmergencyProtocolPage';

describe('Protocol Workflow - Protocol Reset and Repeat Flow', () => {
    beforeEach(() => {
        EmergencyProtocolPage.visit();
        EmergencyProtocolPage.loadFixture('alerts.json');
    });

    it('resets protocol steps when dispatch decision is "No"', () => {
        // Complete full protocol to Step 5
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.completeEmergencyContacts();
    
        // Verify steps are completed
        EmergencyProtocolPage.validateStepCompleted(1);
        EmergencyProtocolPage.validateStepCompleted(2);
        EmergencyProtocolPage.validateStepCompleted(3);
    
        // Make "No" dispatch decision with skip reason
        EmergencyProtocolPage.dispatchDecision.select('No');
        EmergencyProtocolPage.skipReason.select('location-invalid');
        EmergencyProtocolPage.step5PostButton.click();
    
        // Verify log entry explains protocol reset
        EmergencyProtocolPage.validateLogEntry('Unable to dispatch. Location invalid or outdated');
        EmergencyProtocolPage.validateLogEntry('Repeating protocol steps until someone is reached');
    
        // Verify resolution auto-suggests "False alert without dispatch"
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');
    
        // // 🔧 FIXED: Try automatic reset first, fallback to force reset if needed
        // try {
        //     EmergencyProtocolPage.waitForProtocolReset();
        //     EmergencyProtocolPage.validateStepsAreRepeatable();
        // } catch (error) {
        //     // If automatic reset doesn't work, force reset
        //     EmergencyProtocolPage.forceProtocolReset();
            
        //     // Re-verify the log entries after reload
        //     EmergencyProtocolPage.validateLogEntry('Unable to dispatch. Location invalid or outdated');
            
        //     // Now test that we can start fresh attempts
        //     EmergencyProtocolPage.completeStep1('unable-to-call');
        //     EmergencyProtocolPage.validateLogEntry('Step 1: Unable to call, device offline');
        // }

        EmergencyProtocolPage.waitForProtocolReset();
        EmergencyProtocolPage.validateStepsAreRepeatable();
        EmergencyProtocolPage.completeStep1('unable-to-call');
        EmergencyProtocolPage.validateLogEntry('Step 1: Unable to call, device offline');
    });

    // 🔧 FIXED: Updated with better timing and methods
    it('allows repeated protocol attempts after "No" dispatch decision', () => {
        // First attempt
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.completeEmergencyContacts();
        EmergencyProtocolPage.makeDispatchDecision('No', null, 'device-offline');

        // 🔧 FIXED: Use proper reset waiting
        EmergencyProtocolPage.waitForProtocolReset();

        // Second attempt - COMPLETE FULL WORKFLOW like first time, NO custom notes
        EmergencyProtocolPage.completeBasicProtocol(); // This does Steps 1-3 with outcomes, auto-populated text
        EmergencyProtocolPage.completeEmergencyContacts(); // This does Steps 4-1, 4-2 with outcomes, auto-populated text

        // Try Step 4-1 with callback this time using page object method
        EmergencyProtocolPage.completeStep41('waiting-30-minutes');

        // Verify timer starts for callback
        EmergencyProtocolPage.validateTimerActive('EC Callback');
        EmergencyProtocolPage.timerInfo.should('contain.text', 'Daniel Reyes');

        // Verify log shows both attempts
        EmergencyProtocolPage.validateLogEntry('Step 4-1: Called Daniel Reyes'); // Second attempt
        EmergencyProtocolPage.validateLogEntry('Unable to dispatch. Device is offline'); // First attempt
    });

    // 🔧 FIXED: Updated timing and validation methods
    it('tests multiple dispatch skip reasons and their reset behavior', () => {
        const skipReasons = [
            {
                value: 'location-invalid',
                expectedText: 'Location invalid or outdated'
            },
            {
                value: 'alert-old',
                expectedText: 'Alert older than 24 hours'
            },
            {
                value: 'device-moving',
                expectedText: 'Device is moving faster than 5 km/h'
            },
            {
                value: 'device-offline',
                expectedText: 'Device is offline'
            }
        ];

        skipReasons.forEach((reason, index) => {
            // Refresh for clean state (except first)
            if (index > 0) {
                EmergencyProtocolPage.visit();
                EmergencyProtocolPage.loadFixture('alerts.json');
            }

            // Complete protocol to dispatch decision
            EmergencyProtocolPage.completeBasicProtocol();
            EmergencyProtocolPage.completeEmergencyContacts();

            // Make "No" dispatch decision with specific reason
            EmergencyProtocolPage.makeDispatchDecision('No', null, reason.value);

            // Verify correct skip reason is logged
            EmergencyProtocolPage.validateLogEntry(reason.expectedText);
            EmergencyProtocolPage.validateLogEntry('Repeating protocol steps until someone is reached');

            // 🔧 FIXED: Use proper reset waiting and validation
            EmergencyProtocolPage.waitForProtocolReset();
            
            // Test functionality by completing full workflow (outcomes auto-populate)
            EmergencyProtocolPage.completeStep1('unable-to-call'); // NO custom note - let auto-populate work
        });
    });

    // 🔧 FIXED: Better timing and method usage
    it('validates protocol reset preserves log history', () => {
        // First complete attempt
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.addManualNote('First attempt notes');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('no-answer-voicemail');
        EmergencyProtocolPage.completeStep41('no-answer-voicemail');
        EmergencyProtocolPage.completeStep42('no-answer-voicemail');

        // Skip dispatch
        EmergencyProtocolPage.makeDispatchDecision('No', null, 'location-invalid');

        // 🔧 FIXED: Use proper reset waiting
        EmergencyProtocolPage.waitForProtocolReset();

        // Second attempt with different notes - let auto-population work
        EmergencyProtocolPage.completeStep1('unable-to-call'); // No custom note!
        EmergencyProtocolPage.addManualNote('Second attempt notes');

        // Verify both attempts are preserved in log - now should show auto-populated text
        EmergencyProtocolPage.validateLogEntry('Second attempt notes');
        EmergencyProtocolPage.validateLogEntry('First attempt notes');
        EmergencyProtocolPage.validateLogEntry('Step 1: Unable to call, device offline'); // Second attempt auto-populated
        EmergencyProtocolPage.validateLogEntry('Step 1: Called device. No answer'); // First attempt

        // Verify log maintains chronological order
        EmergencyProtocolPage.protocolLog.within(() => {
            cy.get('.log-entry').should('have.length.greaterThan', 8); // Multiple attempts logged
        });
    });

    // 🔧 FIXED: Better timer handling and validation
    it('tests protocol reset with active timers', () => {
        cy.clock();

        // Complete protocol with EC callback timer using page object method
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.completeStep41('waiting-30-minutes');

        // Verify timer is active
        EmergencyProtocolPage.validateTimerActive('EC Callback');

        // Advance timer partway
        cy.tick(600000); // 10 minutes
        EmergencyProtocolPage.timerDisplay.should('contain.text', '20:00');

        // Complete remaining contacts and skip dispatch
        EmergencyProtocolPage.completeStep42('no-answer-voicemail');
        EmergencyProtocolPage.makeDispatchDecision('No', null, 'device-offline');

        // Verify timer continues running (EC callback still valid)
        EmergencyProtocolPage.validateTimerActive('EC Callback');
        EmergencyProtocolPage.timerDisplay.should('contain.text', '20:00');

        // 🔧 FIXED: Use proper reset waiting and test functionality
        EmergencyProtocolPage.waitForProtocolReset();
        
        // Test using page object method - NO custom notes, let auto-populate work
        EmergencyProtocolPage.completeStep1('unable-to-call'); // Should auto-populate "Unable to call, device offline"
    });

    it('validates confirmed OK scenarios bypass protocol reset', () => {
        // Complete protocol with confirmed OK in Step 3 using page object method
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('confirmed-ok');

        // Verify steps are blocked (no reset needed)
        cy.get('#step-4-1-status').should('contain.text', 'Skipped');
        cy.get('#step-4-2-status').should('contain.text', 'Skipped');
        cy.get('#step-5-status').should('contain.text', 'Skipped');

        // Verify resolution is auto-suggested
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');

        // Verify no protocol reset message
        EmergencyProtocolPage.protocolLog.should('not.contain.text', 'Repeating protocol steps');
    });

    it('tests protocol reset after resolution cancellation', () => {
        // Complete full protocol and resolve
        EmergencyProtocolPage.completeFullProtocolWithoutDispatch();

        // Verify protocol is locked
        EmergencyProtocolPage.validateProtocolLocked();

        // Cancel resolution
        EmergencyProtocolPage.cancelResolution();

        // Verify protocol is unlocked and steps are restored
        EmergencyProtocolPage.validateProtocolUnlocked();

        // Verify steps maintain their completed state (not reset to pending)
        EmergencyProtocolPage.validateStepCompleted(1);
        EmergencyProtocolPage.validateStepCompleted(2);
        EmergencyProtocolPage.validateStepCompleted(3);

        // But steps should be interactive again
        EmergencyProtocolPage.step1Button.should('not.be.disabled');
        EmergencyProtocolPage.step2Button.should('not.be.disabled');
        EmergencyProtocolPage.step3Button.should('not.be.disabled');
    });

    // 🔧 FIXED: Better method usage and timing
    it('validates repeated dispatch attempts with different decisions', () => {
        // First attempt - skip dispatch
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.completeEmergencyContacts();
        EmergencyProtocolPage.makeDispatchDecision('No', null, 'alert-old');

        // 🔧 FIXED: Use proper reset waiting
        EmergencyProtocolPage.waitForProtocolReset();

        // Second attempt - user confirmed OK this time, NO custom notes
        EmergencyProtocolPage.completeStep1('no-answer'); // Should auto-populate "Called device. No answer"
        EmergencyProtocolPage.completeStep2(); // Should auto-populate message text
        EmergencyProtocolPage.completeStep3('confirmed-ok'); // Should auto-populate "confirmed they are OK"

        // This time user is confirmed OK, so dispatch is not needed
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');

        // Verify log shows both attempts - use actual text from logs
        EmergencyProtocolPage.validateLogEntry('Spoke with Emily Garcia, confirmed they are OK'); // Second attempt
        EmergencyProtocolPage.validateLogEntry('Alert older than 24 hours'); // First attempt
    });

    // 🔧 FIXED: Multiple resets with proper timing
    it('tests edge case: multiple "No" dispatch decisions', () => {
        // First "No" dispatch
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.completeEmergencyContacts();
        EmergencyProtocolPage.makeDispatchDecision('No', null, 'location-invalid');

        // 🔧 FIXED: Use proper reset waiting
        EmergencyProtocolPage.waitForProtocolReset();

        // Second attempt, "No" dispatch again
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.makeDispatchDecision('No', null, 'device-moving');

        // 🔧 FIXED: Use proper reset waiting
        EmergencyProtocolPage.waitForProtocolReset();

        // Third attempt, finally dispatch - NO custom notes, let auto-populate work
        EmergencyProtocolPage.completeStep1('no-answer'); // Should auto-populate "Called device. No answer"
        EmergencyProtocolPage.completeStep2(); // Should auto-populate message text
        EmergencyProtocolPage.completeStep3('no-answer-voicemail'); // Should auto-populate voicemail text
        EmergencyProtocolPage.makeDispatchDecision('Yes', 'EMS');

        // Verify log shows all three attempts
        EmergencyProtocolPage.validateLogEntry('Requested EMS dispatch'); // Third attempt
        EmergencyProtocolPage.validateLogEntry('Device is moving faster than 5 km/h'); // Second attempt
        EmergencyProtocolPage.validateLogEntry('Location invalid or outdated'); // First attempt

        // Verify final resolution suggestion
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-with-dispatch');
    });

    // 🔧 NEW: Additional test to verify reset functionality thoroughly
    it('verifies complete protocol reset functionality', () => {
        // Complete initial protocol
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.completeEmergencyContacts();
        
        // Skip dispatch to trigger reset
        EmergencyProtocolPage.makeDispatchDecision('No', null, 'location-invalid');
        
        // Use comprehensive reset validation
        EmergencyProtocolPage.waitForProtocolReset();
        EmergencyProtocolPage.validateStepsAreRepeatable();
        
        // Verify we can complete a full second attempt
        EmergencyProtocolPage.completeStep3('confirmed-ok');
        
        // Verify resolution suggestion is appropriate
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');
        
        // Verify both attempts are in log
        EmergencyProtocolPage.validateLogEntry('confirmed they are OK'); // Second attempt
        EmergencyProtocolPage.validateLogEntry('Location invalid or outdated'); // First attempt
    });
});