import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core'
import { DecimalPipe } from '@angular/common'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'score-card',
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss'],
  imports: [DecimalPipe]
})
export class ScoreCardComponent {
  readonly description = input.required<string>()
  readonly total = input.required({ transform: (v: number): number => Math.max(1, v) })
  readonly score = input.required({ transform: (v: number): number => Math.max(0, v) })

  readonly safeScore = computed(() => Math.max(0, this.score()))
  readonly safeTotal = computed(() => Math.max(1, this.total()))

  readonly showAsPercentage = input<boolean>(true)
  readonly showProgressBar = input<boolean>(true)
}
