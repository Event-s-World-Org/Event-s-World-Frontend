import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ToastService } from './toast.service';

/**
 * Toast stack. Toasts are solid (`text` on `bg`, never glass) so they are always readable
 * (design-system.md §9). Place it once, in the root component. Errors go to an assertive
 * live region, the rest to a polite one.
 */
@Component({
  selector: 'app-toast-outlet',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'pointer-events-none fixed inset-x-4 bottom-4 z-[1100] flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96',
  },
  templateUrl: './toast-outlet.html',
  styleUrl: './toast-outlet.css',
})
export class ToastOutlet {
  protected readonly service = inject(ToastService);
  protected readonly polite = computed(() =>
    this.service.toasts().filter((toast) => toast.tone !== 'error'),
  );
  protected readonly assertive = computed(() =>
    this.service.toasts().filter((toast) => toast.tone === 'error'),
  );
}
