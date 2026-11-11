import { CdkTableModule } from '@angular/cdk/table';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { LucideArrowDown, LucideArrowUp, LucideChevronsUpDown } from '@lucide/angular';
import { Skeleton } from '../skeleton/skeleton';

export interface TableColumn<T> {
  key: string;
  header: string;
  /** Plain-text value; use an `appCell` template for anything richer. */
  value?: (row: T) => string | number | null | undefined;
  sortable?: boolean;
  align?: 'start' | 'end';
  /** Shown as the card title on mobile. Defaults to the first column. */
  primary?: boolean;
}

export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  key: string;
  direction: SortDirection;
}

/** Custom cell content: `<ng-template appCell="status" let-row>…</ng-template>`. */
@Directive({ selector: 'ng-template[appCell]' })
export class CellDef {
  readonly key = input.required<string>({ alias: 'appCell' });
  readonly template = inject<TemplateRef<{ $implicit: unknown }>>(TemplateRef);
}

const SKELETON_ROWS = [0, 1, 2, 3, 4];
const SELECT_COLUMN = '__select';
const CHECKBOX_CLASSES = 'size-5 cursor-pointer accent-primary';

/**
 * Data table on the CDK table (ADR-0007). On desktop it is one glass panel with sortable
 * headers; below `md` every row becomes a card. Sorting and pagination are emitted, not
 * applied, so the server can do them (participant list, audit log). Rows can be selected
 * with `selectable` and `[(selection)]`.
 */
@Component({
  selector: 'app-data-table',
  imports: [
    CdkTableModule,
    NgTemplateOutlet,
    Skeleton,
    LucideArrowUp,
    LucideArrowDown,
    LucideChevronsUpDown,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable<T> {
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  /** Accessible name, e.g. "Participantes". */
  readonly caption = input.required<string>();
  readonly trackBy = input<(row: T) => unknown>((row) => row);
  readonly loading = input(false, { transform: booleanAttribute });
  /** Makes rows focusable and clickable, emitting `rowActivate` on click or Enter. */
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly sort = model<TableSort | null>(null);
  readonly rowActivate = output<T>();
  /** Adds a checkbox column. `selection` holds the `trackBy` keys of the selected rows. */
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly selection = model<readonly unknown[]>([]);

  private readonly cells = contentChildren(CellDef);

  protected readonly skeletonRows = SKELETON_ROWS;
  protected readonly selectColumn = SELECT_COLUMN;
  protected readonly checkboxClasses = CHECKBOX_CLASSES;
  protected readonly columnKeys = computed(() => {
    const keys = this.columns().map((column) => column.key);
    return this.selectable() ? [SELECT_COLUMN, ...keys] : keys;
  });
  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.rows().every((row) => this.isSelected(row)),
  );
  protected readonly someSelected = computed(
    () => !this.allSelected() && this.rows().some((row) => this.isSelected(row)),
  );
  /** While loading, the CDK table renders placeholder rows. */
  protected readonly tableRows = computed<readonly unknown[]>(() =>
    this.loading() ? SKELETON_ROWS : this.rows(),
  );
  protected readonly primaryColumn = computed(
    () => this.columns().find((column) => column.primary) ?? this.columns()[0],
  );
  protected readonly secondaryColumns = computed(() =>
    this.columns().filter((column) => column !== this.primaryColumn()),
  );

  protected readonly trackRow = (_: number, row: unknown) =>
    this.loading() ? row : this.trackBy()(row as T);

  protected cellTemplate(key: string): TemplateRef<unknown> | null {
    return this.cells().find((cell) => cell.key() === key)?.template ?? null;
  }

  protected sortDirection(key: string): SortDirection | null {
    const sort = this.sort();
    return sort?.key === key ? sort.direction : null;
  }

  protected ariaSort(key: string): 'ascending' | 'descending' | 'none' | null {
    const column = this.columns().find((item) => item.key === key);
    if (!column?.sortable) {
      return null;
    }
    const direction = this.sortDirection(key);
    return direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';
  }

  protected toggleSort(key: string): void {
    const direction = this.sortDirection(key);
    this.sort.set(
      direction === 'asc'
        ? { key, direction: 'desc' }
        : direction === 'desc'
          ? null
          : { key, direction: 'asc' },
    );
  }

  protected activate(row: unknown): void {
    if (this.interactive() && !this.loading()) {
      this.rowActivate.emit(row as T);
    }
  }

  protected isSelected(row: unknown): boolean {
    return this.selection().includes(this.trackBy()(row as T));
  }

  protected toggleRow(row: unknown): void {
    const key = this.trackBy()(row as T);
    this.selection.set(
      this.isSelected(row)
        ? this.selection().filter((item) => item !== key)
        : [...this.selection(), key],
    );
  }

  /** Selects or clears every row of the current page, keeping selections from other pages. */
  protected toggleAll(): void {
    const pageKeys = this.rows().map((row) => this.trackBy()(row));
    const others = this.selection().filter((key) => !pageKeys.includes(key));
    this.selection.set(this.allSelected() ? others : [...others, ...pageKeys]);
  }

  /** Accessible name of a row checkbox, from the primary column. */
  protected rowLabel(row: unknown): string {
    const name = this.primaryColumn()?.value?.(row as T) ?? '';
    return $localize`:@@table.selectRow:Seleccionar ${name}:name:`;
  }

  protected rowClasses(row: unknown): string {
    return [
      this.interactive() ? 'cursor-pointer hover:bg-surface-2' : '',
      // Selected row: primary at 14 % plus a 3 px indicator (design-system.md §9).
      this.selectable() && this.isSelected(row)
        ? 'bg-primary/14 shadow-[inset_3px_0_0_var(--ew-primary)]'
        : '',
    ].join(' ');
  }
}
