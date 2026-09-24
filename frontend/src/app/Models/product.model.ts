/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export interface Product {
  id: number
  name: string
  description: string
  image: string
  price: number
  points?: number
  deluxePrice: number
}

export function sanitizeProduct (p: Product): Product {
  return {
    ...p,
    price: Math.max(0, p.price),
    deluxePrice: Math.max(0, p.deluxePrice)
  }
}

export type ProductTableEntry = Product & { quantity?: number }
