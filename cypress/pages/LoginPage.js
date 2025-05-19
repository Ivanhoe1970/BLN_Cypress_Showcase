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
    }
    
  
    login(email = Cypress.env('emailAddress'), password = Cypress.env('password')) {
      this.visit();
      this.enterEmail(email);
      this.enterPassword(password);
      this.clickSignIn();
      cy.visit('/ng/alerts');
      this.validateLogin();
    };
  
    loginViaAPI() {
      cy.session('api-login', () => {
        cy.request({
          method: 'POST',
          url: `${Cypress.config('baseUrl')}/api/auth/login`,
          body: {
            username: Cypress.env('emailAddress'),
            password: Cypress.env('password'),
          },
        }).then((res) => {
          expect(res.status).to.eq(200);
          window.localStorage.setItem('auth_token', res.body.token);
        });
      });
    };
  }
  
  export default new LoginPage();
  