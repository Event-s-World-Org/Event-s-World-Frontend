import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface ChipOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * Single-choice filter chips (e.g. payment state in ORG-06). The selected value is `null`
 * when nothing is selected; clicking the selected chip clears it.
 */
@Component({
  selector: 'app-filter-chips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', '[attr.aria-label]': 'label()', class: 'flex flex-wrap gap-2' },
  templateUrl: './filter-chips.html',
  styleUrl: './filter-chips.css',
})
export class FilterChips {
  readonly options = input.required<readonly ChipOption[]>();
  /** Accessible name of the group, e.g. "Estado de pago". */
  readonly label = input.required<string>();
  readonly value = model<string | null>(null);

  protected toggle(value: string): void {
    this.value.set(this.value() === value ? null : value);
  }
}
