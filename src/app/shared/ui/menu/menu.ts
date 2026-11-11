import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { Directive, booleanAttribute, input } from '@angular/core';

/**
 * Popup menu on the CDK menu (keyboard navigation, typeahead, Escape, focus return):
 *
 * ```html
 * <button app-button square aria-label="Más acciones" [appMenuTrigger]="actions">…</button>
 * <ng-template #actions>
 *   <div appMenu>
 *     <button appMenuItem (triggered)="edit()">Editar datos</button>
 *     <button appMenuItem danger (triggered)="revert()">Revertir aprobación</button>
 *   </div>
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[appMenuTrigger]',
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      inputs: ['cdkMenuTriggerFor: appMenuTrigger', 'cdkMenuPosition: appMenuPosition'],
      outputs: ['cdkMenuOpened: menuOpened', 'cdkMenuClosed: menuClosed'],
    },
  ],
})
export class MenuTrigger {}

@Directive({
  selector: '[appMenu]',
  hostDirectives: [CdkMenu],
  host: { class: 'glass-overlay flex min-w-48 flex-col gap-0.5 rounded-md p-1 outline-none' },
})
export class Menu {}

@Directive({
  selector: '[appMenuItem]',
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  host: {
    class:
      'flex min-h-11 w-full items-center gap-3 rounded-sm px-3 text-left text-secondary font-semibold outline-none hover:bg-surface-2 focus-visible:bg-surface-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    '[class.text-rejected]': 'danger()',
    '[class.text-text]': '!danger()',
  },
})
export class MenuItem {
  /** Destructive action, shown in the reject colour. */
  readonly danger = input(false, { transform: booleanAttribute });
}
