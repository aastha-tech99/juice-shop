/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { MemoryModel } from '../models/memory'
import { UserModel } from '../models/user'

export function addMemory () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = {
        caption: req.body.caption,
        imagePath: 'assets/public/images/uploads/' + req.file?.filename,
        UserId: req.body.UserId
      }
      const memory = await MemoryModel.create(record)
      res.status(200).json({ status: 'success', data: memory })
    } catch (error) {
      next(error)
    }
  }
}

export function getMemories () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memories = await MemoryModel.findAll({ include: [UserModel] })
      res.status(200).json({ status: 'success', data: memories })
    } catch (error) {
      next(error)
    }
  }
}
