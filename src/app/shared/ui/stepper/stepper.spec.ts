import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Card } from '../card/card';
import { Stepper } from './stepper';

@Component({
  imports: [Stepper, Card],
  template: `
    <app-card title="Nuevo evento" description="Completa los tres pasos.">
      <button cardActions type="button">Guardar borrador</button>
      <app-stepper [steps]="steps" [(current)]="current" navigable />
    </app-card>
  `,
})
class Host {
  readonly steps = [{ label: 'Datos' }, { label: 'Precio y pago' }, { label: 'Formulario' }];
  readonly current = signal(2);
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root, host: fixture.componentInstance };
}

describe('Stepper', () => {
  it('marks the current step with aria-current and shows the mobile summary', () => {
    const { root } = setup();
    const current = root.querySelector('[aria-current="step"]') as HTMLElement;

    expect(current.textContent).toContain('Precio y pago');
    expect(root.textContent).toContain('Paso 2 de 3');
  });

  it('lets the user go back to a completed step but not forward', () => {
    const { fixture, root, host } = setup();
    const buttons = root.querySelectorAll('ol button');

    expect(buttons.length).toBe(1);
    (buttons[0] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.current()).toBe(1);
    expect(root.querySelectorAll('ol button').length).toBe(0);
  });
});

describe('Card', () => {
  it('renders its heading, description and header actions', () => {
    const { root } = setup();
    const card = root.querySelector('app-card') as HTMLElement;

    expect(card.className).toContain('glass');
    expect(card.querySelector('h2')?.textContent).toBe('Nuevo evento');
    expect(card.querySelector('header')?.textContent).toContain('Guardar borrador');
  });
});
