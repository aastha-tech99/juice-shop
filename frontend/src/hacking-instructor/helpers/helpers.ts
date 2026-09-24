/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { jwtDecode } from 'jwt-decode'
import { roles } from '../../app/roles'

/**
 * Constant-time string comparison to prevent timing side-channel attacks (CWE-208).
 * Always compares every character regardless of where a mismatch occurs.
 */
function constantTimeEqual (a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Compare against `b` padded/truncated to avoid leaking length via timing,
    // but the result is always false when lengths differ.
    let mismatch = 1
    for (let i = 0; i < a.length; i++) {
      mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i % (b.length || 1))
    }
    return false
  }
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

function getCookieToken (): string | null {
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

let config
const playbackDelays = {
  faster: 0.5,
  fast: 0.75,
  normal: 1.0,
  slow: 1.25,
  slower: 1.5
}

export async function isChallengeSolved (challengeName: string): Promise<boolean> {
  try {
    const res = await fetch('/api/Challenges/')
    const json = await res.json()
    const challenges: { name: string, solved: boolean }[] = json.data || []
    return challenges.some(c => c.name === challengeName && c.solved)
  } catch {
    return false
  }
}

export async function sleep (timeInMs: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, timeInMs)
  })
}

export function waitForInputToHaveValue (inputSelector: string, value: string, options: any = { ignoreCase: true, replacement: [] }) {
  return async () => {
    try {
      const inputElement: HTMLInputElement = document.querySelector(
        inputSelector
      )

      if (options.replacement?.length === 2) {
        if (!config) {
          const res = await fetch('/rest/admin/application-configuration')
          const json = await res.json()
          config = json.config
        }
        const propertyChain = options.replacement[1].split('.')
        let replacementValue = config
        for (const property of propertyChain) {
          replacementValue = replacementValue[property]
        }
        value = value.replace(options.replacement[0], replacementValue)
      }

      while (true) {
        if (options.ignoreCase && inputElement.value.toLowerCase() === value.toLowerCase()) {
          break
        } else if (!options.ignoreCase && inputElement.value === value) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForInputToNotHaveValue (inputSelector: string, value: string, options = { ignoreCase: true }) {
  return async () => {
    try {
      const inputElement: HTMLInputElement = document.querySelector(
        inputSelector
      )

      while (true) {
        if (options.ignoreCase && inputElement.value.toLowerCase() !== value.toLowerCase()) {
          break
        } else if (!options.ignoreCase && inputElement.value !== value) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForInputToNotHaveValueAndNotBeEmpty (inputSelector: string, value: string, options = { ignoreCase: true }) {
  return async () => {
    try {
      const inputElement: HTMLInputElement = document.querySelector(
        inputSelector
      )

      while (true) {
        if (inputElement.value !== '') {
          if (options.ignoreCase && inputElement.value.toLowerCase() !== value.toLowerCase()) {
            break
          } else if (!options.ignoreCase && inputElement.value !== value) {
            break
          }
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForInputToNotBeEmpty (inputSelector: string) {
  return async () => {
    try {
      const inputElement: HTMLInputElement = document.querySelector(
        inputSelector
      )

      while (true) {
        if (inputElement.value && inputElement.value !== '') {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForElementToGetClicked (elementSelector: string) {
  return async () => {
    try {
      const element = document.querySelector(
        elementSelector
      )
      if (!element) {
        console.warn(`Could not find Element with selector "${elementSelector}"`)
      }

      await new Promise<void>((resolve) => {
        element.addEventListener('click', () => { resolve() })
      })
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForElementsInnerHtmlToBe (elementSelector: string, value: string) {
  return async () => {
    try {
      while (true) {
        const element = document.querySelector(
          elementSelector
        )

        if (element && element.innerHTML === value) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitInMs (timeInMs: number) {
  return async () => {
    try {
      if (!config) {
        const res = await fetch('/rest/admin/application-configuration')
        const json = await res.json()
        config = json.config
      }
      let delay = playbackDelays[config.hackingInstructor.hintPlaybackSpeed]
      delay ??= 1.0
      await sleep(timeInMs * delay)
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForAngularRouteToBeVisited (route: string) {
  return async () => {
    try {
      while (true) {
        if (window.location.hash.startsWith(`#/${route}`)) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForLogIn () {
  return async () => {
    try {
      while (true) {
        if (getCookieToken() !== null) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForAdminLogIn () {
  return async () => {
    try {
      while (true) {
        let role = ''
        try {
          const token: string = getCookieToken()
          const decodedToken = jwtDecode(token)
          const payload = decodedToken as any
          role = payload.data.role
        } catch {
          console.log('Role from token could not be accessed.')
        }
        if (role === roles.admin) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForLogOut () {
  return async () => {
    try {
      while (true) {
        if (getCookieToken() === null) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

/**
 * see https://stackoverflow.com/questions/7798748/find-out-whether-chrome-console-is-open/48287643#48287643
 * does detect when devtools are opened horizontally or vertically but not when undocked or open on page load
 */
export function waitForDevTools () {
  const initialInnerHeight = window.innerHeight
  const initialInnerWidth = window.innerWidth
  return async () => {
    try {
      while (true) {
        if (window.innerHeight !== initialInnerHeight || window.innerWidth !== initialInnerWidth) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForSelectToHaveValue (selectSelector: string, value: string) {
  return async () => {
    try {
      const selectElement: HTMLSelectElement = document.querySelector(
        selectSelector
      )

      while (true) {
        if (selectElement.options[selectElement.selectedIndex].value === value) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForSelectToNotHaveValue (selectSelector: string, value: string) {
  return async () => {
    try {
      const selectElement: HTMLSelectElement = document.querySelector(
        selectSelector
      )

      while (true) {
        if (selectElement.options[selectElement.selectedIndex].value !== value) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}

export function waitForRightUriQueryParamPair (key: string, value: string) {
  return async () => {
    try {
      while (true) {
        const encodedValue: string = encodeURIComponent(value).replace(/%3A/g, ':')
        const encodedKey: string = encodeURIComponent(key).replace(/%3A/g, ':')
        const expectedHash = `#/track-result/new?${encodedKey}=${encodedValue}`

        if (constantTimeEqual(window.location.hash, expectedHash)) {
          break
        }
        await sleep(100)
      }
    } catch (error: unknown) {
      console.error('Hacking instructor helper failed:', error)
      throw error
    }
  }
}
