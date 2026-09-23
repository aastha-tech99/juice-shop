/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { AddressModel } from '../models/address'

export function getAddress () {
  return (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      const addresses = await AddressModel.findAll({ where: { UserId: req.body.UserId } })
      res.status(200).json({ status: 'success', data: addresses })
    })().catch(next)
  }
}

export function getAddressById () {
  return (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      const address = await AddressModel.findOne({ where: { id: req.params.id, UserId: req.body.UserId } })
      if (address != null) {
        res.status(200).json({ status: 'success', data: address })
      } else {
        res.status(400).json({ status: 'error', data: 'Malicious activity detected.' })
      }
    })().catch(next)
  }
}

export function delAddressById () {
  return (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      const address = await AddressModel.destroy({ where: { id: req.params.id, UserId: req.body.UserId } })
      if (address) {
        res.status(200).json({ status: 'success', data: 'Address deleted successfully.' })
      } else {
        res.status(400).json({ status: 'error', data: 'Malicious activity detected.' })
      }
    })().catch(next)
  }
}
