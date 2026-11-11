import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Avatar } from './avatar/avatar';
import { FilterChips } from './filter-chips/filter-chips';
import { ProgressBar } from './progress-bar/progress-bar';
import { Status, StatusBadge } from './status-badge/status-badge';

@Component({
  imports: [StatusBadge, FilterChips, ProgressBar, Avatar],
  template: `
    <app-status-badge id="badge" [status]="status()" [label]="label()" />
    <app-filter-chips label="Estado de pago" [options]="options" [(value)]="filter" />
    <app-progress-bar label="Cupos" [value]="30" [max]="120" />
    <app-avatar name="ana maría quispe" />
  `,
})
class Host {
  readonly status = signal<Status>('in_observation');
  readonly label = signal<string | undefined>(undefined);
  readonly filter = signal<string | null>(null);
  readonly options = [
    { value: 'pending', label: 'Pendiente', count: 4 },
    { value: 'approved', label: 'Aprobado' },
  ];
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root, host: fixture.componentInstance };
}

describe('StatusBadge', () => {
  it('shows the Spanish label and the tone colours, never colour alone', () => {
    const { root } = setup();
    const badge = root.querySelector('#badge') as HTMLElement;

    expect(badge.textContent?.trim()).toBe('En observación');
    expect(badge.className).toContain('text-observed');
    expect(badge.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('accepts a custom label', () => {
    const { fixture, root, host } = setup();

    host.label.set('Observado');
    fixture.detectChanges();

    expect(root.querySelector('#badge')?.textContent?.trim()).toBe('Observado');
  });
});

describe('FilterChips', () => {
  it('is a labelled group of toggle buttons', () => {
    const { root } = setup();
    const group = root.querySelector('app-filter-chips') as HTMLElement;
    const buttons = group.querySelectorAll('button');

    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Estado de pago');
    expect(buttons.length).toBe(2);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[0].textContent).toContain('4');
  });

  it('selects a chip and clears it on a second click', () => {
    const { fixture, root, host } = setup();
    const first = root.querySelector('app-filter-chips button') as HTMLButtonElement;

    first.click();
    fixture.detectChanges();
    expect(host.filter()).toBe('pending');
    expect(first.getAttribute('aria-pressed')).toBe('true');

    first.click();
    fixture.detectChanges();
    expect(host.filter()).toBeNull();
  });
});

describe('ProgressBar', () => {
  it('exposes the value to assistive technology', () => {
    const { root } = setup();
    const bar = root.querySelector('[role="progressbar"]') as HTMLElement;
    const labelId = bar.getAttribute('aria-labelledby') as string;

    expect(bar.getAttribute('aria-valuenow')).toBe('30');
    expect(bar.getAttribute('aria-valuemax')).toBe('120');
    expect(root.querySelector(`#${labelId}`)?.textContent).toBe('Cupos');
  });
});

describe('Avatar', () => {
  it('shows two initials and is named by the full name', () => {
    const { root } = setup();
    const avatar = root.querySelector('app-avatar') as HTMLElement;

    expect(avatar.textContent?.trim()).toBe('AM');
    expect(avatar.getAttribute('aria-label')).toBe('ana maría quispe');
  });
});
