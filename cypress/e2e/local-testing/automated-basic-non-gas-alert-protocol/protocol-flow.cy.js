import EmergencyProtocolPage from '../../../pages/EmergencyProtocolPage';

describe('Protocol Workflow - Step 1 Logging Flow', () => {
    beforeEach(() => {
        EmergencyProtocolPage.visit();
        EmergencyProtocolPage.loadFixture('alerts.json');
    });

    it('completes Step 1 with G7c device call and logs correctly', () => {
        // Step 1 should be active initially
        EmergencyProtocolPage.validateStepActive(1);

        // Click the Step 1 button to start G7c device call
        EmergencyProtocolPage.step1Button.click();

        // Outcome dropdown should appear
        EmergencyProtocolPage.step1Outcome.should('be.visible');

        // Select "No answer" outcome
        EmergencyProtocolPage.step1Outcome.select('no-answer');

        // Check that textarea is auto-populated with the correct message
        EmergencyProtocolPage.step1Note
            .should('have.value', 'Called device. No answer.');

        // Post the note
        EmergencyProtocolPage.step1PostButton.click();

        // Confirm log entry is visible with correct format
        EmergencyProtocolPage.validateLogEntry('Step 1: Called device. No answer.');

        // Verify log entry has timestamp and operator ID
        EmergencyProtocolPage.protocolLog.should('contain.text', 'MDT]');
        EmergencyProtocolPage.protocolLog.should('contain.text', 'Op 417');

        // Confirm step has completed status
        EmergencyProtocolPage.validateStepCompleted(1);

        // Verify Step 2 becomes active
        EmergencyProtocolPage.validateStepActive(2);
    });

    it('tests different Step 1 outcomes and their auto-population', () => {
        const outcomes = [
            {
                value: 'no-answer',
                expectedNote: 'Called device. No answer.'
            },
            {
                value: 'unable-to-call', 
                expectedNote: 'Unable to call, device offline.'
            },
            {
                value: 'confirmed-ok',
                expectedNote: 'Called device. Spoke with Emily Garcia. Confirmed they are OK. Resolving alert.'
            }
        ];

        outcomes.forEach((outcome, index) => {
            // Refresh page for clean state
            if (index > 0) {
                EmergencyProtocolPage.visit();
                EmergencyProtocolPage.loadFixture('alerts.json');
            }

            // Start Step 1
            EmergencyProtocolPage.step1Button.click();

            // Select outcome
            EmergencyProtocolPage.step1Outcome.select(outcome.value);

            // Verify auto-populated note
            EmergencyProtocolPage.step1Note.should('have.value', outcome.expectedNote);

            // Post the note
            EmergencyProtocolPage.step1PostButton.click();

            // Verify log entry
            EmergencyProtocolPage.validateLogEntry(`Step 1: ${outcome.expectedNote}`);

            // If "confirmed-ok", verify resolution auto-suggestion
            if (outcome.value === 'confirmed-ok') {
                EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');
                
                // Verify remaining steps are skipped/blocked
                cy.get('#step-2').should('have.css', 'opacity', '0.5');
                cy.get('#step-3').should('have.css', 'opacity', '0.5');
            }
        });
    });

    it('validates Step 1 button state changes and validation', () => {
        // Initially, post button should be disabled
        EmergencyProtocolPage.step1PostButton.should('be.disabled');
        EmergencyProtocolPage.step1PostButton.should('have.class', 'btn-secondary');

        // Start Step 1
        EmergencyProtocolPage.step1Button.click();

        // Post button should still be disabled (no outcome selected)
        EmergencyProtocolPage.step1PostButton.should('be.disabled');

        // Select an outcome
        EmergencyProtocolPage.step1Outcome.select('no-answer');

        // Post button should now be enabled and green
        EmergencyProtocolPage.step1PostButton.should('not.be.disabled');
        EmergencyProtocolPage.step1PostButton.should('have.class', 'btn-success');

        // Post the note
        EmergencyProtocolPage.step1PostButton.click();

        // After posting, textarea should be cleared and button disabled again
        EmergencyProtocolPage.step1Note.should('have.value', '');
        EmergencyProtocolPage.step1PostButton.should('be.disabled');
    });

    it('validates custom note entry and posting', () => {
        // Start Step 1
        EmergencyProtocolPage.step1Button.click();

        // Enter custom note without selecting outcome (should fail validation)
        EmergencyProtocolPage.step1Note.clear().type('Custom note about device call');

        // Try to post - should show validation error
        EmergencyProtocolPage.step1PostButton.click();
        
        // Should see alert about selecting outcome first
        cy.on('window:alert', (text) => {
            expect(text).to.contains('Please select an outcome first');
        });

        // Now select outcome (this will auto-populate the note)
        EmergencyProtocolPage.step1Outcome.select('no-answer');
        
        // Clear and enter custom note AFTER selecting outcome
        EmergencyProtocolPage.step1Note.clear().type('Custom note about device call');

        // Post should work now
        EmergencyProtocolPage.step1PostButton.click();

        // Verify custom note appears in log
        EmergencyProtocolPage.validateLogEntry('Step 1: Custom note about device call');
    });

    it('tests log entry format and metadata', () => {
        // Complete Step 1
        EmergencyProtocolPage.completeStep1('no-answer');

        // Verify log entry contains all required elements
        EmergencyProtocolPage.protocolLog.within(() => {
            // Check for timestamp in MDT format
            cy.contains(/\[\d{2}:\d{2}:\d{2} MDT\]/).should('exist');
            
            // Check for step content
            cy.contains('Step 1: Called device. No answer.').should('exist');
            
            // Check for operator ID
            cy.contains('Op 417').should('exist');
        });

        // Verify log entry has correct styling
        cy.get('.log-entry.step').should('exist');
        cy.get('.log-entry.step').should('have.css', 'border-left-color', 'rgb(0, 123, 255)'); // Blue border for step entries
    });

    it('tests manual note addition alongside Step 1', () => {
        // Complete Step 1 first
        EmergencyProtocolPage.completeStep1('no-answer');

        // Add a manual note
        const manualNoteText = 'Additional context: Device user reported being in remote location';
        EmergencyProtocolPage.addManualNote(manualNoteText);

        // Verify both entries appear in log
        EmergencyProtocolPage.validateLogEntry('Step 1: Called device. No answer.');
        EmergencyProtocolPage.validateLogEntry(manualNoteText);

        // Verify manual note has different styling (general log entry)
        cy.get('.log-entry:not(.step):not(.timer):not(.resolution)').should('contain.text', manualNoteText);
    });

    it('validates log ordering and real-time updates', () => {
        // Complete Step 1
        EmergencyProtocolPage.completeStep1('no-answer');

        // Add manual note
        EmergencyProtocolPage.addManualNote('First manual note');

        // Complete Step 2
        EmergencyProtocolPage.completeStep2();

        // Add another manual note
        EmergencyProtocolPage.addManualNote('Second manual note');

        // Verify log entries appear in reverse chronological order (newest first)
        EmergencyProtocolPage.protocolLog.within(() => {
            cy.get('.log-entry').eq(0).should('contain.text', 'Second manual note');
            cy.get('.log-entry').eq(1).should('contain.text', 'Step 2:');
            cy.get('.log-entry').eq(2).should('contain.text', 'First manual note');
            cy.get('.log-entry').eq(3).should('contain.text', 'Step 1:');
        });
    });

    it('validates Step 1 integration with confirmed OK workflow', () => {
        // Start Step 1
        EmergencyProtocolPage.step1Button.click();

        // Select "confirmed OK" outcome
        EmergencyProtocolPage.step1Outcome.select('confirmed-ok');

        // Verify the auto-populated message mentions Emily Garcia
        EmergencyProtocolPage.step1Note
            .should('contain.value', 'Spoke with Emily Garcia')
            .should('contain.value', 'Confirmed they are OK');

        // Post the note
        EmergencyProtocolPage.step1PostButton.click();

        // Verify step completion
        EmergencyProtocolPage.validateStepCompleted(1);

        // Verify resolution is auto-suggested
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');

        // Verify subsequent steps are blocked
        cy.get('#step-2-status').should('contain.text', 'Skipped');
        cy.get('#step-3-status').should('contain.text', 'Skipped');
        cy.get('#step-4-1-status').should('contain.text', 'Skipped');
        cy.get('#step-4-2-status').should('contain.text', 'Skipped');
        cy.get('#step-5-status').should('contain.text', 'Skipped');

        // User can still resolve the alert
        EmergencyProtocolPage.resolveAlert('false-alert-without-dispatch');
        EmergencyProtocolPage.validateProtocolLocked();
    });
});