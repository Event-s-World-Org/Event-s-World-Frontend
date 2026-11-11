import { Dialog } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog/dialog.service';
import { ToastOutlet } from './toast/toast-outlet';
import { ToastService } from './toast/toast.service';

const nextTick = () => new Promise((resolve) => setTimeout(resolve));

function overlay(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

function dialogButton(label: string): HTMLButtonElement {
  return [...overlay().querySelectorAll('button')].find(
    (button) => button.textContent?.trim() === label,
  ) as HTMLButtonElement;
}

describe('DialogService.confirm', () => {
  afterEach(() => TestBed.inject(Dialog).closeAll());

  async function open(extra: { tone?: 'danger'; confirmationText?: string } = {}) {
    const service = TestBed.inject(DialogService);
    const result = service.confirm({
      title: '¿Eliminar este borrador?',
      message: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar borrador',
      ...extra,
    });
    TestBed.tick();
    await nextTick();
    TestBed.tick();
    return result;
  }

  it('is a labelled dialog with Cancel focused first', async () => {
    void open();
    const dialog = overlay().querySelector('[role="dialog"]') as HTMLElement;
    const titleId = dialog.getAttribute('aria-labelledby') as string;

    // The CDK hides the rest of the page from assistive technology instead of using aria-modal.
    expect(document.getElementById(titleId)?.textContent).toBe('¿Eliminar este borrador?');
    expect(document.activeElement).toBe(dialogButton('Cancelar'));
  });

  it('resolves with the button that was pressed', async () => {
    const accepted = open();
    dialogButton('Eliminar borrador').click();
    expect(await accepted).toBe(true);

    const cancelled = open();
    dialogButton('Cancelar').click();
    expect(await cancelled).toBe(false);
  });

  it('requires the confirmation word for named destructive actions', async () => {
    const result = open({ tone: 'danger', confirmationText: 'ELIMINAR' });
    const confirm = dialogButton('Eliminar borrador');
    const input = overlay().querySelector('input') as HTMLInputElement;

    expect(confirm.disabled).toBe(true);
    expect(confirm.className).toContain('bg-rejected');

    input.value = 'ELIMINAR';
    input.dispatchEvent(new Event('input'));
    TestBed.tick();
    expect(confirm.disabled).toBe(false);

    confirm.click();
    expect(await result).toBe(true);
  });
});

describe('Toasts', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup() {
    const fixture = TestBed.createComponent(ToastOutlet);
    fixture.detectChanges();
    return {
      fixture,
      service: TestBed.inject(ToastService),
      root: fixture.nativeElement as HTMLElement,
    };
  }

  it('announces info politely and errors assertively', () => {
    const { fixture, service, root } = setup();

    service.success('Pago aprobado.');
    service.error('No pudimos guardar.');
    fixture.detectChanges();

    expect(root.querySelector('[role="status"]')?.textContent).toContain('Pago aprobado.');
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('No pudimos guardar.');
  });

  it('hides non-error toasts automatically but keeps errors until closed', () => {
    const { fixture, service, root } = setup();

    service.success('Guardado.');
    service.error('Falló.');
    vi.advanceTimersByTime(6000);
    fixture.detectChanges();

    expect(root.textContent).not.toContain('Guardado.');
    expect(root.textContent).toContain('Falló.');

    (root.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(root.textContent).not.toContain('Falló.');
  });
});
