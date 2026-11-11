import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { Button } from '../button/button';

/**
 * Frame for dialog content opened with the CDK `Dialog` (or `openDialog`): title, close
 * button, body and an actions row (`<div actions>`). The title id is used as the dialog's
 * accessible name.
 */
@Component({
  selector: 'app-dialog-layout',
  imports: [Button, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'glass-overlay flex max-h-[85dvh] flex-col rounded-lg' },
  templateUrl: './dialog-layout.html',
  styleUrl: './dialog-layout.css',
})
export class DialogLayout {
  readonly title = input.required<string>();
  readonly titleId = input.required<string>();

  protected readonly dialogRef = inject(DialogRef);
}
