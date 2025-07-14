import LoginPage from '../../pages/LoginPage';
import AlertsPage from '../../pages/AlertsPage';

describe('Filter Alerts by Acknowledged Status', () => {
  before(() => {
    LoginPage.login(); // ✅ UI login
  });

  it('should display Acknowledged alerts or show no-results message', () => {
    AlertsPage.visitAlertsPage();
    AlertsPage.selectStatus('Acknowledged');

    // Wait until either data rows OR the empty message is visible
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const hasAlerts = $body.find('.alert-table tbody tr').length > 0;

      if (hasAlerts) {
        AlertsPage.validateFilteredStatus('Acknowledged');
      } else {
        AlertsPage.validateNoResults(); // Only if the no-results message is clearly visible
      }
    });
  });
});
