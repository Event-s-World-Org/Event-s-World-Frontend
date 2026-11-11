import {
  OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  Injector,
  OnDestroy,
  PLATFORM_ID,
  inject,
  input,
  signal,
} from '@angular/core';
import { TooltipPanel } from './tooltip-panel';

let nextId = 0;
const SHOW_DELAY_MS = 400;

/**
 * Tooltip for icon-only buttons and truncated text. It appears on hover (after a short delay)
 * and immediately on keyboard focus, hides on leave, blur or Escape, and can show a keyboard
 * shortcut (e.g. the A / O / R keys of payment review):
 * `<button app-button square aria-label="Aprobar" appTooltip="Aprobar" appTooltipShortcut="A">`.
 * Icon-only buttons still need their own `aria-label`.
 */
@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'show(delay)',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show(0)',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
    '(click)': 'hide()',
    '[attr.aria-describedby]': 'visible() ? panelId : null',
  },
})
export class Tooltip implements OnDestroy {
  readonly text = input.required<string>({ alias: 'appTooltip' });
  readonly shortcut = input<string>(undefined, { alias: 'appTooltipShortcut' });

  protected readonly panelId = `app-tooltip-${nextId++}`;
  protected readonly visible = signal(false);
  protected readonly delay = SHOW_DELAY_MS;

  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private overlayRef: OverlayRef | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected show(delay: number): void {
    if (!this.isBrowser) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.attach(), delay);
  }

  protected hide(): void {
    clearTimeout(this.timer);
    this.overlayRef?.detach();
    this.visible.set(false);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    this.overlayRef?.dispose();
  }

  private attach(): void {
    this.overlayRef ??= createOverlayRef(this.injector, {
      positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, this.host)
        .withFlexibleDimensions(false)
        .withViewportMargin(8)
        .withPositions([
          {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom',
            offsetY: -8,
          },
          { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
        ]),
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    if (this.overlayRef.hasAttached()) {
      return;
    }
    const panel = this.overlayRef.attach(new ComponentPortal(TooltipPanel));
    panel.setInput('panelId', this.panelId);
    panel.setInput('text', this.text());
    panel.setInput('shortcut', this.shortcut());
    this.visible.set(true);
  }
}
