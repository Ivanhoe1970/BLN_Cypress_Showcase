import LoginPage from '../../pages/LoginPage';
import AlertsPage from '../../pages/AlertsPage';

describe('Filter Alerts by Unacknowledged Status', () => {
  before(() => {
    LoginPage.login(); // ✅ UI login
  });  

  it('should filter alerts by Unacknowledged status', () => {
    AlertsPage.visitAlertsPage();
    AlertsPage.selectStatus('Unacknowledged');

    cy.get('body').then(($body) => {
      if ($body.find('.alert-table tbody tr').length > 0) {
        AlertsPage.validateFilteredStatus('Unacknowledged');
      } else {
        AlertsPage.validateNoResults();
      }
    });
  });
});