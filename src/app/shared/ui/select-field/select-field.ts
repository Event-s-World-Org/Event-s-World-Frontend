import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormControlBase } from '../form-control/form-control';
import {
  ERROR_CLASSES,
  FIELD_CLASSES,
  HINT_CLASSES,
  LABEL_CLASSES,
} from '../form-control/field-classes';

export interface SelectOption {
  value: string;
  label: string;
}

/** Native select (phones show their system picker, ADR-0007) with label, hint and error. */
@Component({
  selector: 'app-select-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './select-field.html',
  styleUrl: './select-field.css',
})
export class SelectField extends FormControlBase<string> {
  readonly options = input.required<readonly SelectOption[]>();
  readonly placeholder = input($localize`:@@forms.selectPlaceholder:Selecciona una opción`);

  protected readonly value = signal('');
  protected readonly fieldClasses = FIELD_CLASSES;
  protected readonly labelClasses = LABEL_CLASSES;
  protected readonly hintClasses = HINT_CLASSES;
  protected readonly errorClasses = ERROR_CLASSES;

  override writeValue(value: string | null): void {
    super.writeValue(value ?? '');
  }

  protected onSelect(event: Event): void {
    this.updateValue((event.target as HTMLSelectElement).value);
  }
}
