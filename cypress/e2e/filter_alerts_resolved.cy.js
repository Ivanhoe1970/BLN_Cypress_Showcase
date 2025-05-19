import LoginPage from '../pages/LoginPage';
import AlertsPage from '../pages/AlertsPage';

describe('Filter Alerts by Resolved Status', () => {
  before(() => {
    LoginPage.login(); // ✅ Reverted to stable UI login
  });  

  it('should filter alerts by Resolved status', () => {
    AlertsPage.visitAlertsPage();
    AlertsPage.selectStatus('Resolved');

    AlertsPage.validateFilteredStatus('Resolved');
  });
});
