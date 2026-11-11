/**
 * Shared look of text inputs and native selects: translucent fill (no blur of its own, the
 * field sits on a glass panel), `control-border` (≥ 3:1) and a red border when invalid.
 */
const FIELD_BASE = [
  'block w-full rounded-sm border border-control bg-glass px-3 text-body text-text',
  'placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60',
  'aria-invalid:border-rejected',
].join(' ');

export const FIELD_CLASSES = `${FIELD_BASE} h-11`;
export const TEXTAREA_CLASSES = `${FIELD_BASE} min-h-24 py-2`;

export const LABEL_CLASSES = 'mb-1 block text-secondary font-semibold';
export const HINT_CLASSES = 'mt-1 text-meta text-muted';
export const ERROR_CLASSES = 'mt-1 text-meta font-semibold text-rejected';
