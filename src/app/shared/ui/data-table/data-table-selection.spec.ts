import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataTable, TableColumn } from './data-table';

interface Row {
  id: number;
  name: string;
}

@Component({
  imports: [DataTable],
  template: `
    <app-data-table
      caption="Participantes"
      selectable
      interactive
      [columns]="columns"
      [rows]="rows"
      [trackBy]="byId"
      [(selection)]="selection"
      (rowActivate)="activated.set($event.name)"
    />
  `,
})
class Host {
  readonly columns: TableColumn<Row>[] = [
    { key: 'name', header: 'Nombre', value: (row) => row.name },
  ];
  readonly rows: Row[] = [
    { id: 1, name: 'Ana' },
    { id: 2, name: 'Bruno' },
    { id: 3, name: 'Carla' },
  ];
  readonly byId = (row: Row) => row.id;
  readonly selection = signal<readonly unknown[]>([]);
  readonly activated = signal<string | null>(null);
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  const table = root.querySelector('table') as HTMLTableElement;
  return { fixture, root, table, host: fixture.componentInstance };
}

describe('DataTable selection', () => {
  it('labels every row checkbox with the row name', () => {
    const { table } = setup();
    const boxes = table.querySelectorAll('tbody input[type="checkbox"]');

    expect(boxes.length).toBe(3);
    expect(boxes[1].getAttribute('aria-label')).toBe('Seleccionar Bruno');
    expect(table.querySelector('thead input')?.getAttribute('aria-label')).toBe(
      'Seleccionar todas las filas',
    );
  });

  it('selects single rows without activating them and marks the header as indeterminate', () => {
    const { fixture, table, host } = setup();
    const box = table.querySelector('tbody input[type="checkbox"]') as HTMLInputElement;

    box.click();
    fixture.detectChanges();

    const header = table.querySelector('thead input') as HTMLInputElement;
    expect(host.selection()).toEqual([1]);
    expect(host.activated()).toBeNull();
    expect(header.indeterminate).toBe(true);
    expect(table.querySelector('tbody tr')?.className).toContain('bg-primary/14');
  });

  it('selects and clears all rows from the header checkbox', () => {
    const { fixture, table, host } = setup();
    const header = table.querySelector('thead input') as HTMLInputElement;

    header.click();
    fixture.detectChanges();
    expect(host.selection()).toEqual([1, 2, 3]);
    expect(header.checked).toBe(true);

    header.click();
    fixture.detectChanges();
    expect(host.selection()).toEqual([]);
  });
});
