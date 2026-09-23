/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveKeyFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file
    const baseDir = path.resolve('encryptionkeys/')

    if (!file.includes('/')) {
      const filePath = path.resolve(baseDir, file)
      if (!filePath.startsWith(baseDir + path.sep)) {
        res.status(403)
        next(new Error('File path is not allowed!'))
        return
      }
      res.sendFile(filePath)
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }
}
