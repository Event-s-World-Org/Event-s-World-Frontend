import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControlBase } from '../form-control/form-control';
import { HINT_CLASSES } from '../form-control/field-classes';

/** On/off switch (e.g. "Evento gratuito" in ORG-03), exposed as `role="switch"`. */
@Component({
  selector: 'app-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './toggle.html',
  styleUrl: './toggle.css',
})
export class Toggle extends FormControlBase<boolean> {
  protected readonly value = signal(false);
  protected readonly hintClasses = HINT_CLASSES;

  override writeValue(value: boolean | null): void {
    super.writeValue(!!value);
  }

  protected toggle(): void {
    this.updateValue(!this.value());
  }
}
