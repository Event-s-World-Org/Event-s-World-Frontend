import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControlBase } from '../form-control/form-control';
import { ERROR_CLASSES, HINT_CLASSES } from '../form-control/field-classes';

/**
 * Native checkbox with a clickable label of at least 44 px (e.g. privacy acceptance).
 * Use `Validators.requiredTrue` when it must be checked.
 */
@Component({
  selector: 'app-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.css',
})
export class Checkbox extends FormControlBase<boolean> {
  protected readonly value = signal(false);
  protected readonly hintClasses = HINT_CLASSES;
  protected readonly errorClasses = ERROR_CLASSES;

  override writeValue(value: boolean | null): void {
    super.writeValue(!!value);
  }

  protected onCheck(event: Event): void {
    this.updateValue((event.target as HTMLInputElement).checked);
    this.markTouched();
  }
}
