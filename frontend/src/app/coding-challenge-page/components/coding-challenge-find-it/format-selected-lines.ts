/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export function formatSelectedLines (lines: number[]): string {
  if (lines.length === 0) return ''
  const ranges: string[] = []
  const [first, ...rest] = lines
  let start = first
  let end = start
  for (const line of rest) {
    if (line === end + 1) {
      end = line
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`)
      start = line
      end = start
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`)
  if (ranges.length <= 2) return ranges.join(' & ')
  return ranges.slice(0, -1).join(', ') + ' & ' + ranges.at(-1)
}
