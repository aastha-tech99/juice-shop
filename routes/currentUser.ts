/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as challengeUtils from '../lib/challengeUtils'
import { type Request, type Response } from 'express'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'

export function retrieveLoggedInUser () {
  return (req: Request, res: Response) => {
    let user
    let response: any
    const emptyUser = { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined }
    try {
      if (security.verify(req.cookies.token)) {
        user = security.authenticatedUsers.get(req.cookies.token)

        // Parse the fields parameter into an array, splitting by comma.
        // If not provided, both these variables will be undefined.
        const fieldsParam = req.query?.fields as string | undefined
        const requestedFields = fieldsParam ? fieldsParam.split(',').map(f => f.trim()) : []

        // Allowlist of properties that may be requested via the fields parameter
        const allowedFields = new Set(['id', 'email', 'lastLoginIp', 'profileImage'])

        const baseUserMap = new Map<string, unknown>()

        if (requestedFields.length > 0) {
          // When fields are specified, return only those fields if they are in the allowlist
          const dataEntries = user?.data ? new Map(Object.entries(user.data)) : new Map()
          for (const field of requestedFields) {
            if (allowedFields.has(field) && dataEntries.has(field) && dataEntries.get(field) !== undefined) {
              baseUserMap.set(field, dataEntries.get(field))
            }
          }
        } else {
          // If no fields parameter, return standard fields (not password field)
          baseUserMap.set('id', user?.data?.id)
          baseUserMap.set('email', user?.data?.email)
          baseUserMap.set('lastLoginIp', user?.data?.lastLoginIp)
          baseUserMap.set('profileImage', user?.data?.profileImage)
        }

        response = { user: Object.fromEntries(baseUserMap) }
      } else {
        response = { user: emptyUser }
      }
    } catch (err) {
      response = { user: emptyUser }
    }
    // Solve passwordHashLeakChallenge when password field is included in response
    challengeUtils.solveIf(challenges.passwordHashLeakChallenge, () => response?.user?.password)

    if (req.query.callback === undefined) {
      res.json(response)
    } else {
      challengeUtils.solveIf(challenges.emailLeakChallenge, () => { return true })
      res.jsonp(response)
    }
  }
}
