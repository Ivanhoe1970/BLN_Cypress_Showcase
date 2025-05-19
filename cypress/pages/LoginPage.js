class LoginPage {
  get emailInput() { return cy.get('#email') };
  get passwordInput() { return cy.get('#password') };
  get signInButton() { return cy.get('#loginBtn') };
  get cookieBanner() { return cy.get('#cookiescript_header') };
  get acceptCookiesButton() { return cy.get('#cookiescript_accept') };

  visit() {
    cy.visit('/sign-in');
    this.cookieBanner.should('be.visible');
    this.acceptCookiesButton.click();
  };

  enterEmail(email) { this.emailInput.type(email) };
  enterPassword(password) { this.passwordInput.type(password, { log: false }) };
  clickSignIn() { this.signInButton.click() };

  validateLogin() {
    cy.url().should('include', '/ng/alerts');
    cy.get('.main-title', { timeout: 10000 }).should('have.text', 'Alerts');
  };

  login(email = Cypress.env('emailAddress'), password = Cypress.env('password')) {
    this.visit();
    this.enterEmail(email);
    this.enterPassword(password);
    this.clickSignIn();
    cy.visit('/ng/alerts');
    this.validateLogin();
  };
}

export default new LoginPage();
