import {
  DestroyRef,
  Directive,
  OnInit,
  WritableSignal,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl, ValidationErrors, Validators } from '@angular/forms';

let nextId = 0;

/** Default Spanish messages for the built-in validators. Override per field with `errorMessages`. */
function defaultMessage(key: string, error: unknown): string {
  const detail = (error ?? {}) as Record<string, number>;
  switch (key) {
    case 'required':
      return $localize`:@@forms.required:Este campo es obligatorio.`;
    case 'email':
      return $localize`:@@forms.email:Ingresa un correo válido, por ejemplo nombre@correo.com.`;
    case 'minlength':
      return $localize`:@@forms.minlength:Escribe al menos ${detail['requiredLength']}:length: caracteres.`;
    case 'maxlength':
      return $localize`:@@forms.maxlength:Escribe como máximo ${detail['requiredLength']}:length: caracteres.`;
    case 'min':
      return $localize`:@@forms.min:El valor mínimo es ${detail['min']}:min:.`;
    case 'max':
      return $localize`:@@forms.max:El valor máximo es ${detail['max']}:max:.`;
    default:
      return $localize`:@@forms.invalid:Revisa este campo.`;
  }
}

/**
 * Shared behaviour of the form controls: ControlValueAccessor, ids for label / hint / error,
 * and blur-first validation (errors show after the field is touched and clear as soon as
 * the value becomes valid).
 */
@Directive()
export abstract class FormControlBase<T> implements ControlValueAccessor, OnInit {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly errorMessages = input<Partial<Record<string, string>>>({});

  protected readonly id = `app-field-${nextId++}`;
  protected readonly hintId = `${this.id}-hint`;
  protected readonly errorId = `${this.id}-error`;

  protected abstract readonly value: WritableSignal<T>;
  protected readonly disabled = signal(false);
  protected readonly required = signal(false);

  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly touched = signal(false);
  private readonly errors = signal<ValidationErrors | null>(null);

  protected readonly errorText = computed(() => {
    const errors = this.errors();
    if (!this.touched() || !errors) {
      return null;
    }
    const [key, detail] = Object.entries(errors)[0];
    return this.errorMessages()[key] ?? defaultMessage(key, detail);
  });

  protected readonly describedBy = computed(
    () =>
      [this.hint() ? this.hintId : null, this.errorText() ? this.errorId : null]
        .filter(Boolean)
        .join(' ') || null,
  );

  private onChange: (value: T) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }
    const sync = () => {
      this.touched.set(control.touched);
      this.errors.set(control.errors);
      this.required.set(control.hasValidator(Validators.required));
    };
    sync();
    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(sync);
  }

  writeValue(value: T): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected updateValue(value: T): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected markTouched(): void {
    this.onTouched();
  }
}
