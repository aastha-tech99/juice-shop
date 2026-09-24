/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'
import { login, register } from './helpers/auth'
import { challenges } from '../../data/datacache'
import * as utils from '../../lib/utils'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/dataerasure', () => {
  void it('GET erasure form for logged-in users includes their email and security question', async () => {
    const { token } = await login(app, { email: 'bjoern@owasp.org', password: 'kitten lesser pooch karate buffoon indoors' })

    const res = await request(app)
      .get('/dataerasure/')
      .set({ Cookie: 'token=' + token })

    assert.equal(res.status, 200)
    assert.ok(res.text.includes('bjoern@owasp.org'))
    assert.ok(res.text.includes('Name of your favorite pet?'))
  })

  void it('GET erasure form rendering fails for users without assigned security answer', async () => {
    const { token } = await login(app, { email: 'bjoern.kimminich@gmail.com', password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=' })

    const res = await request(app)
      .get('/dataerasure/')
      .set({ Cookie: 'token=' + token })

    assert.equal(res.status, 500)
    assert.ok(res.text.includes('Error: No answer found!'))
  })

  void it('GET erasure form rendering fails on unauthenticated access', async () => {
    const res = await request(app)
      .get('/dataerasure/')

    assert.equal(res.status, 500)
    assert.ok(res.text.includes('Error: Blocked illegal activity'))
  })

  void it('POST erasure request anonymizes and deletes the user (GDPR Art. 17)', async () => {
    const erasureEmail = 'erasure-test-user@juice-sh.op'
    const erasurePassword = 'erasureTestPass123!'
    await register(app, { email: erasureEmail, password: erasurePassword })
    const { token } = await login(app, { email: erasureEmail, password: erasurePassword })

    const res = await request(app)
      .post('/dataerasure/')
      .set({ Cookie: 'token=' + token })
      .field('email', erasureEmail)

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('text/html'))

    // User should no longer be able to log in after erasure
    const loginRes = await request(app)
      .post('/rest/user/login')
      .set({ 'content-type': 'application/json' })
      .send({ email: erasureEmail, password: erasurePassword })

    assert.equal(loginRes.status, 401)
  })

  void it('POST erasure form  fails on unauthenticated access', async () => {
    const res = await request(app)
      .post('/dataerasure/')

    assert.equal(res.status, 500)
    assert.ok(res.text.includes('Error: Blocked illegal activity'))
  })

  void it('POST erasure request with empty layout parameter returns', async () => {
    const email = 'erasure-layout-null@juice-sh.op'
    const password = 'layoutNullPass123!'
    await register(app, { email, password })
    const { token } = await login(app, { email, password })

    const res = await request(app)
      .post('/dataerasure/')
      .set({ Cookie: 'token=' + token })
      .send({ layout: null })

    assert.equal(res.status, 200)
  })

  if (utils.isChallengeEnabled(challenges.lfrChallenge)) {
    void it('POST erasure request with non-existing file path as layout parameter throws error', async () => {
      const email = 'erasure-lfr-nofile@juice-sh.op'
      const password = 'lfrNoFilePass123!'
      await register(app, { email, password })
      const { token } = await login(app, { email, password })

      const res = await request(app)
        .post('/dataerasure/')
        .set({ Cookie: 'token=' + token })
        .send({ layout: '../this/file/does/not/exist' })

      assert.equal(res.status, 500)
      assert.ok(res.text.includes('no such file or directory'))
    })

    void it('POST erasure request with existing file path as layout parameter returns content truncated', async () => {
      const email = 'erasure-lfr-package@juice-sh.op'
      const password = 'lfrPackagePass123!'
      await register(app, { email, password })
      const { token } = await login(app, { email, password })

      const res = await request(app)
        .post('/dataerasure/')
        .set({ Cookie: 'token=' + token })
        .send({ layout: '../package.json' })

      assert.equal(res.status, 200)
      assert.ok(res.text.includes('juice-shop'))
      assert.ok(res.text.includes('......'))
    })
  }
})
