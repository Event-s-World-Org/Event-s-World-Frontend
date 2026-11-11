import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Loading placeholder for content that takes longer than ~1 s. Size it with classes:
 * `<app-skeleton class="h-4 w-32" />`. It only animates opacity and is never glass.
 */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-pulse rounded-sm bg-surface-2', 'aria-hidden': 'true' },
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class Skeleton {}
