/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { BasketModel } from '../models/basket'
import { CouponUsageModel } from '../models/couponUsage'
import * as security from '../lib/insecurity'

export function applyCoupon () {
  return (req: Request, res: Response, next: NextFunction) => {
    const { params } = req
    void (async () => {
      const id = params.id
      let coupon: string | undefined | null = params.coupon ? decodeURIComponent(params.coupon) : undefined
      const discount = security.discountFromCoupon(coupon)
      coupon = discount ? coupon : null

      const basket = await BasketModel.findByPk(id)
      if (!basket) {
        next(new Error(`Basket with id=${id} does not exist.`))
        return
      }

      // Enforce per-user coupon usage limit (CWE-799)
      if (coupon && basket.UserId) {
        const usageCount = await CouponUsageModel.count({
          where: { UserId: basket.UserId, coupon }
        })
        if (usageCount >= security.MAX_COUPON_USES_PER_USER) {
          res.status(403).json({ error: 'Coupon has already been used.' })
          return
        }
      }

      await basket.update({ coupon: coupon?.toString() })
      if (discount) {
        res.json({ discount })
      } else {
        res.status(404).send('Invalid coupon.')
      }
    })().catch((error: unknown) => {
      next(error)
    })
  }
}
