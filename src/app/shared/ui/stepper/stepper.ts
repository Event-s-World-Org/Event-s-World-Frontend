import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';
import { LucideCheck } from '@lucide/angular';

export interface StepItem {
  label: string;
}

/**
 * Step indicator for multi-step flows such as the event wizard (ORG-02..04). `current` is
 * 1-based. With `navigable`, completed steps become buttons to go back.
 */
@Component({
  selector: 'app-stepper',
  imports: [LucideCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper {
  readonly steps = input.required<readonly StepItem[]>();
  readonly current = model(1);
  readonly navigable = input(false, { transform: booleanAttribute });

  protected readonly currentLabel = computed(() => this.steps()[this.current() - 1]?.label ?? '');
  protected readonly percent = computed(() => (this.current() / this.steps().length) * 100);

  protected goTo(step: number): void {
    if (this.navigable() && step < this.current()) {
      this.current.set(step);
    }
  }
}
