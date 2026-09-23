/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { CaptchaModel } from '../models/captcha'
import * as security from '../lib/insecurity'

function applyOp (x: number, op: string, y: number): number {
  switch (op) {
    case '*': return x * y
    case '+': return x + y
    case '-': return x - y
    default: throw new Error(`Unknown operator: ${op}`)
  }
}

function safeEvaluateArithmetic (a: number, op1: string, b: number, op2: string, c: number): number {
  // Respect standard operator precedence: * binds tighter than + and -
  if (op2 === '*' && op1 !== '*') {
    return applyOp(a, op1, applyOp(b, op2, c))
  }
  return applyOp(applyOp(a, op1, b), op2, c)
}

export function captchas () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const captchaId = req.app.locals.captchaId++
      const operators = ['*', '+', '-']

      const firstTerm = Math.floor((Math.random() * 10) + 1)
      const secondTerm = Math.floor((Math.random() * 10) + 1)
      const thirdTerm = Math.floor((Math.random() * 10) + 1)

      const firstOperator = operators[Math.floor((Math.random() * 3))]
      const secondOperator = operators[Math.floor((Math.random() * 3))]

      const expression = firstTerm.toString() + firstOperator + secondTerm.toString() + secondOperator + thirdTerm.toString()
      const answer = safeEvaluateArithmetic(firstTerm, firstOperator, secondTerm, secondOperator, thirdTerm).toString()

      const captcha = {
        captchaId,
        captcha: expression,
        answer
      }
      const captchaInstance = CaptchaModel.build(captcha)
      await captchaInstance.save()
      res.json(captcha)
    } catch (error) {
      next(error)
    }
  }
}

export const verifyCaptcha = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const captcha = await CaptchaModel.findOne({ where: { captchaId: req.body.captchaId } })
    if ((captcha != null) && security.safeCompare(String(req.body.captcha ?? ''), String(captcha.answer))) {
      next()
    } else {
      res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'))
    }
  } catch (error) {
    next(error)
  }
}
