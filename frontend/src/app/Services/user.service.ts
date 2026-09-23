/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { Subject } from 'rxjs'

interface Passwords {
  current?: string
  new?: string
  repeat?: string
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient)

  public isLoggedIn = new Subject<any>()
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Users'

  find (params?: any) {
    const httpParams = params ? new HttpParams({ fromObject: params }) : undefined
    return this.http.get(this.hostServer + '/rest/user/authentication-details/', { params: httpParams }).pipe(map((response: any) =>
      response.data), catchError((err) => { throw err }))
  }

  get (id: number) {
    return this.http.get(`${this.host}/${id}`).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  save (params: any) {
    return this.http.post(this.host + '/', params).pipe(
      map((response: any) => response.data),
      catchError((err) => { throw err })
    )
  }

  login (params: any) {
    this.isLoggedIn.next(true)
    return this.http.post(this.hostServer + '/rest/user/login', params).pipe(map((response: any) => response.authentication), catchError((err) => { throw err }))
  }

  getLoggedInState () {
    return this.isLoggedIn.asObservable()
  }

  changePassword (passwords: Passwords) {
    const params = new HttpParams()
      .set('current', passwords.current || '')
      .set('new', passwords.new || '')
      .set('repeat', passwords.repeat || '')
    return this.http.get(this.hostServer + '/rest/user/change-password', { params }).pipe(map((response: any) => response.user), catchError((err) => { throw err.error }))
  }

  resetPassword (params: any) {
    return this.http.post(this.hostServer + '/rest/user/reset-password', params).pipe(map((response: any) => response.user), catchError((err) => { throw err }))
  }

  whoAmI (fields?: string[]) {
    let params = new HttpParams()
    if (fields && fields.length > 0) {
      params = params.set('fields', fields.join(','))
    }
    return this.http.get(this.hostServer + '/rest/user/whoami', { params }).pipe(map((response: any) => response.user), catchError((err) => { throw err }))
  }

  private readonly googleUserInfoUrl = 'https://www.googleapis.com/oauth2/v1/userinfo'

  oauthLogin (accessToken: string) {
    const params = new HttpParams()
      .set('alt', 'json')
      .set('access_token', accessToken)
    return this.http.get(this.googleUserInfoUrl, { params })
  }

  saveLastLoginIp () {
    return this.http.get(this.hostServer + '/rest/saveLoginIp').pipe(map((response: any) => response), catchError((err) => { throw err }))
  }

  deluxeStatus () {
    return this.http.get(this.hostServer + '/rest/deluxe-membership').pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  upgradeToDeluxe (paymentMode: string, paymentId: any) {
    return this.http.post(this.hostServer + '/rest/deluxe-membership', { paymentMode, paymentId }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
