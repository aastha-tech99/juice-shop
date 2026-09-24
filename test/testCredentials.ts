/*
 * Shared test credentials loaded from environment variables.
 * Set JUICE_SHOP_<USER>_PASSWORD env vars to override defaults.
 * Rotate credentials: values in git history are compromised.
 */

export const passwords: Record<string, string> = {
  admin: process.env.JUICE_SHOP_ADMIN_PASSWORD || 'CHANGE_ME',
  jim: process.env.JUICE_SHOP_JIM_PASSWORD || 'CHANGE_ME',
  bender: process.env.JUICE_SHOP_BENDER_PASSWORD || 'CHANGE_ME',
  bjoernGoogle: process.env.JUICE_SHOP_BJOERNGOOGLE_PASSWORD || 'CHANGE_ME',
  ciso: process.env.JUICE_SHOP_CISO_PASSWORD || 'CHANGE_ME',
  support: process.env.JUICE_SHOP_SUPPORT_PASSWORD || 'CHANGE_ME',
  morty: process.env.JUICE_SHOP_MORTY_PASSWORD || 'CHANGE_ME',
  rapper: process.env.JUICE_SHOP_RAPPER_PASSWORD || 'CHANGE_ME',
  jannik: process.env.JUICE_SHOP_JANNIK_PASSWORD || 'CHANGE_ME',
  wurstbrot: process.env.JUICE_SHOP_TIMO_PASSWORD || 'CHANGE_ME',
  amy: process.env.JUICE_SHOP_AMY_PASSWORD || 'CHANGE_ME',
  bjoern: process.env.JUICE_SHOP_BJOERN_PASSWORD || 'CHANGE_ME',
  bjoernOwasp: process.env.JUICE_SHOP_BJOERNOWASP_PASSWORD || 'CHANGE_ME',
  chris: process.env.JUICE_SHOP_CHRIS_PASSWORD || 'CHANGE_ME',
  accountant: process.env.JUICE_SHOP_ACCOUNTANT_PASSWORD || 'CHANGE_ME',
  uvogin: process.env.JUICE_SHOP_UVOGIN_PASSWORD || 'CHANGE_ME',
  demo: process.env.JUICE_SHOP_TEST_PASSWORD || 'CHANGE_ME',
  john: process.env.JUICE_SHOP_JOHN_PASSWORD || 'CHANGE_ME',
  emma: process.env.JUICE_SHOP_EMMA_PASSWORD || 'CHANGE_ME',
  stan: process.env.JUICE_SHOP_STAN_PASSWORD || 'CHANGE_ME',
  evm: process.env.JUICE_SHOP_EVM_PASSWORD || 'CHANGE_ME',
  testing: process.env.JUICE_SHOP_LETUSTEST_PASSWORD || 'CHANGE_ME',
  cloudAdmin: process.env.JUICE_SHOP_CLOUDADMIN_PASSWORD || 'CHANGE_ME',
  basil: process.env.JUICE_SHOP_BASIL_PASSWORD || 'CHANGE_ME'
}
