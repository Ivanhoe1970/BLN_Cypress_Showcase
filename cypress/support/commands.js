Cypress.Commands.add('loginViaApi', () => {
  // Make the login request to the correct API endpoint
  cy.request({
    method: 'POST',
    url: 'https://live.blacklinesafety.com/rest/auth-token',  // Correct login API endpoint
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      username: Cypress.env('emailAddress'),
      password: Cypress.env('password'),
    },
    failOnStatusCode: false,  // Don't fail the test if the response status is not 2xx
  }).then((response) => {
    // Ensure we got a 200 OK response
    expect(response.status).to.eq(200);
    
    // Save the token in localStorage
    window.localStorage.setItem('auth_token', response.body.token); // Assuming the response has the token
  });
});

Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
