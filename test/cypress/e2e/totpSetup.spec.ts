import { passwords } from '../support/testCredentials'

describe('/#/basket', () => {
  describe('as wurstbrot', () => {
    beforeEach(() => {
      cy.login({
        email: 'wurstbrot',
        password: passwords.wurstbrot,
        totpSecret: 'IFTXE3SPOEYVURT2MRYGI52TKJ4HC3KH'
      })
    })

    it('should show an success message for 2fa enabled accounts', () => {
      cy.visit('/#/privacy-security/two-factor-authentication')
    })
  })

  describe('as amy', () => {
    beforeEach(() => {
      cy.login({
        email: 'amy',
        password: passwords.amy
      })
    })

    it('should be possible to setup 2fa for a account without 2fa enabled', async () => {
      cy.visit('/#/privacy-security/two-factor-authentication')

      cy.get('#initialToken')
        .should('have.attr', 'data-test-totp-secret')
        .then(($val) => {
          // console.log($val);
          cy.get('#currentPasswordSetup').type(passwords.amy)

          cy.task<string>('GenerateAuthenticator', $val).then((secret: string) => {
            cy.get('#initialToken').type(secret)
            cy.get('#setupTwoFactorAuth').click()

            cy.get('#currentPasswordDisable').type(passwords.amy)
            cy.get('#disableTwoFactorAuth').click()
          })
        })
      cy.get('.mat-snack-bar-container').should(
        'contain',
        'Two-Factor Authentication has been removed.'
      )
    })
  })
})
