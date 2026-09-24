/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'

import { provideHttpClientTesting } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { OAuthComponent } from './oauth.component'
import { LoginComponent } from '../login/login.component'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { MatTooltipModule } from '@angular/material/tooltip'
import { of, throwError } from 'rxjs'
import { UserService } from '../Services/user.service'
import { CookieModule, CookieService } from 'ngy-cookie'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('OAuthComponent', () => {
    let component: OAuthComponent
    let fixture: ComponentFixture<OAuthComponent>
    let userService: any

    beforeEach(async () => {
        userService = {
            oauthLogin: vi.fn().mockName("UserService.oauthLogin"),
            login: vi.fn().mockName("UserService.login"),
            save: vi.fn().mockName("UserService.save")
        }
        userService.oauthLogin.mockReturnValue(of({ email: '' }))
        userService.login.mockReturnValue(of({}))
        userService.save.mockReturnValue(of({}))
        userService.isLoggedIn = {
            next: vi.fn().mockName("userService.isLoggedIn.next")
        }
        userService.isLoggedIn.next.mockReturnValue({})

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: 'login', component: LoginComponent }
                ]),
                ReactiveFormsModule,
                CookieModule.forRoot(),
                TranslateModule.forRoot(),
                MatInputModule,
                MatIconModule,
                MatCardModule,
                MatFormFieldModule,
                MatCheckboxModule,
                MatTooltipModule,
                OAuthComponent, LoginComponent],
            providers: [
                { provide: ActivatedRoute, useValue: { snapshot: { data: { params: '?alt=json&access_token=TEST' } } } },
                { provide: UserService, useValue: userService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(OAuthComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('removes authentication token and basket id on failed OAuth login attempt', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        const cookieService = TestBed.inject(CookieService)
        userService.oauthLogin.mockReturnValue(throwError({ error: 'Error' }))
        component.ngOnInit()
        expect(cookieService.get('token')).toBeFalsy()
        expect(sessionStorage.getItem('bid')).toBeNull()
    })

    it('will create regular user account with SHA-256 hashed email as password', async () => {
        userService.oauthLogin.mockReturnValue(of({ email: 'test@test.com' }))
        component.ngOnInit()
        await new Promise(resolve => setTimeout(resolve, 0))
        expect(userService.save).toHaveBeenCalledWith(expect.objectContaining({
            email: 'test@test.com',
            password: expect.any(String),
            passwordRepeat: expect.any(String)
        }))
        const savedArgs = userService.save.mock.calls[0][0]
        expect(savedArgs.password).toBe(savedArgs.passwordRepeat)
        expect(savedArgs.password).not.toBe('bW9jLnRzZXRAdHNldA==')
    })

    it('logs in user even after failed account creation as account might already have existed from previous OAuth login', async () => {
        userService.oauthLogin.mockReturnValue(of({ email: 'test@test.com' }))
        userService.save.mockReturnValue(throwError({ error: 'Account already exists' }))
        component.ngOnInit()
        await new Promise(resolve => setTimeout(resolve, 0))
        await new Promise(resolve => setTimeout(resolve, 0))
        expect(userService.login).toHaveBeenCalledWith(expect.objectContaining({
            email: 'test@test.com',
            password: expect.any(String),
            oauth: true
        }))
    })

    it('removes authentication token and basket id on failed subsequent regular login attempt', async () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        const cookieService = TestBed.inject(CookieService)
        userService.login.mockReturnValue(throwError({ error: 'Error' }))
        component.login({ email: '' })
        await new Promise(resolve => setTimeout(resolve, 0))
        expect(cookieService.get('token')).toBeFalsy()
        expect(sessionStorage.getItem('bid')).toBeNull()
    })
})
