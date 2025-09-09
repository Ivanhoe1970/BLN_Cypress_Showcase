// cypress/e2e/regression-suite/component-tests/timer-management.cy.js
import emergencyPage from '../../../pages/EmergencyProtocolPage';

describe('Timer Management System', () => {
  beforeEach(() => {
    emergencyPage.visit();
    emergencyPage.openDemoPanel();
    cy.get('[data-cy="h2s-standard-flow-btn"]').click();
    cy.wait(3000);
  });

  it('should initialize timer correctly for gas alerts', () => {
    // Step 1: Click 'Call device' button
    cy.get('#step-1').within(() => {
      cy.contains('button', 'Call device').click();
    });
    
    cy.wait(1000);
    
    // Step 2: Select 'No answer' from dropdown
    cy.get('#step-1-select').should('be.visible');
    cy.get('#step-1-select').select('no-answer');
    
    // Step 3: Click 'Post Note' to complete step 1
    cy.get('#step-1-post-btn').should('not.be.disabled');
    cy.get('#step-1-post-btn').click();
    
    cy.wait(2000);
    
    // Now Step 2 should be active - click 'Message device' to start timer
    cy.get('#step-2').within(() => {
      cy.contains('button', 'Message device').click();
    });
    
    cy.wait(3000);
    
    // Timer should be running and showing countdown
    emergencyPage.timerDisplay
      .invoke('text')
      .should('match', /^\s*\d{2}:\d{2}\s*$/);
    
    emergencyPage.timerInfo.should('contain.text', 'Waiting for device reply');
  });

  it('should handle timer cancellation', () => {
    // Use existing method that works
    emergencyPage.startTimer('test-timer', 'Test Timer', 30);
    cy.wait(1000);
    
    emergencyPage.timerDisplay.should('not.contain', '--:--');
    
    emergencyPage.cancelAnyTimer();
    cy.wait(1000);
    
    emergencyPage.timerDisplay.should('contain', '--:--');
  });

  it('should handle timer expiry correctly', () => {
    // Start a short timer without using cy.clock to avoid mocking issues
    emergencyPage.startTimer('test-timer', 'Test Timer', 3);
    emergencyPage.timerDisplay.should('not.contain', '--:--');
    
    // Wait for actual expiry
    cy.wait(4000);
    
    // Check for expiry behavior - timer should reset or show expiry message
    cy.then(() => {
      // Either timer resets to --:-- or shows expiry in logs
      cy.get('body').then(($body) => {
        const timerText = $body.find('[data-cy="timer-display"]').text();
        if (timerText.includes('--:--')) {
          // Timer reset - this is valid expiry behavior
          emergencyPage.timerDisplay.should('contain', '--:--');
        } else {
          // Check for expiry in logs
          emergencyPage.validateLogEntry(/TIMER EXPIRED|expired|timeout/i);
        }
      });
    });
  });

  it('should handle concurrent timer management', () => {
    // Test that only one timer can be active at a time
    emergencyPage.startTimer('timer-1', 'First Timer', 30);
    cy.wait(1000);
    
    // Check timer info instead of display text since display shows countdown, not label
    emergencyPage.timerInfo.should('contain', 'First Timer');
    
    // Starting another timer should replace the first
    emergencyPage.startTimer('timer-2', 'Second Timer', 30);
    cy.wait(1000);
    
    emergencyPage.timerInfo.should('contain', 'Second Timer');
  });
});