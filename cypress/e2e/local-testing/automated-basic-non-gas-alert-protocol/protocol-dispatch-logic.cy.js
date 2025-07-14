import EmergencyProtocolPage from '../../../pages/EmergencyProtocolPage';

describe('Protocol Workflow - Step 5 Dispatch Logic', () => {
    beforeEach(() => {
        EmergencyProtocolPage.visit();
        EmergencyProtocolPage.loadFixture('alerts.json');
    });

    it('handles "Yes" dispatch logic and logs correctly', () => {
        // Step 5 should be immediately available (always active)
        EmergencyProtocolPage.validateStepActive(5);

        // Select "Yes" from dispatch decision dropdown
        EmergencyProtocolPage.dispatchDecision.select('Yes');

        // Dispatch service container should appear
        cy.get('#dispatch-service-container').should('be.visible');

        // Select a dispatch service type
        EmergencyProtocolPage.dispatchService.select('EMS');

        // Click Call Dispatch button to prefill textarea
        EmergencyProtocolPage.callDispatchButton.click();

        // Check that the dispatch note appears in textarea with dynamic location data
        EmergencyProtocolPage.step5Note
            .should('contain.value', 'Called dispatch, spoke with ___. Requested EMS dispatch to the following location:')
            .should('contain.value', 'Last Location:')
            .should('contain.value', '144252 434 Ave E, Aldersyde, AB T0L 0A0, Canada')
            .should('contain.value', 'Latitude / Longitude: 50.66004, -113.7685769')
            .should('contain.value', 'Waiting 30 minutes.');

        // Post the note
        EmergencyProtocolPage.step5PostButton.click();

        // Check the log contains the correct dispatch message
        EmergencyProtocolPage.validateLogEntry('Step 5:');
        EmergencyProtocolPage.validateLogEntry('Called dispatch, spoke with ___. Requested EMS dispatch');

        // Check that resolution auto-suggests "False alert with dispatch"
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-with-dispatch');

        // Verify global timer starts for dispatch follow-up
        EmergencyProtocolPage.validateTimerActive('Dispatch Follow-up');
    });

    it('handles "No" dispatch logic with skip reasons and logs correctly', () => {
        // Step 5 should be immediately available
        EmergencyProtocolPage.validateStepActive(5);

        // Select "No" from dispatch decision dropdown
        EmergencyProtocolPage.dispatchDecision.select('No');

        // Skip reason container should appear
        cy.get('#skip-reason-container').should('be.visible');
        cy.get('#dispatch-service-container').should('not.be.visible');

        // Select a skip reason
        EmergencyProtocolPage.skipReason.select('device-offline');

        // Check that the skip note auto-populates in textarea
        EmergencyProtocolPage.step5Note
            .should('contain.value', 'Unable to dispatch. Device is offline. Cannot confirm current location accuracy. Repeating protocol steps until someone is reached.');

        // Post the note
        EmergencyProtocolPage.step5PostButton.click();

        // Check the log contains the correct skip message
        EmergencyProtocolPage.validateLogEntry('Step 5:');
        EmergencyProtocolPage.validateLogEntry('Unable to dispatch. Device is offline');

        // Check that resolution auto-suggests "False alert without dispatch"
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');

        // No timer should start for skip scenarios
        EmergencyProtocolPage.validateTimerInactive();
    });

    it('handles multiple dispatch service types correctly', () => {
        // Test different service combinations
        const serviceTypes = ['EMS', 'Police', 'Fire', 'EMS and Police', 'Fire and Police', 'EMS, Fire and Police'];

        serviceTypes.forEach((service) => {
            // Select Yes for dispatch
            EmergencyProtocolPage.dispatchDecision.select('Yes');

            // Select service type
            EmergencyProtocolPage.dispatchService.select(service);

            // Click dispatch button
            EmergencyProtocolPage.callDispatchButton.click();

            // Verify the service type appears in the note
            EmergencyProtocolPage.step5Note
                .should('contain.value', `Requested ${service} dispatch`);

            // Clear note for next iteration
            EmergencyProtocolPage.step5Note.clear();

            // Reset dispatch decision for next iteration
            EmergencyProtocolPage.dispatchDecision.select('-- Select --');
        });
    });

    it('validates dispatch decision selection workflow', () => {
        // Initially, service containers should be hidden
        cy.get('#dispatch-service-container').should('not.be.visible');
        cy.get('#skip-reason-container').should('not.be.visible');

        // Post button should be disabled initially (no note content)
        EmergencyProtocolPage.step5PostButton.should('be.disabled');

        // Select Yes - service container should appear
        EmergencyProtocolPage.dispatchDecision.select('Yes');
        cy.get('#dispatch-service-container').should('be.visible');
        cy.get('#skip-reason-container').should('not.be.visible');

        // Select No - skip reason container should appear
        EmergencyProtocolPage.dispatchDecision.select('No');
        cy.get('#dispatch-service-container').should('not.be.visible');
        cy.get('#skip-reason-container').should('be.visible');

        // Clear selection - both should be hidden
        EmergencyProtocolPage.dispatchDecision.select('-- Select --');
        cy.get('#dispatch-service-container').should('not.be.visible');
        cy.get('#skip-reason-container').should('not.be.visible');

        // Resolution suggestion should clear when no decision is made
        EmergencyProtocolPage.validateResolutionSuggestion('');
    });

    it('tests all skip reasons with proper auto-population', () => {
        const skipReasons = [
            {
                value: 'location-invalid',
                expectedText: 'Unable to dispatch. Location invalid or outdated. Cannot provide accurate address/coordinates for emergency services.'
            },
            {
                value: 'alert-old', 
                expectedText: 'Unable to dispatch. Alert older than 24 hours. Repeating protocol steps until someone is reached.'
            },
            {
                value: 'device-moving',
                expectedText: 'Unable to dispatch. Device is moving faster than 5 km/h. Repeating protocol steps until someone is reached.'
            },
            {
                value: 'device-offline',
                expectedText: 'Unable to dispatch. Device is offline. Cannot confirm current location accuracy.'
            }
        ];

        skipReasons.forEach((reason) => {
            // Select No for dispatch
            EmergencyProtocolPage.dispatchDecision.select('No');

            // Select skip reason
            EmergencyProtocolPage.skipReason.select(reason.value);

            // Verify auto-populated text
            EmergencyProtocolPage.step5Note.should('contain.value', reason.expectedText);

            // Clear for next iteration
            EmergencyProtocolPage.step5Note.clear();
            EmergencyProtocolPage.dispatchDecision.select('-- Select --');
        });
    });

    it('validates resolution auto-suggestions based on dispatch decisions', () => {
        // Test "Yes" dispatch → "False alert with dispatch"
        EmergencyProtocolPage.dispatchDecision.select('Yes');
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-with-dispatch');

        // Test "No" dispatch → "False alert without dispatch" 
        EmergencyProtocolPage.dispatchDecision.select('No');
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');

        // Test clearing selection → No suggestion
        EmergencyProtocolPage.dispatchDecision.select('-- Select --');
        EmergencyProtocolPage.validateResolutionSuggestion('');
    });

    it('integrates with complete protocol workflow', () => {
        // Complete basic protocol steps first
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('no-answer-voicemail');

        // Complete emergency contacts
        EmergencyProtocolPage.completeStep41('no-answer-voicemail');
        EmergencyProtocolPage.completeStep42('no-answer-voicemail');

        // Now test dispatch decision (Step 5 should still be active)
        EmergencyProtocolPage.validateStepActive(5);
        EmergencyProtocolPage.makeDispatchDecision('Yes', 'EMS');

        // Verify complete workflow
        EmergencyProtocolPage.validateStepCompleted(5);
        EmergencyProtocolPage.validateTimerActive('Dispatch Follow-up');
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-with-dispatch');

        // Complete resolution
        EmergencyProtocolPage.resolveAlert('false-alert-with-dispatch');
        EmergencyProtocolPage.validateProtocolLocked();
    });
});