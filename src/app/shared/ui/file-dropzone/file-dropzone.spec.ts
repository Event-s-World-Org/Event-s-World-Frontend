import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileDropzone } from './file-dropzone';

@Component({
  imports: [ReactiveFormsModule, FileDropzone],
  template: `
    <app-file-dropzone
      label="Comprobante de pago"
      [formControl]="voucher"
      [maxSizeMb]="1"
      [progress]="progress()"
    />
  `,
})
class Host {
  readonly voucher = new FormControl<File | null>(null, Validators.required);
  readonly progress = signal<number | null>(null);
}

function setup() {
  URL.createObjectURL ??= () => 'blob:preview';
  URL.revokeObjectURL ??= () => undefined;
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root, host: fixture.componentInstance };
}

function pick(fixture: { detectChanges(): void }, root: HTMLElement, file: File) {
  const input = root.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  input.dispatchEvent(new Event('change'));
  fixture.detectChanges();
}

const file = (name: string, type: string, bytes: number) =>
  new File([new Uint8Array(bytes)], name, { type });

describe('FileDropzone', () => {
  it('is a labelled file input that lists the accepted formats and limit', () => {
    const { root } = setup();
    const input = root.querySelector('input[type="file"]') as HTMLInputElement;
    const labelledBy = input.getAttribute('aria-labelledby') as string;
    const describedBy = input.getAttribute('aria-describedby') as string;

    expect(root.querySelector(`#${labelledBy}`)?.textContent).toContain('Comprobante de pago');
    expect(input.accept).toBe('image/jpeg,image/png,application/pdf');
    expect(root.querySelector(`#${describedBy.split(' ')[0]}`)?.textContent).toContain(
      'JPG, PNG o PDF · máximo 1 MB',
    );
  });

  it('accepts a valid file and shows its name and size', () => {
    const { fixture, root, host } = setup();

    pick(fixture, root, file('voucher.pdf', 'application/pdf', 2048));

    expect(host.voucher.value?.name).toBe('voucher.pdf');
    expect(root.textContent).toContain('voucher.pdf');
    expect(root.textContent).toContain('2 KB');
  });

  it('rejects other types and files over the size limit', () => {
    const { fixture, root, host } = setup();

    pick(fixture, root, file('virus.exe', 'application/x-msdownload', 10));
    expect(host.voucher.value).toBeNull();
    expect(root.querySelector('p.text-rejected')?.textContent).toContain('JPG, PNG o PDF');

    pick(fixture, root, file('big.png', 'image/png', 2 * 1024 * 1024));
    expect(host.voucher.value).toBeNull();
    expect(root.querySelector('p.text-rejected')?.textContent).toContain('El máximo es 1 MB');
  });

  it('removes the selected file', () => {
    const { fixture, root, host } = setup();
    pick(fixture, root, file('qr.png', 'image/png', 100));

    const remove = [...root.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Quitar',
    ) as HTMLButtonElement;
    remove.click();
    fixture.detectChanges();

    expect(host.voucher.value).toBeNull();
    expect(root.querySelector('input[type="file"]')).not.toBeNull();
  });

  it('shows the upload progress and blocks removal while uploading', () => {
    const { fixture, root, host } = setup();
    pick(fixture, root, file('voucher.jpg', 'image/jpeg', 100));

    host.progress.set(40);
    fixture.detectChanges();

    expect(root.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('40');
    expect((root.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
  });
});
