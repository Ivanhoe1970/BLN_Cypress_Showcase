import EmergencyProtocolPage from '../../../pages/EmergencyProtocolPage';

describe('Protocol Workflow - Smoke Test', () => {
    beforeEach(() => {
        EmergencyProtocolPage.visit();
        EmergencyProtocolPage.loadFixture('alerts.json');
    });

    it('loads the Emergency Response Protocol page successfully', () => {
        // Check main page title
        cy.title().should('contain', 'Emergency Response Protocol with Global Timer');

        // Verify main container structure exists
        cy.get('.container').should('be.visible');

        // Check Protocol Log section
        EmergencyProtocolPage.protocolLog.should('be.visible');
        cy.contains('h3', '📋 Protocol Log').should('be.visible');
        cy.get('.log-placeholder').should('contain.text', 'No log entries yet');

        // Check Global Timer section
        EmergencyProtocolPage.globalTimer.should('be.visible');
        cy.contains('h3', '⏰ Timer').should('be.visible');
        EmergencyProtocolPage.timerDisplay.should('contain.text', '--:--');
        EmergencyProtocolPage.timerInfo.should('contain.text', 'No active timer');

        // Check Emergency Response Steps section
        cy.get('.steps-section').should('be.visible');
        cy.contains('h3', '🚨 Emergency Response Protocol').should('be.visible');
    });

    it('validates all 5 protocol steps are present and properly structured', () => {
        // Check Step 1: Call G7c Device
        EmergencyProtocolPage.step1Container.should('be.visible');
        cy.contains('STEP 1: Call the G7c device and validate the need for assistance').should('be.visible');
        EmergencyProtocolPage.step1Button.should('contain.text', '📞 Call G7c Device');
        EmergencyProtocolPage.step1Status.should('contain.text', 'Pending');

        // Check Step 2: Send Message
        EmergencyProtocolPage.step2Container.should('be.visible');
        cy.contains('STEP 2: Send a message to the G7c device').should('be.visible');
        EmergencyProtocolPage.step2Button.should('contain.text', '💬 Send Message');
        EmergencyProtocolPage.step2Status.should('contain.text', 'Pending');

        // Check Step 3: Call User
        EmergencyProtocolPage.step3Container.should('be.visible');
        cy.contains('STEP 3: Call the phone number assigned to the user').should('be.visible');
        EmergencyProtocolPage.step3Button.should('contain.text', '📞 Call User');
        cy.contains('👤 Emily Garcia').should('be.visible');
        cy.contains('+1-313-635-3171').should('be.visible');

        // Check Step 4: Emergency Contacts
        cy.get('#step-4').should('be.visible');
        cy.contains('STEP 4: Contact emergency contacts in order of priority').should('be.visible');

        // Check Step 4-1: Daniel Reyes
        EmergencyProtocolPage.step41Container.should('be.visible');
        cy.contains('Daniel Reyes').should('be.visible');
        cy.contains('+1-587-333-9271').should('be.visible');
        cy.contains('Site Supervisor').should('be.visible');

        // Check Step 4-2: Vanessa Liu
        EmergencyProtocolPage.step42Container.should('be.visible');
        cy.contains('Vanessa Liu').should('be.visible');
        cy.contains('+1-780-452-1189').should('be.visible');
        cy.contains('Control Room Operator').should('be.visible');

        // Check Step 5: Dispatch (should be active from start)
        EmergencyProtocolPage.step5Container.should('be.visible');
        EmergencyProtocolPage.validateStepActive(5);
        cy.contains('STEP 5: If a valid and up to date location is available, dispatch emergency services').should('be.visible');
    });

    it('validates resolution section is present and functional', () => {
        // Check Resolution section
        cy.get('.resolution-section').should('be.visible');
        cy.contains('h3', '✅ RESOLUTION').should('be.visible');
        EmergencyProtocolPage.resolutionStatus.should('contain.text', 'Pending');

       // Check resolution dropdown options
EmergencyProtocolPage.resolutionReason.should('be.visible');
EmergencyProtocolPage.resolutionReason.find('option').should('have.length', 7); // Including default option
// Note: Options may not be individually visible in some browsers, but dropdown should work

        // Check resolution buttons
        EmergencyProtocolPage.resolveAlertButton.should('be.visible');
        EmergencyProtocolPage.resolveAlertButton.should('contain.text', '✅ Resolve Alert');
        EmergencyProtocolPage.cancelResolutionButton.should('be.visible');
        EmergencyProtocolPage.cancelResolutionButton.should('contain.text', '❌ Cancel Resolution');
    });

    it('validates manual notes section functionality', () => {
        // Check Add Note section
        cy.contains('h3', '📝 Add Note').should('be.visible');
        EmergencyProtocolPage.manualNotesTextarea.should('be.visible');
        EmergencyProtocolPage.manualNotesTextarea.should('have.attr', 'placeholder', 'Add notes here...');
        EmergencyProtocolPage.addNoteButton.should('contain.text', 'Post Note');

        // Test adding a note
        EmergencyProtocolPage.addManualNote('Smoke test note');
        EmergencyProtocolPage.validateLogEntry('Smoke test note');

        // Verify placeholder is gone after adding entry
        cy.get('.log-placeholder').should('not.exist');
    });

    it('validates initial page state and button states', () => {
        // Check Step 1 is active initially
        EmergencyProtocolPage.validateStepActive(1);

        // Check Step 2-4 are not active initially (disabled buttons)
        EmergencyProtocolPage.step2Button.should('be.disabled');
        EmergencyProtocolPage.step3Button.should('be.disabled');
        EmergencyProtocolPage.step41Button.should('be.disabled');
        EmergencyProtocolPage.step42Button.should('be.disabled');

        // Check Step 5 is always active (dispatch can be called anytime)
        EmergencyProtocolPage.validateStepActive(5);

        // Check timer is inactive initially
        EmergencyProtocolPage.validateTimerInactive();

        // Check resolution section is ready
        EmergencyProtocolPage.resolutionStatus.should('contain.text', 'Pending');
    });

    it('validates CSS styling and visual elements', () => {
        // Check main layout grid
        cy.get('.container').should('have.css', 'display', 'grid');
        cy.get('.container').should('have.css', 'grid-template-columns', '365px 200px 365px');

        // Check protocol log styling
        EmergencyProtocolPage.protocolLog.should('have.css', 'background-color', 'rgb(248, 249, 250)');
        EmergencyProtocolPage.protocolLog.should('have.css', 'border', '1px solid rgb(233, 236, 239)');
        
        // Check timer styling (inactive)
        EmergencyProtocolPage.globalTimer.should('have.class', 'timer-inactive');

        // Check steps section styling
        cy.get('.steps-section').should('have.css', 'background-color', 'rgb(255, 255, 255)');
        cy.get('.steps-section').should('have.css', 'border', '2px solid rgb(0, 123, 255)');

        // Check active step styling
        cy.get('#step-1.active').should('have.css', 'background-color', 'rgb(255, 243, 205)');
        cy.get('#step-5.active').should('have.css', 'background-color', 'rgb(255, 243, 205)');

        // Check resolution section styling
        cy.get('.resolution-section').should('have.css', 'border', '2px solid rgb(220, 53, 69)');
    });

    it('validates data attributes for testing are present', () => {
        // Check all major data-cy attributes exist
        const dataCySelectors = [
            'call-g7c-device',
            'send-message', 
            'call-user',
            'call-emergency-contact-4-1',
            'call-emergency-contact-4-2',
            'dispatch-decision',
            'dispatch-service',
            'call-dispatch',
            'skip-reason',
            'resolution-reason',
            'resolve-alert',
            'cancel-resolution',
            'cancel-global-timer',
            'add-manual-note'
        ];

        dataCySelectors.forEach(selector => {
            cy.get(`[data-cy="${selector}"]`).should('exist');
        });
    });

    it('validates fixture data integration', () => {
        // Verify Emily Garcia data is loaded from fixture
        cy.get('body').should('contain.text', 'Emily Garcia');
        cy.get('body').should('contain.text', '+1-313-635-3171');
    
        // Verify emergency contacts are displayed
        cy.get('body').should('contain.text', 'Daniel Reyes');
        cy.get('body').should('contain.text', 'Vanessa Liu');
    
        // Test fixture data by making a dispatch call to verify location data
        EmergencyProtocolPage.dispatchDecision.select('Yes');
        EmergencyProtocolPage.dispatchService.select('EMS');
        EmergencyProtocolPage.callDispatchButton.click();
    
        // Verify fixture location data appears in dispatch note
        EmergencyProtocolPage.step5Note.should('contain.value', '144252 434 Ave E, Aldersyde, AB T0L 0A0, Canada');
        EmergencyProtocolPage.step5Note.should('contain.value', '50.66004, -113.7685769');
    });

    it('validates basic interactivity without completing full workflow', () => {
        // Test Step 1 basic interaction
        EmergencyProtocolPage.step1Button.click();
        EmergencyProtocolPage.step1Outcome.should('be.visible');

        // Test dispatch decision interaction
        EmergencyProtocolPage.dispatchDecision.select('Yes');
        cy.get('#dispatch-service-container').should('be.visible');

        EmergencyProtocolPage.dispatchDecision.select('No');
        cy.get('#skip-reason-container').should('be.visible');

        // Test resolution dropdown
        EmergencyProtocolPage.resolutionReason.select('demo-training');
        EmergencyProtocolPage.resolutionReason.should('have.value', 'demo-training');

        // Test manual note basic functionality
        EmergencyProtocolPage.manualNotesTextarea.type('Basic smoke test interaction');
        EmergencyProtocolPage.addNoteButton.click();
        EmergencyProtocolPage.validateLogEntry('Basic smoke test interaction');
    });

    it('validates responsive design elements', () => {
        // Test different viewport sizes
        cy.viewport(1400, 900);
        cy.get('.container').should('be.visible');

        cy.viewport(1200, 800);
        cy.get('.container').should('be.visible');

        cy.viewport(1024, 768);
        cy.get('.container').should('be.visible');

        // Verify layout maintains structure
        cy.get('.protocol-log').should('be.visible');
        cy.get('.global-timer').should('be.visible');
        cy.get('.steps-section').should('be.visible');
    });
});