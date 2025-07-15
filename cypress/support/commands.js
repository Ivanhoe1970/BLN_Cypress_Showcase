// ========================================
// LIVE BLACKLINE PORTAL COMMANDS
// ========================================

Cypress.Commands.add('loginViaApi', () => {
  // Make the login request to the correct API endpoint
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}/auth/login`,
    body: {
      username: Cypress.env('PORTAL_USERNAME'),
      password: Cypress.env('PORTAL_PASSWORD')
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    // Store the authentication token
    window.localStorage.setItem('authToken', response.body.token);
    // Set the token in session storage as well if needed
    window.sessionStorage.setItem('authToken', response.body.token);
  });
});

Cypress.Commands.add('loginViaUI', () => {
  cy.visit('/login');
  cy.get('#username').type(Cypress.env('PORTAL_USERNAME'));
  cy.get('#password').type(Cypress.env('PORTAL_PASSWORD'));
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

// ========================================
// GAS MONITORING COMMANDS
// ========================================

Cypress.Commands.add('navigateToGasMonitoring', () => {
  cy.get('[data-cy="nav-gas-monitoring"]').click();
  cy.url().should('include', '/gas-monitoring');
  cy.get('[data-cy="gas-monitoring-header"]').should('be.visible');
});

Cypress.Commands.add('selectDevice', (deviceId) => {
  cy.get(`[data-cy="device-${deviceId}"]`).click();
  cy.get('[data-cy="device-details"]').should('be.visible');
});

Cypress.Commands.add('triggerGasAlert', (alertType, gasLevel) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}/gas-alerts/simulate`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
    },
    body: {
      alertType: alertType,
      gasLevel: gasLevel,
      deviceId: Cypress.env('TEST_DEVICE_ID'),
      timestamp: new Date().toISOString()
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

Cypress.Commands.add('acknowledgeAlert', (alertId) => {
  cy.get(`[data-cy="acknowledge-alert-${alertId}"]`).click();
  cy.get('[data-cy="acknowledgment-modal"]').should('be.visible');
  cy.get('[data-cy="acknowledge-comment"]').type('Alert acknowledged via automation');
  cy.get('[data-cy="confirm-acknowledgment"]').click();
  cy.get('[data-cy="acknowledgment-success"]').should('be.visible');
});

Cypress.Commands.add('verifyAlertStatus', (alertId, expectedStatus) => {
  cy.get(`[data-cy="alert-${alertId}"]`).within(() => {
    cy.get('[data-cy="alert-status"]').should('contain', expectedStatus);
  });
});

// ========================================
// GAS PROTOCOL COMMANDS
// ========================================

Cypress.Commands.add('initiateGasProtocol', (protocolType = 'emergency') => {
  cy.get('[data-cy="initiate-protocol"]').click();
  cy.get('[data-cy="protocol-type-selector"]').select(protocolType);
  cy.get('[data-cy="confirm-protocol"]').click();
  cy.get('[data-cy="protocol-initiated"]').should('be.visible');
});

Cypress.Commands.add('verifyProtocolSteps', (expectedSteps) => {
  expectedSteps.forEach((step, index) => {
    cy.get(`[data-cy="protocol-step-${index + 1}"]`).within(() => {
      cy.get('[data-cy="step-title"]').should('contain', step.title);
      cy.get('[data-cy="step-description"]').should('contain', step.description);
    });
  });
});

Cypress.Commands.add('completeProtocolStep', (stepNumber) => {
  cy.get(`[data-cy="protocol-step-${stepNumber}"]`).within(() => {
    cy.get('[data-cy="step-checkbox"]').check();
    cy.get('[data-cy="step-timestamp"]').should('be.visible');
  });
});

Cypress.Commands.add('addProtocolComment', (stepNumber, comment) => {
  cy.get(`[data-cy="protocol-step-${stepNumber}"]`).within(() => {
    cy.get('[data-cy="add-comment"]').click();
    cy.get('[data-cy="comment-input"]').type(comment);
    cy.get('[data-cy="save-comment"]').click();
  });
});

Cypress.Commands.add('verifyProtocolCompletion', () => {
  cy.get('[data-cy="protocol-completion-status"]').should('contain', 'Complete');
  cy.get('[data-cy="protocol-completion-time"]').should('be.visible');
  cy.get('[data-cy="protocol-summary"]').should('be.visible');
});

// ========================================
// EMPLOYEE MANAGEMENT COMMANDS
// ========================================

Cypress.Commands.add('searchEmployee', (employeeName) => {
  cy.get('[data-cy="employee-search"]').type(employeeName);
  cy.get('[data-cy="search-button"]').click();
  cy.get('[data-cy="employee-results"]').should('be.visible');
});

Cypress.Commands.add('selectEmployee', (employeeId) => {
  cy.get(`[data-cy="employee-${employeeId}"]`).click();
  cy.get('[data-cy="employee-details"]').should('be.visible');
});

Cypress.Commands.add('verifyEmployeeStatus', (employeeId, expectedStatus) => {
  cy.get(`[data-cy="employee-${employeeId}"]`).within(() => {
    cy.get('[data-cy="employee-status"]').should('contain', expectedStatus);
  });
});

// ========================================
// DEVICE MANAGEMENT COMMANDS
// ========================================

Cypress.Commands.add('verifyDeviceStatus', (deviceId, expectedStatus) => {
  cy.get(`[data-cy="device-${deviceId}"]`).within(() => {
    cy.get('[data-cy="device-status"]').should('contain', expectedStatus);
  });
});

Cypress.Commands.add('calibrateDevice', (deviceId) => {
  cy.get(`[data-cy="device-${deviceId}"]`).within(() => {
    cy.get('[data-cy="calibrate-button"]').click();
  });
  cy.get('[data-cy="calibration-modal"]').should('be.visible');
  cy.get('[data-cy="start-calibration"]').click();
  cy.get('[data-cy="calibration-progress"]').should('be.visible');
});

Cypress.Commands.add('verifyDeviceCalibration', (deviceId, expectedDate) => {
  cy.get(`[data-cy="device-${deviceId}"]`).within(() => {
    cy.get('[data-cy="last-calibration"]').should('contain', expectedDate);
  });
});

// ========================================
// REPORTING COMMANDS
// ========================================

Cypress.Commands.add('generateGasReport', (reportType, dateRange) => {
  cy.get('[data-cy="generate-report"]').click();
  cy.get('[data-cy="report-type"]').select(reportType);
  cy.get('[data-cy="date-from"]').type(dateRange.from);
  cy.get('[data-cy="date-to"]').type(dateRange.to);
  cy.get('[data-cy="generate-report-button"]').click();
  cy.get('[data-cy="report-generation-progress"]').should('be.visible');
});

Cypress.Commands.add('verifyReportContent', (expectedContent) => {
  cy.get('[data-cy="report-content"]').should('be.visible');
  expectedContent.forEach((content) => {
    cy.get('[data-cy="report-content"]').should('contain', content);
  });
});

Cypress.Commands.add('downloadReport', (format = 'pdf') => {
  cy.get(`[data-cy="download-${format}"]`).click();
  cy.readFile(`cypress/downloads/gas-report.${format}`).should('exist');
});

// ========================================
// UTILITY COMMANDS
// ========================================

Cypress.Commands.add('waitForPageLoad', (timeout = 10000) => {
  cy.get('[data-cy="loading-indicator"]', { timeout }).should('not.exist');
  cy.get('[data-cy="page-content"]').should('be.visible');
});

Cypress.Commands.add('verifyNotification', (message, type = 'success') => {
  cy.get(`[data-cy="notification-${type}"]`).should('be.visible');
  cy.get(`[data-cy="notification-${type}"]`).should('contain', message);
});

Cypress.Commands.add('dismissNotification', () => {
  cy.get('[data-cy="notification-dismiss"]').click();
  cy.get('[data-cy="notification"]').should('not.exist');
});

Cypress.Commands.add('verifyTimestamp', (selector, expectedFormat = 'MM/DD/YYYY HH:mm:ss') => {
  cy.get(selector).should('be.visible').then(($element) => {
    const timestamp = $element.text();
    expect(timestamp).to.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
  });
});

// ========================================
// API VERIFICATION COMMANDS
// ========================================

Cypress.Commands.add('verifyApiResponse', (endpoint, expectedStatus = 200) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('API_BASE_URL')}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(expectedStatus);
  });
});

Cypress.Commands.add('verifyGasLevels', (deviceId, expectedLevels) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('API_BASE_URL')}/devices/${deviceId}/gas-levels`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('gasLevels');
    expectedLevels.forEach((level) => {
      expect(response.body.gasLevels).to.include(level);
    });
  });
});

// ========================================
// CLEANUP COMMANDS
// ========================================

Cypress.Commands.add('cleanupTestData', () => {
  // Clean up any test alerts
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('API_BASE_URL')}/test-data/alerts`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
    },
    failOnStatusCode: false
  });
  
  // Clean up test protocols
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('API_BASE_URL')}/test-data/protocols`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
    },
    failOnStatusCode: false
  });
});

// ========================================
// ACCESSIBILITY COMMANDS
// ========================================

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y();
});

Cypress.Commands.add('verifyKeyboardNavigation', (selectors) => {
  selectors.forEach((selector) => {
    cy.get(selector).focus().should('have.focus');
    cy.get(selector).type('{enter}');
  });
});