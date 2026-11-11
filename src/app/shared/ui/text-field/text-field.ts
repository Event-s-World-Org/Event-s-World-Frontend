import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormControlBase } from '../form-control/form-control';
import {
  ERROR_CLASSES,
  FIELD_CLASSES,
  HINT_CLASSES,
  LABEL_CLASSES,
  TEXTAREA_CLASSES,
} from '../form-control/field-classes';

export type TextFieldType =
  'text' | 'email' | 'tel' | 'password' | 'number' | 'date' | 'datetime-local' | 'textarea';

/**
 * Text input with a visible label, optional hint and inline error, for Reactive Forms:
 * `<app-text-field label="Correo" type="email" formControlName="email" />`.
 * Dates use the native pickers (ADR-0007). Numbers are emitted as strings, like the API's money.
 */
@Component({
  selector: 'app-text-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './text-field.html',
  styleUrl: './text-field.css',
})
export class TextField extends FormControlBase<string> {
  readonly type = input<TextFieldType>('text');
  /** Format hint only (e.g. "+591 7xxxxxxx"), never a replacement for the label. */
  readonly placeholder = input<string>();
  readonly autocomplete = input<string>();
  readonly inputMode = input<string>();

  protected readonly value = signal('');
  protected readonly fieldClasses = FIELD_CLASSES;
  protected readonly textareaClasses = TEXTAREA_CLASSES;
  protected readonly labelClasses = LABEL_CLASSES;
  protected readonly hintClasses = HINT_CLASSES;
  protected readonly errorClasses = ERROR_CLASSES;

  override writeValue(value: string | null): void {
    super.writeValue(value ?? '');
  }

  protected onInput(event: Event): void {
    this.updateValue((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }
}
