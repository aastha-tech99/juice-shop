/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { applyCoupon } from '../../routes/coupon'
import { BasketModel } from '../../models/basket'
import { CouponUsageModel } from '../../models/couponUsage'
import * as security from '../../lib/insecurity'

void describe('applyCoupon', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { params: { id: '1', coupon: '' } }
    res = { json: mock.fn(), status: mock.fn(() => res), send: mock.fn() }
    next = mock.fn()
    mock.restoreAll()
  })

  void it('should call next with error if basket does not exist', async () => {
    req.params.coupon = 'somecoupon'
    mock.method(BasketModel, 'findByPk', async () => null)
    mock.method(security, 'discountFromCoupon', () => undefined)

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    applyCoupon()(req, res, next)
    const err = await p as Error

    assert.match(err.message, /Basket with id=1 does not exist/)
  })

  void it('should reject coupon that has already been used by the same user', async () => {
    const validCoupon = 'n<MiifFb4l'
    req.params.coupon = encodeURIComponent(validCoupon)
    mock.method(security, 'discountFromCoupon', () => 20)
    mock.method(BasketModel, 'findByPk', async () => ({ id: 1, UserId: 42, update: mock.fn() }))
    mock.method(CouponUsageModel, 'findOne', async () => ({ id: 1, UserId: 42, coupon: validCoupon }))

    await applyCoupon()(req, res, next)

    assert.equal(res.status.mock.calls.length, 1)
    assert.deepEqual(res.status.mock.calls[0].arguments, [403])
    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments, [{ error: 'Coupon has already been used.' }])
  })

  void it('should allow coupon that has not been used by this user', async () => {
    const validCoupon = 'n<MiifFb4l'
    req.params.coupon = encodeURIComponent(validCoupon)
    mock.method(security, 'discountFromCoupon', () => 20)
    const basketUpdate = mock.fn()
    mock.method(BasketModel, 'findByPk', async () => ({ id: 1, UserId: 42, update: basketUpdate }))
    mock.method(CouponUsageModel, 'findOne', async () => null)

    await applyCoupon()(req, res, next)

    assert.equal(basketUpdate.mock.calls.length, 1)
    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments, [{ discount: 20 }])
  })

  void it('should return 404 for invalid coupon', async () => {
    req.params.coupon = 'invalidcoupon'
    mock.method(security, 'discountFromCoupon', () => undefined)
    mock.method(BasketModel, 'findByPk', async () => ({ id: 1, UserId: 42, update: mock.fn() }))

    await applyCoupon()(req, res, next)

    assert.equal(res.status.mock.calls.length, 1)
    assert.deepEqual(res.status.mock.calls[0].arguments, [404])
  })
})
