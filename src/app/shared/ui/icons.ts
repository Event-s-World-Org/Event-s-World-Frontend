import { Provider } from '@angular/core';
import { provideLucideConfig } from '@lucide/angular';

/**
 * Lucide defaults from design-system.md §5.4: 20 px icons with a 1.75 stroke.
 *
 * Provide it in each lazy feature's root route, not in `app.config.ts`: anything the root
 * imports from `@lucide/angular` moves the whole Lucide chunk (~40 kB) into the initial
 * bundle of every page.
 */
export function provideIcons(): Provider {
  return provideLucideConfig({ size: 20, strokeWidth: 1.75 });
}
