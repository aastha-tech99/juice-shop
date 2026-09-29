/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private token: string | null = null

  setToken (value: string): void {
    this.token = value
  }

  getToken (): string | null {
    return this.token
  }

  removeToken (): void {
    this.token = null
  }
}
