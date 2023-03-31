import { customElementName, detailsTitle, entityIdCell } from '../support';

describe('Main', () => {
beforeEach(() => {
  cy.getOauth2Data();
  cy.get('@oauth2Data').then(oauth2Data => {
    cy.keycloackLogin(oauth2Data, 'user');
  });
});

afterEach(() => {
  cy.get('@oauth2Data').then(oauth2Data => {
    cy.keycloackLogout(oauth2Data);
  });
  cy.clearCache();
});

  describe('Details widget', () => {
    it('should load the page', () => {
      cy.get(customElementName).should('exist');
    });

    it('should display the right values', () => {
      cy.get(detailsTitle).should('be.visible').should('have.text', "Details about 'Conference'");
      cy.get(entityIdCell).should('not.be.empty');
      cy.contains('entities.conference.id').should('be.visible');
      cy.contains('entities.conference.name').should('be.visible');
      cy.contains('entities.conference.location').should('be.visible');
    });
  });
});
