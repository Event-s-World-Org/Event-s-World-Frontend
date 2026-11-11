import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideCheck,
  LucideDownload,
  LucideEllipsisVertical,
  LucideMenu,
  LucidePencil,
  LucidePlus,
  LucideX,
} from '@lucide/angular';
import { ThemePreference, ThemeService } from '../../../core/theme';
import {
  Avatar,
  Button,
  Card,
  CellDef,
  Checkbox,
  ChipOption,
  DataTable,
  DialogService,
  EmptyState,
  FileDropzone,
  FilterChips,
  KpiCard,
  Menu,
  MenuItem,
  MenuTrigger,
  Paginator,
  ProgressBar,
  RegistrationStatus,
  SelectField,
  Skeleton,
  Status,
  StatusBadge,
  StepItem,
  Stepper,
  TableColumn,
  TableSort,
  TextField,
  ToastService,
  Toggle,
  Tooltip,
} from '../../../shared/ui';
import { DemoDrawer } from './demo-drawer';

interface SampleRow {
  code: string;
  name: string;
  email: string;
  status: RegistrationStatus;
  amount: number;
  date: string;
}

const NAMES = [
  'Ana Quispe',
  'Bruno Mamani',
  'Carla Vargas',
  'Diego Rojas',
  'Elena Choque',
  'Fabián Torrez',
  'Gabriela Flores',
  'Hugo Condori',
  'Inés Gutiérrez',
  'Jorge Limachi',
  'Karen Apaza',
  'Luis Huanca',
];
const STATUS_CYCLE: RegistrationStatus[] = ['pending', 'approved', 'in_observation', 'rejected'];
const SAMPLE_ROWS: SampleRow[] = NAMES.map((name, index) => ({
  code: `EW-${(7 + index).toString(36).toUpperCase()}3K${index + 2}`,
  name,
  email: `${name.split(' ')[0].toLowerCase()}@correo.com`,
  status: STATUS_CYCLE[index % STATUS_CYCLE.length],
  amount: 120 + (index % 3) * 30,
  date: `2026-11-${String(10 + index).padStart(2, '0')}`,
}));
const PAGE_SIZE = 5;

/** Development-only showcase of `shared/ui` (`/dev/ui`), in both themes. */
@Component({
  selector: 'app-ui-page',
  imports: [
    ReactiveFormsModule,
    Avatar,
    Button,
    Card,
    CellDef,
    Checkbox,
    DataTable,
    EmptyState,
    FileDropzone,
    FilterChips,
    KpiCard,
    Menu,
    MenuItem,
    MenuTrigger,
    Paginator,
    ProgressBar,
    SelectField,
    Skeleton,
    StatusBadge,
    Stepper,
    TextField,
    Toggle,
    Tooltip,
    LucideCheck,
    LucideDownload,
    LucideEllipsisVertical,
    LucideMenu,
    LucidePencil,
    LucidePlus,
    LucideX,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-page.html',
  styleUrl: './ui-page.css',
})
export class UiPage {
  protected readonly theme = inject(ThemeService);
  protected readonly toast = inject(ToastService);
  private readonly dialogs = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  protected readonly themeOptions: ChipOption[] = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'system', label: 'Sistema' },
  ];
  protected readonly statuses: Status[] = [
    'pending',
    'in_observation',
    'approved',
    'rejected',
    'confirmed',
    'draft',
    'published',
    'registrations_closed',
    'finished',
    'suspended',
  ];
  protected readonly chipOptions: ChipOption[] = [
    { value: 'pending', label: 'Pendiente', count: 12 },
    { value: 'in_observation', label: 'En observación', count: 3 },
    { value: 'approved', label: 'Aprobado', count: 70 },
    { value: 'rejected', label: 'Rechazado', count: 1 },
  ];
  protected readonly chipValue = signal<string | null>('pending');
  protected readonly categories = [
    { value: 'sports', label: 'Deporte' },
    { value: 'culture', label: 'Cultura' },
    { value: 'education', label: 'Educación' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    category: ['', Validators.required],
    startsAt: [''],
    capacity: ['', [Validators.required, Validators.min(1)]],
    description: ['', Validators.maxLength(500)],
    free: [false],
    voucher: this.fb.control<File | null>(null, Validators.required),
    privacy: [false, Validators.requiredTrue],
  });
  protected readonly uploadProgress = signal<number | null>(null);

  protected readonly wizardSteps: StepItem[] = [
    { label: 'Datos del evento' },
    { label: 'Precio y pago' },
    { label: 'Formulario' },
  ];
  protected readonly step = signal(2);
  protected readonly selection = signal<readonly unknown[]>([]);

  protected readonly columns: TableColumn<SampleRow>[] = [
    { key: 'name', header: 'Nombre', value: (row) => row.name, sortable: true, primary: true },
    { key: 'code', header: 'Código', value: (row) => row.code },
    { key: 'email', header: 'Correo', value: (row) => row.email },
    { key: 'status', header: 'Estado' },
    {
      key: 'amount',
      header: 'Monto',
      value: (row) => `Bs ${row.amount.toFixed(2)}`,
      sortable: true,
      align: 'end',
    },
  ];
  protected readonly tableFilterOptions: ChipOption[] = this.chipOptions.map(
    ({ value, label }) => ({
      value,
      label,
    }),
  );
  protected readonly tableFilter = signal<string | null>(null);
  protected readonly sort = signal<TableSort | null>(null);
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly loading = signal(false);
  protected readonly trackByCode = (row: SampleRow) => row.code;

  protected readonly filteredRows = computed(() => {
    const filter = this.tableFilter();
    const rows = filter ? SAMPLE_ROWS.filter((row) => row.status === filter) : [...SAMPLE_ROWS];
    const sort = this.sort();
    if (sort) {
      const key = sort.key as keyof SampleRow;
      const factor = sort.direction === 'asc' ? 1 : -1;
      rows.sort((a, b) => (a[key] > b[key] ? factor : a[key] < b[key] ? -factor : 0));
    }
    return rows;
  });
  protected readonly pageRows = computed(() =>
    this.filteredRows().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );

  protected setTheme(value: string | null): void {
    this.theme.setPreference((value ?? 'system') as ThemePreference);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    // Simulated upload so the dropzone progress bar can be checked.
    this.uploadProgress.set(0);
    const timer = setInterval(() => {
      const next = (this.uploadProgress() ?? 0) + 20;
      this.uploadProgress.set(Math.min(next, 100));
      if (next >= 100) {
        clearInterval(timer);
        this.uploadProgress.set(null);
        this.toast.success('Inscripción enviada.');
      }
    }, 300);
  }

  protected openDrawer(): void {
    this.dialogs.openDrawer(DemoDrawer, { side: 'left', ariaLabelledBy: DemoDrawer.titleId });
  }

  protected async confirmPublish(): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      title: '¿Publicar el evento?',
      message: 'Las personas podrán ver el evento e inscribirse desde el enlace público.',
      confirmLabel: 'Publicar evento',
    });
    this.toast.show(confirmed ? 'Evento publicado.' : 'No se publicó el evento.');
  }

  protected async confirmDelete(): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      title: '¿Eliminar este borrador?',
      message: 'Se borrarán los datos del evento. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar borrador',
      tone: 'danger',
      confirmationText: 'ELIMINAR',
    });
    if (confirmed) {
      this.toast.success('Borrador eliminado.');
    }
  }
}
