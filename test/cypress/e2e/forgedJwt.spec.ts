describe('/', () => {
  describe('challenge "jwtUnsignedChallenge"', () => {
    it('should accept an unsigned token with email jwtn3d@juice-sh.op in the payload ', () => {
      cy.task('GenerateUnsignedJwt').then((token) => {
        cy.window().then(() => {
          localStorage.setItem('token', token as string)
        })
      })
      cy.visit('/')
      cy.expectChallengeSolved({ challenge: 'Unsigned JWT' })
    })
  })

  describe('challenge "jwtForgedChallenge"', () => {
    it('should accept a token HMAC-signed with public RSA key with email rsa_lord@juice-sh.op in the payload ', () => {
      cy.task('isWindows').then((isWindows) => {
        if (!isWindows) {
          cy.task('GenerateForgedHmacJwt').then((token) => {
            cy.window().then(() => {
              localStorage.setItem('token', token as string)
            })
          })
          cy.visit('/#/')

          cy.expectChallengeSolved({ challenge: 'Forged Signed JWT' })
        }
      })
    })
  })

  describe('challenge "iacLeakedKeyChallenge"', () => {
    it('should accept an RS256-signed token with email cloud-admin@juice-sh.op using the leaked private key', () => {
      cy.task('GenerateCloudAdminJwt').then((token) => {
        cy.window().then(() => {
          localStorage.setItem('token', token as string)
        })
      })
      cy.visit('/#/')
      cy.expectChallengeSolved({ challenge: 'Login Cloud Admin' })
    })
  })
})
