/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ActivatedRoute, Router } from '@angular/router'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngy-cookie'
import { Component, NgZone, type OnInit, inject, ChangeDetectionStrategy } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss'],
  imports: [MatCardModule, TranslateModule]
})
export class OAuthComponent implements OnInit {
  private readonly cookieService = inject(CookieService)
  private readonly userService = inject(UserService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly ngZone = inject(NgZone)


  ngOnInit (): void {
    this.userService.oauthLogin(this.parseRedirectUrlParams().access_token).subscribe({
      next: (profile: any) => {
        this.derivePassword(profile.email).then((password) => {
          this.userService.save({ email: profile.email, password, passwordRepeat: password }).subscribe({
            next: () => {
              this.login(profile)
            },
            error: () => { this.login(profile) }
          })
        })
      },
      error: (error) => {
        this.invalidateSession(error)
        this.ngZone.run(async () => await this.router.navigate(['/login']))
      }
    })
  }

  login (profile: any) {
    this.derivePassword(profile.email).then((password) => {
      this.userService.login({ email: profile.email, password, oauth: true }).subscribe({
        next: (authentication) => {
          const expires = new Date()
          expires.setHours(expires.getHours() + 8)
          this.cookieService.put('token', authentication.token, { expires })
          sessionStorage.setItem('bid', authentication.bid)
          this.userService.isLoggedIn.next(true)
          this.ngZone.run(async () => await this.router.navigate(['/']))
        },
        error: (error) => {
          this.invalidateSession(error)
          this.ngZone.run(async () => await this.router.navigate(['/login']))
        }
      })
    })
  }

  private async derivePassword (email: string): Promise<string> {
    const data = new TextEncoder().encode(email)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  invalidateSession (error: Error) {
    console.log(error)
    this.cookieService.remove('token')
    sessionStorage.removeItem('bid')
  }

  parseRedirectUrlParams () {
    const hash = this.route.snapshot.data.params.substr(1)
    const splitted = hash.split('&')
    const params: any = {}
    for (const part of splitted) {
      const [key, value] = part.split('=')
      params[key] = value
    }
    return params
  }
}
