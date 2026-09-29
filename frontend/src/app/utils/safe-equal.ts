/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/**
 * Constant-time string comparison to prevent timing attacks.
 * Iterates over all characters and accumulates XOR differences
 * so the execution time does not depend on where strings diverge.
 */
export function safeEqual (a: string | null | undefined, b: string | null | undefined): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const maxLen = Math.max(a.length, b.length)
  let result = a.length ^ b.length
  for (let i = 0; i < maxLen; i++) {
    result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return result === 0
}
