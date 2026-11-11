import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Checkbox } from './checkbox/checkbox';
import { SelectField } from './select-field/select-field';
import { TextField } from './text-field/text-field';
import { Toggle } from './toggle/toggle';

@Component({
  imports: [ReactiveFormsModule, TextField, SelectField, Checkbox, Toggle],
  template: `
    <form [formGroup]="form">
      <app-text-field
        id="email"
        label="Correo"
        type="email"
        formControlName="email"
        hint="Te enviaremos tu enlace."
      />
      <app-select-field
        id="category"
        label="Categoría"
        formControlName="category"
        [options]="options"
      />
      <app-checkbox
        id="privacy"
        label="Acepto la política de privacidad"
        formControlName="privacy"
        [errorMessages]="{ required: 'Debes aceptar la política.' }"
      />
      <app-toggle id="free" label="Evento gratuito" formControlName="free" />
    </form>
  `,
})
class Host {
  readonly options = [
    { value: 'sports', label: 'Deporte' },
    { value: 'culture', label: 'Cultura' },
  ];
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    category: new FormControl('', Validators.required),
    privacy: new FormControl(false, Validators.requiredTrue),
    free: new FormControl(false),
  });
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root, form: fixture.componentInstance.form };
}

function type(fixture: { detectChanges(): void }, input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

describe('TextField', () => {
  it('has a visible label linked to the input and a described hint', () => {
    const { root } = setup();
    const input = root.querySelector('#email input') as HTMLInputElement;
    const label = root.querySelector(`label[for="${input.id}"]`) as HTMLLabelElement;
    const hintId = input.getAttribute('aria-describedby') as string;

    expect(label.textContent).toContain('Correo');
    expect(label.textContent).toContain('*');
    expect(input.required).toBe(true);
    expect(root.querySelector(`#${hintId}`)?.textContent).toBe('Te enviaremos tu enlace.');
  });

  it('writes the typed value to the form control', () => {
    const { fixture, root, form } = setup();

    type(fixture, root.querySelector('#email input') as HTMLInputElement, 'ana@correo.com');

    expect(form.value.email).toBe('ana@correo.com');
  });

  it('shows errors only after blur and clears them as soon as the value is valid', () => {
    const { fixture, root } = setup();
    const input = root.querySelector('#email input') as HTMLInputElement;

    type(fixture, input, 'ana');
    expect(root.querySelector('#email p.text-rejected')).toBeNull();

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    const error = root.querySelector('#email p.text-rejected') as HTMLElement;
    expect(error.textContent).toContain('correo válido');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(error.id);

    type(fixture, input, 'ana@correo.com');
    expect(root.querySelector('#email p.text-rejected')).toBeNull();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('shows every error after the form is submitted (markAllAsTouched)', () => {
    const { fixture, root, form } = setup();

    form.markAllAsTouched();
    fixture.detectChanges();

    expect(root.querySelector('#email p.text-rejected')?.textContent).toContain('obligatorio');
    expect(root.querySelector('#privacy p.text-rejected')?.textContent).toBe(
      'Debes aceptar la política.',
    );
  });

  it('reflects values and disabled state set from the form', () => {
    const { fixture, root, form } = setup();
    const input = root.querySelector('#email input') as HTMLInputElement;

    form.controls.email.setValue('luis@correo.com');
    form.controls.email.disable();
    fixture.detectChanges();

    expect(input.value).toBe('luis@correo.com');
    expect(input.disabled).toBe(true);
  });
});

describe('SelectField', () => {
  it('is a native select with a placeholder and the given options', () => {
    const { fixture, root, form } = setup();
    const select = root.querySelector('#category select') as HTMLSelectElement;

    expect(select.options.length).toBe(3);
    select.value = 'culture';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(form.value.category).toBe('culture');
  });
});

describe('Checkbox', () => {
  it('toggles the boolean value from its label', () => {
    const { fixture, root, form } = setup();
    const label = root.querySelector('#privacy label') as HTMLLabelElement;

    label.click();
    fixture.detectChanges();

    expect(form.value.privacy).toBe(true);
  });
});

describe('Toggle', () => {
  it('is a switch whose state follows clicks', () => {
    const { fixture, root, form } = setup();
    const toggle = root.querySelector('#free [role="switch"]') as HTMLButtonElement;

    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(toggle.textContent).toContain('Evento gratuito');

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(form.value.free).toBe(true);
  });
});
