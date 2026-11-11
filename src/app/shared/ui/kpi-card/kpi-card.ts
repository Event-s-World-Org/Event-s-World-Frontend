import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Metric tile for dashboards (ORG-05, ADM-01). Extra content (a progress bar, a link) is projected. */
@Component({
  selector: 'app-kpi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'glass flex flex-col gap-1 rounded-lg p-4' },
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.css',
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>();
}
