import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { Button } from '../button/button';

/** Previous / next pagination for server-side lists. `page` is 1-based. */
@Component({
  selector: 'app-paginator',
  imports: [Button, LucideChevronLeft, LucideChevronRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center justify-between gap-4 text-secondary' },
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
})
export class Paginator {
  readonly total = input.required<number>();
  readonly pageSize = input(20);
  readonly page = model(1);

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );
  protected readonly from = computed(() => (this.page() - 1) * this.pageSize() + 1);
  protected readonly to = computed(() => Math.min(this.total(), this.page() * this.pageSize()));
}
