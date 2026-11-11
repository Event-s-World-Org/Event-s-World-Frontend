import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button, ButtonVariant } from './button';

@Component({
  imports: [Button],
  template: `
    <button
      app-button
      type="button"
      [variant]="variant()"
      [loading]="loading()"
      [disabled]="disabled()"
    >
      Guardar
    </button>
  `,
})
class Host {
  readonly variant = signal<ButtonVariant>('primary');
  readonly loading = signal(false);
  readonly disabled = signal(false);
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  return { fixture, button, host: fixture.componentInstance };
}

describe('Button', () => {
  it('keeps the native button and its accessible name', () => {
    const { button } = setup();

    expect(button.textContent?.trim()).toBe('Guardar');
    expect(button.type).toBe('button');
    expect(button.className).toContain('bg-primary');
  });

  it('applies the requested variant', () => {
    const { fixture, button, host } = setup();

    host.variant.set('reject');
    fixture.detectChanges();

    expect(button.className).toContain('bg-rejected');
    expect(button.className).not.toContain('bg-primary');
  });

  it('is busy and disabled while loading', () => {
    const { fixture, button, host } = setup();

    host.loading.set(true);
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('can be disabled through its input', () => {
    const { fixture, button, host } = setup();

    host.disabled.set(true);
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
  });

  it('keeps a 44 px target at the default size', () => {
    const { button } = setup();

    expect(button.className).toContain('min-h-11');
  });
});
