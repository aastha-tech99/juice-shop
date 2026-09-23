/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveQuarantineFiles () {
  return ({ params, query }: Request, res: Response, next: NextFunction) => {
    const file = params.file
    const baseDir = path.resolve('ftp/quarantine/')

    if (!file.includes('/')) {
      const safeName = path.basename(file)
      if (!safeName || safeName === '.' || safeName === '..') {
        res.status(403)
        next(new Error('File path is not allowed!'))
        return
      }
      res.sendFile(safeName, { root: baseDir })
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }
}
