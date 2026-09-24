/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export interface DeliveryMethod {
  id: number
  name: string
  price: number
  eta: number
  icon: string
}

export function sanitizeDeliveryMethod (d: DeliveryMethod): DeliveryMethod {
  return {
    ...d,
    price: Math.max(0, d.price),
    eta: Math.max(0, d.eta)
  }
}
