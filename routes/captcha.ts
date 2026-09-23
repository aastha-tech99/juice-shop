/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { CaptchaModel } from '../models/captcha'

function safeEvalMath (expression: string): number {
  const match = expression.match(/^(\d+)([+\-*])(\d+)([+\-*])(\d+)$/)
  if (!match) throw new Error('Invalid captcha expression')
  const nums = [Number(match[1]), Number(match[3]), Number(match[5])]
  const ops = [match[2], match[4]]
  // Process multiplication first (higher precedence)
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === '*') {
      nums.splice(i, 2, nums[i] * nums[i + 1])
      ops.splice(i, 1)
      i--
    }
  }
  // Process addition and subtraction left to right
  let result = nums[0]
  for (let i = 0; i < ops.length; i++) {
    result = ops[i] === '+' ? result + nums[i + 1] : result - nums[i + 1]
  }
  return result
}

export function captchas () {
  return async (req: Request, res: Response) => {
    const captchaId = req.app.locals.captchaId++
    const operators = ['*', '+', '-']

    const firstTerm = Math.floor((Math.random() * 10) + 1)
    const secondTerm = Math.floor((Math.random() * 10) + 1)
    const thirdTerm = Math.floor((Math.random() * 10) + 1)

    const firstOperator = operators[Math.floor((Math.random() * 3))]
    const secondOperator = operators[Math.floor((Math.random() * 3))]

    const expression = firstTerm.toString() + firstOperator + secondTerm.toString() + secondOperator + thirdTerm.toString()
    const answer = safeEvalMath(expression).toString()

    const captcha = {
      captchaId,
      captcha: expression,
      answer
    }
    const captchaInstance = CaptchaModel.build(captcha)
    await captchaInstance.save()
    res.json(captcha)
  }
}

export const verifyCaptcha = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const captcha = await CaptchaModel.findOne({ where: { captchaId: req.body.captchaId } })
    if ((captcha != null) && req.body.captcha === captcha.answer) {
      next()
    } else {
      res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'))
    }
  } catch (error) {
    next(error)
  }
}
