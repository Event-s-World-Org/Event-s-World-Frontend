import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { Button } from '../button/button';

/**
 * Frame for side panels opened with `DialogService.openDrawer` (e.g. the public ☰ menu,
 * PUB-09): title, close button and a scrollable body. Full height, overlay-level glass.
 */
@Component({
  selector: 'app-drawer-layout',
  imports: [Button, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'glass-overlay flex h-full flex-col' },
  templateUrl: './drawer-layout.html',
  styleUrl: './drawer-layout.css',
})
export class DrawerLayout {
  readonly title = input.required<string>();
  readonly titleId = input.required<string>();

  protected readonly dialogRef = inject(DialogRef);
}
