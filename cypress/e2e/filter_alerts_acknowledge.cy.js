import LoginPage from '../pages/LoginPage';
import AlertsPage from '../pages/AlertsPage';

describe('Filter Alerts by Acknowledged Status', () => {
  before(() => {
    LoginPage.login(); // ✅ UI login
  });  

  it('should filter alerts by Acknowledged status', () => {
    AlertsPage.visitAlertsPage();
    AlertsPage.selectStatus('Acknowledged');

    cy.get('body').then(($body) => {
          if ($body.find('.alert-table tbody tr').length > 0) {
            AlertsPage.validateFilteredStatus('Acknowledged');
          } else {
            AlertsPage.validateNoResults();
          }
        });
      });
    });