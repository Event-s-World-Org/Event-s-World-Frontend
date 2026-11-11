import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { LucideLoaderCircle } from '@lucide/angular';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'approve' | 'observe' | 'reject';
export type ButtonSize = 'md' | 'sm';

const VARIANTS: Record<ButtonVariant, string> = {
  // Solid with a shadow in its own colour (design-system.md §3.3).
  primary:
    'bg-primary text-on-primary hover:bg-primary-hover shadow-[0_6px_18px_color-mix(in_srgb,var(--ew-primary)_35%,transparent)]',
  // Translucent without its own blur: buttons sit on glass panels (§7).
  secondary: 'border border-glass-border bg-glass text-text hover:bg-surface-2',
  ghost: 'text-primary hover:bg-surface-2',
  // Payment decisions: solid status colours, never glass (§9).
  approve: 'bg-approved text-surface hover:opacity-90',
  observe: 'bg-observed text-surface hover:opacity-90',
  reject: 'bg-rejected text-surface hover:opacity-90',
};

const SIZES: Record<ButtonSize, { text: string; square: string }> = {
  md: { text: 'min-h-11 px-5 text-body', square: 'size-11' },
  sm: {
    text: 'min-h-9 px-3 text-secondary pointer-coarse:min-h-11',
    square: 'size-9 pointer-coarse:size-11',
  },
};

/**
 * Button with the Salar Cristal variants, used on native elements to keep their semantics:
 * `<button app-button variant="primary">Guardar</button>` or `<a app-button routerLink="…">`.
 * Icon-only buttons use `square` and must have an `aria-label`.
 */
@Component({
  selector: 'button[app-button], a[app-button]',
  imports: [LucideLoaderCircle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.aria-busy]': 'loading() || null',
  },
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  readonly square = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly classes = computed(() => {
    const size = SIZES[this.size()];
    return [
      'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold',
      'transition-colors duration-150 select-none no-underline',
      'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none',
      this.square() ? size.square : size.text,
      VARIANTS[this.variant()],
    ].join(' ');
  });
}
