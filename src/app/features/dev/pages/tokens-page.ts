import { DOCUMENT, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  inject,
  signal,
} from '@angular/core';
import { ThemePreference, ThemeService } from '../../../core/theme';
import { Rgba, composite, contrastRatio, mixColors, parseColor } from '../contrast';

interface ContrastCheck {
  pair: string;
  ratio: number;
  documented: { light: string; dark: string };
  minimum: number;
}

const COLOR_TOKENS = [
  'bg',
  'surface',
  'surface-2',
  'border',
  'control-border',
  'text',
  'muted',
  'primary',
  'primary-hover',
  'on-primary',
  'accent',
  'chart',
] as const;

const STATUSES = [
  { key: 'pending', label: 'Pendiente', utility: 'bg-pending-bg text-pending' },
  { key: 'approved', label: 'Aprobado', utility: 'bg-approved-bg text-approved' },
  { key: 'observed', label: 'En observación', utility: 'bg-observed-bg text-observed' },
  { key: 'rejected', label: 'Rechazado', utility: 'bg-rejected-bg text-rejected' },
  { key: 'info', label: 'Finalizado', utility: 'bg-info-bg text-info' },
] as const;

const TYPE_SCALE = [
  { utility: 'text-display font-bold', label: 'Display · 33.2 px · 700' },
  { utility: 'text-event-title font-bold', label: 'Título de evento · 27.6 px · 700' },
  { utility: 'text-title font-bold', label: 'Título de página · 23 px · 700' },
  { utility: 'text-subtitle font-semibold', label: 'Subtítulo · 19.2 px · 600' },
  { utility: 'text-body', label: 'Cuerpo · 16 px · 400' },
  { utility: 'text-secondary font-semibold', label: 'Secundario · 14 px · 600' },
  { utility: 'text-meta', label: 'Meta · 12 px · 400' },
] as const;

/** Vertical position of the most intense backdrop spot (`--ew-sky-1`, design-system.md §4). */
const WORST_SPOT_Y = 0.06;

/**
 * Development-only page (`/dev/tokens`) to check the Salar Cristal tokens, glass levels and type
 * scale in both themes, with the worst-case contrast of design-system.md §6 computed live.
 */
