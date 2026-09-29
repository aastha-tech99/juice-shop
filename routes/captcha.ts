/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { CaptchaModel } from '../models/captcha'

// Safe arithmetic evaluator for expressions containing only integers and +, -, * operators.
// Respects standard operator precedence (* before +/-).
function safeMathEval (expression: string): number {
  const tokens = expression.match(/(\d+|[+\-*])/g)
  if (!tokens || tokens.length === 0) throw new Error('Invalid expression')

  const numbers: number[] = []
  const ops: string[] = []
  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      numbers.push(parseInt(token, 10))
    } else {
      ops.push(token)
    }
  }

  // First pass: resolve multiplication (higher precedence)
  let i = 0
  while (i < ops.length) {
    if (ops[i] === '*') {
      numbers[i] = numbers[i] * numbers[i + 1]
      numbers.splice(i + 1, 1)
      ops.splice(i, 1)
    } else {
      i++
    }
  }

  // Second pass: resolve addition and subtraction (left to right)
  let result = numbers[0]
  for (let j = 0; j < ops.length; j++) {
    if (ops[j] === '+') {
      result += numbers[j + 1]
    } else if (ops[j] === '-') {
      result -= numbers[j + 1]
    }
  }

  return result
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
      const answer = safeMathEval(expression).toString()

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
    if ((captcha != null) && req.body.captcha === captcha.answer) {
      next()
    } else {
      res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'))
    }
  } catch (error) {
    next(error)
  }
}
