import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable, Injector, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

/** Default overlay look: glass-overlay panel over a dimmed backdrop (design-system.md §3.1). */
const BASE_CONFIG: DialogConfig = {
  backdropClass: 'ew-overlay-backdrop',
  width: 'min(560px, calc(100vw - 32px))',
  maxHeight: '85dvh',
  restoreFocus: true,
};

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);

  /** Opens any component that uses `<app-dialog-layout>`. Focus is trapped and Escape closes it. */
  open<R, D, C>(
    component: ComponentType<C>,
    config: DialogConfig<D, DialogRef<R, C>> = {},
  ): DialogRef<R, C> {
    return this.dialog.open<R, D, C>(component, {
      ...(BASE_CONFIG as DialogConfig<D, DialogRef<R, C>>),
      ...config,
    });
  }

  /**
   * Opens a full-height side panel (a component using `<app-drawer-layout>`). It appears
   * without animation: blurred elements are never animated (design-system.md §7).
   */
  openDrawer<R, D, C>(
    component: ComponentType<C>,
    config: DialogConfig<D, DialogRef<R, C>> & { side?: 'left' | 'right' } = {},
  ): DialogRef<R, C> {
    const { side = 'right', ...dialogConfig } = config;
    const position = createGlobalPositionStrategy(this.injector).top('0');
    return this.open<R, D, C>(component, {
      width: 'min(360px, 85vw)',
      height: '100dvh',
      maxHeight: '100dvh',
      positionStrategy: side === 'left' ? position.left('0') : position.right('0'),
      ...dialogConfig,
    });
  }

  /**
   * Named confirmation for destructive or important actions. "Cancel" has the initial focus,
   * so pressing Enter by accident never confirms. Resolves `true` only when confirmed.
   */
  async confirm(data: ConfirmDialogData): Promise<boolean> {
    const ref = this.open<boolean, ConfirmDialogData, ConfirmDialog>(ConfirmDialog, {
      data,
      autoFocus: '[data-autofocus]',
      ariaLabelledBy: ConfirmDialog.titleId,
    });
    return (await firstValueFrom(ref.closed)) === true;
  }
}