@Component({
  selector: 'app-tokens-page',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-title font-bold">Tokens Salar Cristal</h1>
          <p class="text-secondary text-muted">Página de desarrollo · design-system.md</p>
        </div>
        <div class="glass flex gap-1 rounded-md p-1" role="group" aria-label="Tema">
          @for (option of themeOptions; track option.value) {
            <button
              type="button"
              class="min-h-11 rounded-sm px-4 text-secondary font-semibold"
              [class]="
                theme.preference() === option.value
                  ? 'bg-primary text-on-primary'
                  : 'text-text hover:bg-surface-2'
              "
              [attr.aria-pressed]="theme.preference() === option.value"
              (click)="theme.setPreference(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>
      </header>

      <section class="glass rounded-lg p-6" aria-labelledby="colors-title">
        <h2 id="colors-title" class="mb-4 text-subtitle font-semibold">Colores</h2>
        <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          @for (token of colors(); track token.name) {
            <li class="flex items-center gap-3">
              <span
                class="size-10 shrink-0 rounded-md border border-border"
                [style.background]="'var(--ew-' + token.name + ')'"
              ></span>
              <span class="min-w-0">
                <span class="block text-secondary font-semibold">{{ token.name }}</span>
                <span class="block text-meta text-muted tabular-nums">{{ token.value }}</span>
              </span>
            </li>
          }
        </ul>
      </section>

      <section class="glass rounded-lg p-6" aria-labelledby="status-title">
        <h2 id="status-title" class="mb-4 text-subtitle font-semibold">Estados</h2>
        <div class="flex flex-wrap gap-2">
          @for (status of statuses; track status.key) {
            <span
              class="inline-flex items-center gap-2 rounded-pill px-3 py-1 text-secondary font-semibold"
              [class]="status.utility"
            >
              <span class="size-2 rounded-pill bg-current" aria-hidden="true"></span>
              {{ status.label }}
            </span>
          }
          <span
            class="inline-flex items-center gap-2 rounded-pill bg-surface-2 px-3 py-1 text-secondary font-semibold text-muted"
          >
            <span class="size-2 rounded-pill bg-current" aria-hidden="true"></span>
            Borrador
          </span>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2" aria-label="Niveles de vidrio">
        <div class="glass rounded-lg p-6">
          <h2 class="text-subtitle font-semibold">Panel · glass</h2>
          <p class="text-muted">Tarjetas, tablas, barras, campos y botones secundarios.</p>
          <div class="mt-4 h-11 rounded-sm border border-control px-3 leading-11 text-muted">
            Borde de campo (control-border)
          </div>
        </div>
        <div class="glass-overlay rounded-lg p-6">
          <h2 class="text-subtitle font-semibold">Overlay · glass-overlay</h2>
          <p class="text-muted">Modales, drawers y menús emergentes.</p>
          <button
            type="button"
            class="mt-4 min-h-11 rounded-md bg-primary px-5 font-semibold text-on-primary hover:bg-primary-hover"
          >
            Botón primario
          </button>
        </div>
      </section>

      <section class="glass rounded-lg p-6" aria-labelledby="type-title">
        <h2 id="type-title" class="mb-4 text-subtitle font-semibold">Tipografía · Outfit</h2>
        <ul class="flex flex-col gap-3">
          @for (item of typeScale; track item.label) {
            <li>
              <span class="block" [class]="item.utility">Inscripciones abiertas</span>
              <span class="text-meta text-muted">{{ item.label }}</span>
            </li>
          }
        </ul>
      </section>

      <section class="glass rounded-lg p-6" aria-labelledby="radius-title">
        <h2 id="radius-title" class="mb-4 text-subtitle font-semibold">Esquinas</h2>
        <div class="flex flex-wrap gap-4 text-meta text-muted">
          <span class="flex size-20 items-end rounded-sm border border-control p-2">sm · 6</span>
          <span class="flex size-20 items-end rounded-md border border-control p-2">md · 12</span>
          <span class="flex size-20 items-end rounded-lg border border-control p-2">lg · 18</span>
          <span
            class="flex h-20 w-28 items-center justify-center rounded-pill border border-control"
          >
            pill
          </span>
        </div>
      </section>

      <section class="glass rounded-lg p-6" aria-labelledby="contrast-title">
        <h2 id="contrast-title" class="text-subtitle font-semibold">Contraste (peor caso, §6)</h2>
        <p class="mb-4 text-secondary text-muted">
          Calculado con el vidrio sobre el punto más intenso del fondo del tema activo.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-secondary">
            <thead>
              <tr class="border-b border-glass-border">
                <th scope="col" class="py-2 pr-4 font-semibold">Par</th>
                <th scope="col" class="py-2 pr-4 font-semibold">Calculado</th>
                <th scope="col" class="py-2 pr-4 font-semibold">Documentado</th>
                <th scope="col" class="py-2 pr-4 font-semibold">Mínimo</th>
                <th scope="col" class="py-2 font-semibold">Resultado</th>
              </tr>
            </thead>
            <tbody class="tabular-nums">
              @for (check of checks(); track check.pair) {
                <tr class="border-b border-glass-border last:border-0">
                  <td class="py-2 pr-4">{{ check.pair }}</td>
                  <td class="py-2 pr-4">{{ check.ratio | number: '1.2-2' }}</td>
                  <td class="py-2 pr-4">
                    {{ theme.isDark() ? check.documented.dark : check.documented.light }}
                  </td>
                  <td class="py-2 pr-4">{{ check.minimum }}</td>
                  <td class="py-2">
                    @if (check.ratio >= check.minimum) {
                      <span class="font-semibold text-approved">Cumple</span>
                    } @else {
                      <span class="font-semibold text-rejected">No cumple</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `,
})
export class TokensPage {
  protected readonly theme = inject(ThemeService);
  private readonly document = inject(DOCUMENT);

  protected readonly themeOptions: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'system', label: 'Sistema' },
  ];
  protected readonly statuses = STATUSES;
  protected readonly typeScale = TYPE_SCALE;
  protected readonly colors = signal<{ name: string; value: string }[]>([]);
  protected readonly checks = signal<ContrastCheck[]>([]);

  constructor() {
    // Re-read the tokens after the `dark` class changes and the styles apply.
    afterRenderEffect({
      read: () => {
        this.theme.isDark();
        const styles = getComputedStyle(this.document.documentElement);
        const token = (name: string) => styles.getPropertyValue(`--ew-${name}`).trim();
        this.colors.set(COLOR_TOKENS.map((name) => ({ name, value: token(name) })));
        this.checks.set(this.computeChecks((name) => parseColor(token(name))));
      },
    });
  }

  private computeChecks(color: (name: string) => Rgba): ContrastCheck[] {
    const base = mixColors(color('sky-top'), color('sky-bottom'), WORST_SPOT_Y);
    const backdrop = composite(color('sky-1'), base);
    const glass = composite(color('glass'), backdrop);
    const statusRatios = STATUSES.map(({ key }) =>
      contrastRatio(color(`status-${key}`), color(`status-${key}-bg`)),
    );

    return [
      {
        pair: 'Texto sobre vidrio',
        ratio: contrastRatio(color('text'), glass),
        documented: { light: '11.85', dark: '9.77' },
        minimum: 4.5,
      },
      {
        pair: 'Texto secundario sobre vidrio',
        ratio: contrastRatio(color('muted'), glass),
        documented: { light: '5.43', dark: '4.94' },
        minimum: 4.5,
      },
      {
        pair: 'Borde de campo sobre vidrio',
        ratio: contrastRatio(color('control-border'), glass),
        documented: { light: '3.72', dark: '3.59' },
        minimum: 3,
      },
      {
        pair: 'Título grande sobre el fondo',
        ratio: contrastRatio(color('text'), backdrop),
        documented: { light: '7.68', dark: '6.48' },
        minimum: 3,
      },
      {
        pair: 'Botón primario',
        ratio: contrastRatio(color('on-primary'), color('primary')),
        documented: { light: '6.04', dark: '7.68' },
        minimum: 4.5,
      },
      {
        pair: 'Estados (el más bajo)',
        ratio: Math.min(...statusRatios),
        documented: { light: '6.49–7.57', dark: '7.85–9.62' },
        minimum: 4.5,
      },
    ];
  }
}
