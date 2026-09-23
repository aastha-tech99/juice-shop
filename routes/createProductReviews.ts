/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'

import * as challengeUtils from '../lib/challengeUtils'
import { reviewsCollection } from '../data/mongodb'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'

export function createProductReviews () {
  return (req: Request, res: Response) => {
    (async () => {
      const user = security.authenticatedUsers.from(req)
      challengeUtils.solveIf(
        challenges.forgedReviewChallenge,
        () => user?.data?.email !== req.body.author
      )

      try {
        await reviewsCollection.insert({
          product: req.params.id,
          message: req.body.message,
          author: req.body.author,
          likesCount: 0,
          likedBy: []
        })
        return res.status(201).json({ status: 'success' })
      } catch (err: unknown) {
        res.status(500).json(utils.getErrorMessage(err))
      }
    })().catch(() => { res.status(500).json({ error: 'Unexpected error' }) })
  }
}
