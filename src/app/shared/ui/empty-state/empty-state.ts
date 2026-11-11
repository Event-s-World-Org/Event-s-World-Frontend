import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideInbox } from '@lucide/angular';

/** Empty or filtered-zero state with a clear next action, projected as content. */
@Component({
  selector: 'app-empty-state',
  imports: [LucideInbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col items-center gap-3 px-4 py-10 text-center' },
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
