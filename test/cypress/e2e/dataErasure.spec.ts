describe('/dataerasure', () => {
  beforeEach(() => {
    cy.login({ email: 'admin', password: 'admin123' })
  })

  describe('challenge "lfrChallenge"', () => {
    it('should block local file read attack via path traversal in layout parameter', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.window().then(async () => {
            const params = 'layout=../package.json'

            const response = await fetch(`${Cypress.config('baseUrl')}/dataerasure`, {
              method: 'POST',
              cache: 'no-cache',
              headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                Origin: `${Cypress.config('baseUrl')}/`,
                Cookie: `token=${localStorage.getItem('token')}`
              },
              body: params
            })
            expect(response.status).to.equal(500)
          })
        }
      })
    })
  })
})
