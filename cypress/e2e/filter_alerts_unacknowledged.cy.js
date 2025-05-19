import LoginPage from '../pages/LoginPage';
import AlertsPage from '../pages/AlertsPage';

describe('Filter Alerts by Unacknowledged Status', () => {
  before(() => {
    LoginPage.login(); // UI login
  });

  it('should filter alerts by Unacknowledged status', () => {
    AlertsPage.visitAlertsPage(); // Navigate to Alerts page
    AlertsPage.selectStatus('Unacknowledged'); // Apply "Unacknowledged" filter

    // Conditional check for results
    cy.get('body').then(($body) => {
      if ($body.find('.alert-table tbody tr').length > 0) {
        // If rows exist, validate filtered status
        AlertsPage.validateFilteredStatus('Unacknowledged');
      } else {
        // If no rows, validate "No results" message
        AlertsPage.validateNoResults();
      }
    });
  });
});