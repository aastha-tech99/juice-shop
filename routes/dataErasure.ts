/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import express, { type NextFunction, type Request, type Response } from 'express'
import path from 'node:path'
import config from 'config'
import { themes } from '../views/themes/themes'
import * as utils from '../lib/utils'
import { AllHtmlEntities as Entities } from 'html-entities'

import { SecurityQuestionModel } from '../models/securityQuestion'
import { PrivacyRequestModel } from '../models/privacyRequests'
import { SecurityAnswerModel } from '../models/securityAnswer'
import { AddressModel } from '../models/address'
import { CardModel } from '../models/card'
import { ComplaintModel } from '../models/complaint'
import { FeedbackModel } from '../models/feedback'
import { MemoryModel } from '../models/memory'
import { RecycleModel } from '../models/recycle'
import { WalletModel } from '../models/wallet'
import { ImageCaptchaModel } from '../models/imageCaptcha'
import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'
import { UserModel } from '../models/user'

const entities = new Entities()

const router = express.Router()

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
    if (!loggedInUser) {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      return
    }
    const email = loggedInUser.data.email

    try {
      const answer = await SecurityAnswerModel.findOne({
        include: [{
          model: UserModel,
          where: { email }
        }]
      })
      if (answer == null) {
        throw new Error('No answer found!')
      }
      const question = await SecurityQuestionModel.findByPk(answer.SecurityQuestionId)
      if (question == null) {
        throw new Error('No question found!')
      }

      const themeKey = config.get<string>('application.theme') as keyof typeof themes
      const theme = themes[themeKey] || themes['bluegrey-lightgreen']
      res.render('dataErasureForm', {
        userEmail: email,
        securityQuestion: question.question,
        _title_: entities.encode(config.get<string>('application.name')),
        _favicon_: utils.extractFilename(config.get('application.favicon')),
        _bgColor_: theme.bgColor,
        _textColor_: theme.textColor,
        _navColor_: theme.navColor,
        _primLight_: theme.primLight,
        _primDark_: theme.primDark,
        _logo_: utils.extractFilename(config.get('application.logo'))
      })
    } catch (error) {
      next(error)
    }
  })().catch((error: unknown) => {
    next(error)
  })
})

interface DataErasureRequestParams {
  layout?: string
  email: string
  securityAnswer: string
}

router.post('/', (req: Request<Record<string, unknown>, Record<string, unknown>, DataErasureRequestParams>, res: Response, next: NextFunction): void => {
  (async () => {
    const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
    if (!loggedInUser) {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      return
    }

    try {
      await PrivacyRequestModel.create({
        UserId: loggedInUser.data.id,
        deletionRequested: true
      })

      const userId = loggedInUser.data.id

      // GDPR Art. 17: Actually erase user PII from all related tables
      await AddressModel.destroy({ where: { UserId: userId } })
      await CardModel.destroy({ where: { UserId: userId } })
      await ComplaintModel.destroy({ where: { UserId: userId } })
      await FeedbackModel.update({ UserId: null, comment: 'deleted' }, { where: { UserId: userId } })
      await MemoryModel.destroy({ where: { UserId: userId } })
      await RecycleModel.destroy({ where: { UserId: userId } })
      await SecurityAnswerModel.destroy({ where: { UserId: userId } })
      await WalletModel.destroy({ where: { UserId: userId } })
      await ImageCaptchaModel.destroy({ where: { UserId: userId } })

      // Anonymize and deactivate the user account
      const deletedEmail = `deleted_${userId}@deleted.local`
      await UserModel.update(
        {
          email: deletedEmail,
          username: `deleted_${userId}`,
          password: 'deleted',
          lastLoginIp: '0.0.0.0',
          profileImage: '/assets/public/images/uploads/default.svg',
          totpSecret: '',
          deluxeToken: '',
          isActive: false
        },
        { where: { id: userId } }
      )
      await UserModel.destroy({ where: { id: userId } })

      // Remove the authenticated session and revoke the token
      const token = req.cookies.token
      if (token) {
        security.revokeToken(token)
        delete security.authenticatedUsers.tokenMap[token]
      }

      res.clearCookie('token')

      const themeKey = config.get<string>('application.theme') as keyof typeof themes
      const theme = themes[themeKey] || themes['bluegrey-lightgreen']
      const themeVars = {
        _title_: entities.encode(config.get<string>('application.name')),
        _favicon_: utils.extractFilename(config.get('application.favicon')),
        _bgColor_: theme.bgColor,
        _textColor_: theme.textColor,
        _navColor_: theme.navColor,
        _primLight_: theme.primLight,
        _primDark_: theme.primDark,
        _logo_: utils.extractFilename(config.get('application.logo'))
      }

      if (req.body.layout && utils.isChallengeEnabled(challenges.lfrChallenge)) {
        const filePath: string = path.resolve(req.body.layout).toLowerCase()
        const isForbiddenFile: boolean = (filePath.includes('ftp') || filePath.includes('ctf.key') || filePath.includes('encryptionkeys'))
        if (!isForbiddenFile) {
          res.render('dataErasureResult', {
            ...req.body,
            ...themeVars
          }, (error, html) => {
            if (!html || error) {
              next(new Error(error.message))
            } else {
              const sendlfrResponse: string = html.slice(0, 100) + '......'
              res.send(sendlfrResponse)
              challengeUtils.solveIf(challenges.lfrChallenge, () => { return true })
            }
          })
        } else {
          next(new Error('File access not allowed'))
        }
      } else {
        res.render('dataErasureResult', {
          ...req.body,
          ...themeVars
        })
      }
    } catch (error) {
      next(error)
    }
  })().catch((error: unknown) => {
    next(error)
  })
})

export default router
