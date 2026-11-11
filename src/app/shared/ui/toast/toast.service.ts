import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

const DEFAULT_DURATION_MS = 5000;
const MAX_VISIBLE = 3;

/**
 * Short feedback messages ("Pago aprobado", "No se pudo guardar"). Rendered by
 * `<app-toast-outlet>` in the root component. Errors stay until closed.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly items = signal<Toast[]>([]);
  readonly toasts = this.items.asReadonly();

  show(message: string, tone: ToastTone = 'info', durationMs = DEFAULT_DURATION_MS): number {
    const id = this.nextId++;
    this.items.update((list) => [...list, { id, message, tone }].slice(-MAX_VISIBLE));
    if (tone !== 'error' && durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
    return id;
  }

  success(message: string): number {
    return this.show(message, 'success');
  }

  error(message: string): number {
    return this.show(message, 'error');
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((toast) => toast.id !== id));
  }
}
