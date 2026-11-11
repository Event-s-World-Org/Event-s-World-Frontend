import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Content of a tooltip. Solid, like toasts, so it is readable over any surface. */
@Component({
  selector: 'app-tooltip-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tooltip',
    '[id]': 'panelId()',
    class:
      'pointer-events-none flex items-center gap-2 rounded-sm bg-text px-2 py-1 text-meta font-semibold text-bg shadow-lg',
  },
  templateUrl: './tooltip-panel.html',
  styleUrl: './tooltip-panel.css',
})
export class TooltipPanel {
  readonly panelId = input.required<string>();
  readonly text = input.required<string>();
  readonly shortcut = input<string>();
}
