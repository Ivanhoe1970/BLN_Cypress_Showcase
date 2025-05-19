Cypress.Commands.add('loginViaApi', () => {
    cy.request({
      method: 'POST',
      url: 'https://live.blacklinesafety.com/rest/auth-token',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        username: Cypress.env('emailAddress'),
        password: Cypress.env('password'),
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', response.body.token);
      });
    });
  });
  
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });
  