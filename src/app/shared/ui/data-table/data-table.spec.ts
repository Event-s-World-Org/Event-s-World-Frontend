import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Paginator } from '../paginator/paginator';
import { CellDef, DataTable, TableColumn, TableSort } from './data-table';

interface Row {
  id: number;
  name: string;
  amount: number;
}

@Component({
  imports: [DataTable, CellDef, Paginator],
  template: `
    <app-data-table
      caption="Participantes"
      interactive
      [columns]="columns"
      [rows]="rows()"
      [(sort)]="sort"
      (rowActivate)="activated.set($event)"
    >
      <ng-template appCell="name" let-row
        ><strong>{{ row.name }}</strong></ng-template
      >
      <p empty>Sin participantes</p>
    </app-data-table>
    <app-paginator [total]="45" [pageSize]="20" [(page)]="page" />
  `,
})
class Host {
  readonly columns: TableColumn<Row>[] = [
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'amount', header: 'Monto', value: (row) => row.amount.toFixed(2), align: 'end' },
  ];
  readonly rows = signal<Row[]>([
    { id: 1, name: 'Ana', amount: 120 },
    { id: 2, name: 'Bruno', amount: 90 },
  ]);
  readonly sort = signal<TableSort | null>(null);
  readonly activated = signal<Row | null>(null);
  readonly page = signal(1);
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root, host: fixture.componentInstance };
}

describe('DataTable', () => {
  it('renders a captioned table with header cells and custom cell templates', () => {
    const { root } = setup();
    const table = root.querySelector('table') as HTMLTableElement;

    expect(table.querySelector('caption')?.textContent?.trim()).toBe('Participantes');
    expect([...table.querySelectorAll('th')].map((th) => th.textContent?.trim())).toEqual([
      'Nombre',
      'Monto',
    ]);
    expect(table.querySelector('tbody tr td strong')?.textContent).toBe('Ana');
    expect(table.querySelector('tbody tr td:last-child')?.textContent?.trim()).toBe('120.00');
  });

  it('cycles the sort of a sortable column and exposes it with aria-sort', () => {
    const { fixture, root, host } = setup();
    const header = root.querySelector('th') as HTMLElement;
    const button = header.querySelector('button') as HTMLButtonElement;

    expect(header.getAttribute('aria-sort')).toBe('none');
    button.click();
    fixture.detectChanges();
    expect(host.sort()).toEqual({ key: 'name', direction: 'asc' });
    expect(header.getAttribute('aria-sort')).toBe('ascending');

    button.click();
    fixture.detectChanges();
    expect(host.sort()).toEqual({ key: 'name', direction: 'desc' });

    button.click();
    fixture.detectChanges();
    expect(host.sort()).toBeNull();
  });

  it('activates a row with the keyboard', () => {
    const { fixture, root, host } = setup();
    const row = root.querySelector('tbody tr') as HTMLElement;

    expect(row.getAttribute('tabindex')).toBe('0');
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(host.activated()?.name).toBe('Ana');
  });

  it('renders one card per row for mobile', () => {
    const { root } = setup();
    const cards = root.querySelectorAll('ul[aria-label="Participantes"] > li');

    expect(cards.length).toBe(2);
    expect(cards[1].textContent).toContain('Bruno');
    expect(cards[1].querySelector('dt')?.textContent).toBe('Monto');
  });

  it('shows the projected empty state when there are no rows', () => {
    const { fixture, root, host } = setup();

    host.rows.set([]);
    fixture.detectChanges();

    expect(root.textContent).toContain('Sin participantes');
  });
});

describe('Paginator', () => {
  it('shows the range and moves between pages', () => {
    const { fixture, root, host } = setup();
    const paginator = root.querySelector('app-paginator') as HTMLElement;
    const [previous, next] = paginator.querySelectorAll('button');

    expect(paginator.textContent).toContain('1–20 de 45');
    expect(previous.disabled).toBe(true);
    expect(previous.getAttribute('aria-label')).toBe('Página anterior');

    next.click();
    fixture.detectChanges();
    expect(host.page()).toBe(2);
    expect(paginator.textContent).toContain('21–40 de 45');

    next.click();
    fixture.detectChanges();
    expect(paginator.textContent).toContain('41–45 de 45');
    expect(next.disabled).toBe(true);
  });
});
