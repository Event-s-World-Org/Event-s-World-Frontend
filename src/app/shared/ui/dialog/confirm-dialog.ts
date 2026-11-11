import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Button } from '../button/button';
import { FIELD_CLASSES, LABEL_CLASSES } from '../form-control/field-classes';
import { DialogLayout } from './dialog-layout';

export interface ConfirmDialogData {
  title: string;
  message: string;
  /** Verb-first label, e.g. "Eliminar borrador". */
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` uses the reject colour for the confirm button. */
  tone?: 'primary' | 'danger';
  /** When set, the user must type this word to enable the confirm button (e.g. "ELIMINAR"). */
  confirmationText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [Button, DialogLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  static readonly titleId = 'app-confirm-dialog-title';

  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly titleId = ConfirmDialog.titleId;
  protected readonly inputId = 'app-confirm-dialog-input';
  protected readonly fieldClasses = FIELD_CLASSES;
  protected readonly labelClasses = LABEL_CLASSES;
  protected readonly cancelDefault = $localize`:@@dialog.cancel:Cancelar`;
  protected readonly typed = signal('');

  protected readonly canConfirm = computed(
    () => !this.data.confirmationText || this.typed().trim() === this.data.confirmationText,
  );

  protected onType(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
  }
}
