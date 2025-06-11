// Visit local protocol app
Cypress.Commands.add('visitProtocol', () => {
  cy.visit(Cypress.env('protocolPath'));
});

// Visit Blackline Live
Cypress.Commands.add('visitBLN', () => {
  cy.visit(Cypress.env('blnUrl'));
});

// Blackline Live login (not used for protocol app)
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

// Prevent app errors from failing the test
Cypress.on('uncaught:exception', () => false);
