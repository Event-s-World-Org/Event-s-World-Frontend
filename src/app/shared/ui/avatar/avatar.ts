import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Initials avatar with the coral accent ring (design-system.md §2.1). */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[attr.aria-label]': 'name()',
    class:
      'inline-flex shrink-0 items-center justify-center rounded-pill bg-surface-2 font-semibold text-text ring-2 ring-accent',
    '[class]': 'size() === "sm" ? "size-8 text-meta" : "size-10 text-secondary"',
  },
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  readonly name = input.required<string>();
  readonly size = input<'sm' | 'md'>('md');

  protected readonly initials = computed(() =>
    this.name()
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toLocaleUpperCase('es'))
      .join(''),
  );
}
