import EmergencyProtocolPage from '../../../pages/EmergencyProtocolPage';

describe('Protocol Workflow - Resolution Flow', () => {
    beforeEach(() => {
        EmergencyProtocolPage.visit();
        EmergencyProtocolPage.loadFixture('alerts.json');
    });

    it('resolves alert with dispatch and validates complete workflow', () => {
        // Complete protocol steps that lead to dispatch
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.completeEmergencyContacts();
        EmergencyProtocolPage.makeDispatchDecision('Yes', 'EMS');

        // Verify resolution auto-suggests "False alert with dispatch"
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-with-dispatch');

        // Resolve the alert
        EmergencyProtocolPage.resolveAlert('false-alert-with-dispatch');

        // Verify resolution is logged correctly
        EmergencyProtocolPage.validateLogEntry('Alert resolved: False alert with dispatch');

        // Verify protocol is completely locked
        EmergencyProtocolPage.validateProtocolLocked();

        // Verify resolution status shows completed
        EmergencyProtocolPage.resolutionStatus.should('contain.text', 'Completed');
        EmergencyProtocolPage.resolutionStatus.should('have.class', 'completed');

        // Verify resolve button is disabled and grayed out
        EmergencyProtocolPage.resolveAlertButton.should('be.disabled');
        EmergencyProtocolPage.resolveAlertButton.should('have.class', 'btn-secondary');

        // Verify cancel resolution button remains active
        EmergencyProtocolPage.cancelResolutionButton.should('not.be.disabled');

        // Verify manual notes still work
        EmergencyProtocolPage.addManualNote('Post-resolution documentation');
        EmergencyProtocolPage.validateLogEntry('Post-resolution documentation');
    });

    it('resolves alert without dispatch and validates workflow', () => {
        // Complete protocol without dispatch
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.completeEmergencyContacts();
        EmergencyProtocolPage.makeDispatchDecision('No', null, 'device-offline');

        // Verify resolution auto-suggests "False alert without dispatch"
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');

        // Resolve the alert
        EmergencyProtocolPage.resolveAlert('false-alert-without-dispatch');

        // Verify resolution is logged
        EmergencyProtocolPage.validateLogEntry('Alert resolved: False alert without dispatch');

        // Verify protocol is locked
        EmergencyProtocolPage.validateProtocolLocked();

        // Verify all steps are visually grayed out but not completely hidden
        cy.get('.step:not(.resolution-section)').each(($step) => {
            cy.wrap($step).should('have.css', 'opacity', '0.6');
            cy.wrap($step).should('have.css', 'pointer-events', 'none');
        });
    });

    it('cancels resolution and fully re-enables protocol', () => {
        // Complete full protocol and resolve
        EmergencyProtocolPage.completeFullProtocolWithDispatch('Police');

        // Verify protocol is locked
        EmergencyProtocolPage.validateProtocolLocked();

        // Cancel the resolution
        EmergencyProtocolPage.cancelResolution();

        // Verify cancellation is logged
        EmergencyProtocolPage.validateLogEntry('Resolution cancelled');

        // Verify protocol is fully unlocked
        EmergencyProtocolPage.validateProtocolUnlocked();

        // Verify resolution dropdown is cleared
        EmergencyProtocolPage.resolutionReason.should('have.value', '');

        // Verify resolution status is reset
        EmergencyProtocolPage.resolutionStatus.should('contain.text', 'Pending');
        EmergencyProtocolPage.resolutionStatus.should('not.have.class', 'completed');

        // Verify resolve button is re-enabled
        EmergencyProtocolPage.resolveAlertButton.should('not.be.disabled');
        EmergencyProtocolPage.resolveAlertButton.should('have.class', 'btn-danger');

        // Verify all steps are interactive again
        cy.get('.step').each(($step) => {
            cy.wrap($step).should('have.css', 'opacity', '1');
            cy.wrap($step).should('not.have.css', 'pointer-events', 'none');
        });

        // Verify user can make different resolution choice
        EmergencyProtocolPage.resolveAlert('incident-with-dispatch');
        EmergencyProtocolPage.validateLogEntry('Alert resolved: Incident with dispatch');
    });

    it('tests resolution auto-suggestions based on dispatch decisions', () => {
        // Test "Yes" dispatch auto-suggestion
        EmergencyProtocolPage.makeDispatchDecision('Yes', 'EMS');
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-with-dispatch');

        // Clear and test "No" dispatch auto-suggestion
        EmergencyProtocolPage.dispatchDecision.select('-- Select --');
        EmergencyProtocolPage.validateResolutionSuggestion('');

        EmergencyProtocolPage.makeDispatchDecision('No', null, 'location-invalid');
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');

        // Clear selection should clear suggestion
        EmergencyProtocolPage.dispatchDecision.select('-- Select --');
        EmergencyProtocolPage.validateResolutionSuggestion('');
    });

    it('tests all resolution reasons and their proper logging', () => {
        const resolutionReasons = [
            { value: 'false-alert-without-dispatch', text: 'False alert without dispatch' },
            { value: 'false-alert-with-dispatch', text: 'False alert with dispatch' },
            { value: 'incident-without-dispatch', text: 'Incident without dispatch' },
            { value: 'incident-with-dispatch', text: 'Incident with dispatch' },
            { value: 'pre-alert', text: 'Pre-Alert' },
            { value: 'demo-training', text: 'Demo/Training' }
        ];

        resolutionReasons.forEach((reason, index) => {
            // Refresh page for clean state
            if (index > 0) {
                EmergencyProtocolPage.visit();
                EmergencyProtocolPage.loadFixture('alerts.json');
            }

            // Select resolution reason and resolve
            EmergencyProtocolPage.resolveAlert(reason.value);

            // Verify correct text appears in log
            EmergencyProtocolPage.validateLogEntry(`Alert resolved: ${reason.text}`);

            // Verify protocol is locked
            EmergencyProtocolPage.validateProtocolLocked();
        });
    });

    it('validates resolution workflow with confirmed OK scenario', () => {
        // Complete Step 1 with "confirmed OK"
        EmergencyProtocolPage.step1Button.click();
        EmergencyProtocolPage.step1Outcome.select('confirmed-ok');
        EmergencyProtocolPage.step1PostButton.click();

        // Verify resolution is auto-suggested
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-without-dispatch');

        // Verify subsequent steps are skipped
        cy.get('#step-2-status').should('contain.text', 'Skipped');
        cy.get('#step-3-status').should('contain.text', 'Skipped');
        cy.get('#step-5-status').should('contain.text', 'Skipped');

        // Resolve with auto-suggested reason
        EmergencyProtocolPage.resolveAlert('false-alert-without-dispatch');

        // Verify resolution
        EmergencyProtocolPage.validateLogEntry('Alert resolved: False alert without dispatch');
        EmergencyProtocolPage.validateProtocolLocked();
    });

    it('tests resolution validation requirements', () => {
        // Try to resolve without selecting reason (should fail)
        EmergencyProtocolPage.resolveAlertButton.click();

        // Should see validation alert
        cy.on('window:alert', (text) => {
            expect(text).to.contains('Please select a resolution reason first');
        });

        // Verify protocol is not locked
        EmergencyProtocolPage.validateProtocolUnlocked();

        // Now select reason and resolve properly
        EmergencyProtocolPage.resolveAlert('demo-training');
        EmergencyProtocolPage.validateProtocolLocked();
    });

    it('tests resolution integration with active timers', () => {
        cy.clock();

        // Start a timer
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.completeStep2();
        EmergencyProtocolPage.completeStep3('no-answer-voicemail');
        EmergencyProtocolPage.step41Button.click();
        EmergencyProtocolPage.step41Outcome.select('waiting-30-minutes');
        EmergencyProtocolPage.step41PostButton.click();

        // Verify timer is active
        EmergencyProtocolPage.validateTimerActive('EC Callback');

        // Advance timer partway
        cy.tick(600000); // 10 minutes
        EmergencyProtocolPage.timerDisplay.should('contain.text', '20:00');

        // Resolve the alert
        EmergencyProtocolPage.resolveAlert('false-alert-without-dispatch');

        // Verify timer is cancelled when alert is resolved
        EmergencyProtocolPage.validateTimerInactive();

        // Verify protocol is locked
        EmergencyProtocolPage.validateProtocolLocked();
    });

    it('tests multiple resolution cycles', () => {
        // First resolution cycle
        EmergencyProtocolPage.completeBasicProtocol();
        EmergencyProtocolPage.resolveAlert('false-alert-without-dispatch');
        EmergencyProtocolPage.validateProtocolLocked();

        // Cancel and try different resolution
        EmergencyProtocolPage.cancelResolution();
        EmergencyProtocolPage.validateProtocolUnlocked();

        // Second resolution cycle
        EmergencyProtocolPage.resolveAlert('demo-training');
        EmergencyProtocolPage.validateProtocolLocked();

        // Cancel again
        EmergencyProtocolPage.cancelResolution();
        EmergencyProtocolPage.validateProtocolUnlocked();

        // Third resolution cycle with dispatch
        EmergencyProtocolPage.makeDispatchDecision('Yes', 'Fire');
        EmergencyProtocolPage.validateResolutionSuggestion('false-alert-with-dispatch');
        EmergencyProtocolPage.resolveAlert('false-alert-with-dispatch');
        EmergencyProtocolPage.validateProtocolLocked();

        // Verify all resolution attempts are logged
        EmergencyProtocolPage.validateLogEntry('Alert resolved: False alert with dispatch');
        EmergencyProtocolPage.validateLogEntry('Resolution cancelled');
        EmergencyProtocolPage.validateLogEntry('Alert resolved: Demo/Training');
    });

    it('validates UI state preservation during resolution workflow', () => {
        // Complete some steps and add manual notes
        EmergencyProtocolPage.completeStep1('no-answer');
        EmergencyProtocolPage.addManualNote('Important context note');
        EmergencyProtocolPage.completeStep2();

        // Verify steps are completed
        EmergencyProtocolPage.validateStepCompleted(1);
        EmergencyProtocolPage.validateStepCompleted(2);

        // Resolve alert
        EmergencyProtocolPage.resolveAlert('incident-without-dispatch');

        // Verify protocol is locked but step states preserved
        EmergencyProtocolPage.validateProtocolLocked();
        cy.get('#step-1-status').should('contain.text', 'Completed');
        cy.get('#step-2-status').should('contain.text', 'Completed');

        // Verify manual notes are still visible in log
        EmergencyProtocolPage.validateLogEntry('Important context note');

        // Cancel resolution
        EmergencyProtocolPage.cancelResolution();

        // Verify step states are maintained after unlock
        EmergencyProtocolPage.validateStepCompleted(1);
        EmergencyProtocolPage.validateStepCompleted(2);
        EmergencyProtocolPage.validateLogEntry('Important context note');
    });
});