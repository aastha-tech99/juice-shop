import { defineConfig } from 'cypress'
import crypto from 'node:crypto'
import * as security from './lib/insecurity'
import config from 'config'
import type { Memory as MemoryConfig, Product as ProductConfig } from './lib/config.schema'
import * as utils from './lib/utils'
import { generateSync } from 'otplib'

export default defineConfig({
  projectId: '3hrkhu',
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 2
  },
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'test/cypress/e2e/**.spec.ts',
    downloadsFolder: 'test/cypress/downloads',
    fixturesFolder: false,
    supportFile: 'test/cypress/support/e2e.ts',
    setupNodeEvents (on: any) {
      on('task', {
        GenerateCoupon (discount: number) {
          return security.generateCoupon(discount)
        },
        GetBlueprint () {
          for (const product of config.get<ProductConfig[]>('products')) {
            if (product.fileForRetrieveBlueprintChallenge) {
              const blueprint = product.fileForRetrieveBlueprintChallenge
              return blueprint
            }
          }
        },
        GetChristmasProduct () {
          return config.get<ProductConfig[]>('products').filter(
            (product) => product.useForChristmasSpecialChallenge
          )[0]
        },
        GetFromMemories (property: string) {
          for (const memory of config.get<MemoryConfig[]>('memories') as any) {
            if (memory[property]) {
              return memory[property]
            }
          }
        },
        GetFromConfig (variable: string) {
          return config.get(variable)
        },
        GetOverwriteUrl () {
          return config.get('challenges.overwriteUrlForProductTamperingChallenge')
        },
        GetPastebinLeakProduct () {
          return config.get<ProductConfig[]>('products').filter(
            (product) => product.keywordsForPastebinDataLeakChallenge
          )[0]
        },
        GetTamperingProductId () {
          const products = config.get<ProductConfig[]>('products')
          for (let i = 0; i < products.length; i++) {
            if (products[i].urlForProductTamperingChallenge) {
              return i + 1
            }
          }
        },
        GenerateAuthenticator (inputString: string) {
          return generateSync({ secret: inputString })
        },
        toISO8601 () {
          const date = new Date()
          return utils.toISO8601(date)
        },
        isDocker () {
          return utils.isDocker()
        },
        isWindows () {
          return utils.isWindows()
        },
        GenerateUnsignedJwt () {
          const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
          const payload = Buffer.from(JSON.stringify({ data: { email: 'jwtn3d@juice-sh.op' }, iat: 1508639612, exp: 9999999999 })).toString('base64url')
          return `${header}.${payload}.`
        },
        GenerateForgedHmacJwt () {
          const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'HS256' })).toString('base64url')
          const payload = Buffer.from(JSON.stringify({ data: { email: 'rsa_lord@juice-sh.op' }, iat: Math.floor(Date.now() / 1000) })).toString('base64url')
          const signature = crypto.createHmac('sha256', security.publicKey)
            .update(`${header}.${payload}`)
            .digest('base64url')
          return `${header}.${payload}.${signature}`
        },
        GenerateCloudAdminJwt () {
          return security.authorize({ data: { email: 'cloud-admin@juice-sh.op' } })
        }
      })
    }
  }
})
