/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, inject, ChangeDetectionStrategy } from '@angular/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCartArrowDown } from '@fortawesome/free-solid-svg-icons'
import { Router } from '@angular/router'
import { CookieService } from 'ngy-cookie'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { PurchaseBasketComponent } from '../purchase-basket/purchase-basket.component'
import { MatCardModule } from '@angular/material/card'

library.add(faCartArrowDown)

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss'],
  imports: [MatCardModule, PurchaseBasketComponent, MatButtonModule, TranslateModule]
})
export class BasketComponent {
  private readonly router = inject(Router)
  private readonly ngZone = inject(NgZone)
  private readonly cookieService = inject(CookieService)

  public productCount = 0
  public bonus = 0

  checkout (): void {
    if (this.cookieService.get('token') == null) {
      this.ngZone.run(async () => await this.router.navigate(['/login'], {
        queryParams: {
          redirectUrl: '/basket'
        }
      }))
      return
    }

    this.ngZone.run(async () => await this.router.navigate(['/address/select']))
  }

  getProductCount (total: number): void {
    this.productCount = total >= 0 ? total : 0
  }

  getBonusPoints (total: [number, number]): void {
    const itemTotal = total[0] >= 0 ? total[0] : 0
    sessionStorage.setItem('itemTotal', itemTotal.toString())
    this.bonus = total[1] >= 0 ? total[1] : 0
  }
}
