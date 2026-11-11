import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Glass panel (design-system.md §3.1, panel level) with an optional heading, description and
 * header actions (`<button cardActions>`). Content is projected below the header.
 */
@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'glass flex flex-col gap-4 rounded-lg p-5' },
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  readonly title = input<string>();
  readonly description = input<string>();
}
