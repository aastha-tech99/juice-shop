/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type HttpEvent, type HttpHandler, type HttpInterceptor, type HttpRequest } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { type Observable } from 'rxjs'
import { CookieService } from 'ngy-cookie'

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  private readonly cookieService = inject(CookieService)

  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.cookieService.get('token')) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.cookieService.get('token')}`
        }
      })
    }
    if (localStorage.getItem('email')) {
      req = req.clone({
        setHeaders: {
          'X-User-Email': String(localStorage.getItem('email'))
        }
      })
    }
    return next.handle(req)
  }
}
