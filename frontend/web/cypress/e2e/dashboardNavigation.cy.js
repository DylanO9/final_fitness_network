describe('Dashbord Navigation', () => {
  it('Should move from the landing page to the signup page', () => {
    cy.visit('http://localhost:3000');

    cy.get('#start_your_journey').click();

    cy.url().should('include', '/signup');
  });
});