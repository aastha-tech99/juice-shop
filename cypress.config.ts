import { defineConfig } from 'cypress'
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
  env: {
    ADMIN_PASSWORD: process.env.JUICE_SHOP_ADMIN_PASSWORD || 'CHANGE_ME',
    JIM_PASSWORD: process.env.JUICE_SHOP_JIM_PASSWORD || 'CHANGE_ME',
    BENDER_PASSWORD: process.env.JUICE_SHOP_BENDER_PASSWORD || 'CHANGE_ME',
    BJOERNGOOGLE_PASSWORD: process.env.JUICE_SHOP_BJOERNGOOGLE_PASSWORD || 'CHANGE_ME',
    CISO_PASSWORD: process.env.JUICE_SHOP_CISO_PASSWORD || 'CHANGE_ME',
    SUPPORT_PASSWORD: process.env.JUICE_SHOP_SUPPORT_PASSWORD || 'CHANGE_ME',
    MORTY_PASSWORD: process.env.JUICE_SHOP_MORTY_PASSWORD || 'CHANGE_ME',
    RAPPER_PASSWORD: process.env.JUICE_SHOP_RAPPER_PASSWORD || 'CHANGE_ME',
    JANNIK_PASSWORD: process.env.JUICE_SHOP_JANNIK_PASSWORD || 'CHANGE_ME',
    TIMO_PASSWORD: process.env.JUICE_SHOP_TIMO_PASSWORD || 'CHANGE_ME',
    AMY_PASSWORD: process.env.JUICE_SHOP_AMY_PASSWORD || 'CHANGE_ME',
    BJOERN_PASSWORD: process.env.JUICE_SHOP_BJOERN_PASSWORD || 'CHANGE_ME',
    BJOERNOWASP_PASSWORD: process.env.JUICE_SHOP_BJOERNOWASP_PASSWORD || 'CHANGE_ME',
    ACCOUNTANT_PASSWORD: process.env.JUICE_SHOP_ACCOUNTANT_PASSWORD || 'CHANGE_ME',
    LETUSTEST_PASSWORD: process.env.JUICE_SHOP_LETUSTEST_PASSWORD || 'CHANGE_ME',
    TEST_PASSWORD: process.env.JUICE_SHOP_TEST_PASSWORD || 'CHANGE_ME'
  },
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
        }
      })
    }
  }
})
