import LoginPage from '../pages/LoginPage.js';

describe('Login Tests', () => {
  it('should log in successfully with valid credentials', () => {
    LoginPage.login();
  });

  it('should fail login with invalid credentials', () => {
    LoginPage.visit();
    LoginPage.enterEmail('invalid@blacklinesafety.com');
    LoginPage.enterPassword('InvalidPassword');
    LoginPage.clickSignIn();
  
    cy.contains('The email or password you entered was incorrect').should('be.visible');
  });
  
  it('should fail login with empty email', () => {
    LoginPage.visit();
    LoginPage.enterPassword('somepassword');
    LoginPage.clickSignIn();
    cy.url().should('include', '/sign-in');
  });
  
  it('should fail login with empty password', () => {
    LoginPage.visit();
    LoginPage.enterEmail(Cypress.env('emailAddress'));
    LoginPage.clickSignIn();
    cy.url().should('include', '/sign-in');
  });  

});