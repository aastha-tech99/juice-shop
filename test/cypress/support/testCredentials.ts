/*
 * Shared test credentials for Cypress tests.
 * Values are injected via Cypress env config from process.env.
 * Rotate credentials: values in git history are compromised.
 */

export function getPassword (user: string): string {
  return (Cypress.env(`${user.toUpperCase()}_PASSWORD`) as string) || 'CHANGE_ME'
}

export const passwords: Record<string, string> = {
  admin: getPassword('ADMIN'),
  jim: getPassword('JIM'),
  bender: getPassword('BENDER'),
  bjoernGoogle: getPassword('BJOERNGOOGLE'),
  ciso: getPassword('CISO'),
  support: getPassword('SUPPORT'),
  morty: getPassword('MORTY'),
  rapper: getPassword('RAPPER'),
  jannik: getPassword('JANNIK'),
  wurstbrot: getPassword('TIMO'),
  amy: getPassword('AMY'),
  bjoern: getPassword('BJOERN'),
  bjoernOwasp: getPassword('BJOERNOWASP'),
  accountant: getPassword('ACCOUNTANT'),
  testing: getPassword('LETUSTEST'),
  demo: getPassword('TEST')
}
