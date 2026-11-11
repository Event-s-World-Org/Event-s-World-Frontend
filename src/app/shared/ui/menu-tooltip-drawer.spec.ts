import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog/dialog.service';
import { DrawerLayout } from './dialog/drawer-layout';
import { Menu, MenuItem, MenuTrigger } from './menu/menu';
import { Tooltip } from './tooltip/tooltip';

@Component({
  imports: [MenuTrigger, Menu, MenuItem, Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="trigger" type="button" aria-label="Más acciones" [appMenuTrigger]="menu">⋮</button>
    <ng-template #menu>
      <div appMenu>
        <button appMenuItem (triggered)="chosen.set('edit')">Editar datos</button>
        <button appMenuItem danger (triggered)="chosen.set('revert')">Revertir aprobación</button>
      </div>
    </ng-template>
    <button
      id="approve"
      type="button"
      aria-label="Aprobar"
      appTooltip="Aprobar"
      appTooltipShortcut="A"
    >
      ✓
    </button>
  `,
})
class Host {
  readonly chosen = signal<string | null>(null);
}

@Component({
  imports: [DrawerLayout],
  template: `<app-drawer-layout title="Menú" titleId="drawer-title">Enlaces</app-drawer-layout>`,
})
class SampleDrawer {}

const nextTick = () => new Promise((resolve) => setTimeout(resolve));
const overlay = () => document.querySelector('.cdk-overlay-container') as HTMLElement;

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root, host: fixture.componentInstance };
}

describe('Menu', () => {
  it('opens a CDK menu with menu items and runs the chosen action', () => {
    const { fixture, root, host } = setup();
    const trigger = root.querySelector('#trigger') as HTMLButtonElement;

    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    trigger.click();
    fixture.detectChanges();

    const menu = overlay().querySelector('[role="menu"]') as HTMLElement;
    const items = menu.querySelectorAll('[role="menuitem"]');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(menu.className).toContain('glass-overlay');
    expect(items.length).toBe(2);
    expect(items[1].className).toContain('text-rejected');

    (items[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.chosen()).toBe('revert');
    expect(overlay().querySelector('[role="menu"]')).toBeNull();
  });
});

describe('Tooltip', () => {
  it('appears on keyboard focus, describes the element and hides with Escape', async () => {
    const { fixture, root } = setup();
    const button = root.querySelector('#approve') as HTMLButtonElement;

    button.dispatchEvent(new FocusEvent('focusin'));
    await nextTick();
    fixture.detectChanges();

    const tooltip = overlay().querySelector('[role="tooltip"]') as HTMLElement;
    expect(tooltip.textContent).toContain('Aprobar');
    expect(tooltip.querySelector('kbd')?.textContent).toBe('A');
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(overlay().querySelector('[role="tooltip"]')).toBeNull();
    expect(button.hasAttribute('aria-describedby')).toBe(false);
  });
});

describe('DialogService.openDrawer', () => {
  afterEach(() => TestBed.inject(Dialog).closeAll());

  it('opens a labelled full-height side panel that Escape closes', async () => {
    const ref = TestBed.inject(DialogService).openDrawer(SampleDrawer, {
      side: 'left',
      ariaLabelledBy: 'drawer-title',
    });
    TestBed.tick();
    await nextTick();

    const dialog = overlay().querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.getAttribute('aria-labelledby')).toBe('drawer-title');
    expect(document.getElementById('drawer-title')?.textContent).toBe('Menú');
    expect(dialog.closest('.cdk-overlay-pane')?.getAttribute('style')).toContain('100dvh');

    const closed = vi.fn();
    ref.closed.subscribe(closed);
    // The CDK overlay reads the legacy keyCode (27) for Escape.
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }),
    );
    TestBed.tick();
    expect(closed).toHaveBeenCalled();
  });
});
