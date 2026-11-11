import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Labelled progress bar, e.g. registrations against capacity (ORG-05). */
@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css',
})
export class ProgressBar {
  private static nextId = 0;

  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly max = input.required<number>();

  protected readonly labelId = `app-progress-${ProgressBar.nextId++}`;
  protected readonly percent = computed(() =>
    this.max() > 0 ? Math.min(100, Math.max(0, (this.value() / this.max()) * 100)) : 0,
  );
}
