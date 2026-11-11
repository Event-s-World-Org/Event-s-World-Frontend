import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { LucideFileText, LucideUpload } from '@lucide/angular';
import { Button } from '../button/button';
import { ERROR_CLASSES, HINT_CLASSES, LABEL_CLASSES } from '../form-control/field-classes';
import { FormControlBase } from '../form-control/form-control';
import { ProgressBar } from '../progress-bar/progress-bar';

const TYPE_LABELS: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'application/pdf': 'PDF',
};

const sizeFormat = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 1 });

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${sizeFormat.format(bytes / 1024)} KB`
    : `${sizeFormat.format(bytes / (1024 * 1024))} MB`;
}

/**
 * File picker with drag and drop for vouchers, QR images and covers. It checks the type and
 * size in the browser (the server checks again by magic bytes, NFR-04.3) and shows the upload
 * progress passed by the parent. The control value is the selected `File` or `null`.
 */
@Component({
  selector: 'app-file-dropzone',
  imports: [Button, ProgressBar, LucideFileText, LucideUpload],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './file-dropzone.html',
  styleUrl: './file-dropzone.css',
})
export class FileDropzone extends FormControlBase<File | null> {
  /** Accepted MIME types. Default: voucher formats (FR-03.3). */
  readonly accept = input<readonly string[]>(['image/jpeg', 'image/png', 'application/pdf']);
  readonly maxSizeMb = input(5);
  /** Upload progress 0–100 while the parent uploads the file; `null` hides the bar. */
  readonly progress = input<number | null>(null);

  protected readonly value = signal<File | null>(null);
  protected readonly dragging = signal(false);
  protected readonly fileError = signal<string | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly labelId = `${this.id}-label`;
  protected readonly instructionsId = `${this.id}-instructions`;
  protected readonly labelClasses = LABEL_CLASSES;
  protected readonly hintClasses = HINT_CLASSES;
  protected readonly errorClasses = ERROR_CLASSES;

  protected readonly acceptAttr = computed(() => this.accept().join(','));
  protected readonly formats = computed(() => {
    const labels = this.accept().map((type) => TYPE_LABELS[type] ?? type);
    return labels.length > 1
      ? `${labels.slice(0, -1).join(', ')} o ${labels[labels.length - 1]}`
      : labels[0];
  });
  protected readonly shownError = computed(() => this.fileError() ?? this.errorText());
  protected readonly fileSize = computed(() => {
    const file = this.value();
    return file ? formatSize(file.size) : '';
  });
  protected readonly inputDescribedBy = computed(() =>
    [this.instructionsId, this.hint() ? this.hintId : null, this.shownError() ? this.errorId : null]
      .filter(Boolean)
      .join(' '),
  );

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => this.revokePreview());
  }

  override writeValue(value: File | null): void {
    super.writeValue(value ?? null);
    this.fileError.set(null);
    this.revokePreview();
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.select(input.files?.[0]);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.dragging.set(true);
    }
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.disabled()) {
      this.select(event.dataTransfer?.files?.[0]);
    }
  }

  protected remove(): void {
    this.revokePreview();
    this.fileError.set(null);
    this.updateValue(null);
    this.markTouched();
  }

  private select(file: File | undefined): void {
    if (!file) {
      return;
    }
    this.markTouched();
    if (!this.accept().includes(file.type)) {
      this.fileError.set(
        $localize`:@@files.invalidType:Este archivo no es válido. Sube un archivo ${this.formats()}:formats:.`,
      );
      return;
    }
    if (file.size > this.maxSizeMb() * 1024 * 1024) {
      this.fileError.set(
        $localize`:@@files.tooLarge:El archivo pesa ${formatSize(file.size)}:size:. El máximo es ${this.maxSizeMb()}:max: MB.`,
      );
      return;
    }
    this.fileError.set(null);
    this.revokePreview();
    if (file.type.startsWith('image/')) {
      this.previewUrl.set(URL.createObjectURL(file));
    }
    this.updateValue(file);
  }

  private revokePreview(): void {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.previewUrl.set(null);
    }
  }
}
