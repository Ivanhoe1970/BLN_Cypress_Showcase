import LoginPage from '../pages/LoginPage';
import AlertsPage from '../pages/AlertsPage';

describe('Filter Alerts by Resolved Status', () => {
  before(() => {
    LoginPage.login(); // UI login
  });

  it('should filter alerts by Resolved status', () => {
    AlertsPage.visitAlertsPage();
    AlertsPage.selectStatus('Resolved');

    // Validate the filtered status using the new selector
    AlertsPage.validateFilteredStatus('Resolved');
  });
});
