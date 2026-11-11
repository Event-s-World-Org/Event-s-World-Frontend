import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowLeft,
  LucideArrowRight,
  LucideCalendarClock,
  LucideCheck,
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronUp,
  LucideGripVertical,
  LucideImage,
  LucideLayers,
  LucidePencil,
  LucidePlus,
  LucideQrCode,
  LucideSparkles,
  LucideTag,
  LucideX,
} from '@lucide/angular';
import { EventsStore, PricingPhase } from '../services/events.store';

@Component({
  selector: 'app-event-wizard-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideChevronLeft,
    LucideAlertCircle,
    LucideImage,
    LucideQrCode,
    LucidePlus,
    LucideX,
    LucideSparkles,
    LucideArrowRight,
    LucideArrowLeft,
    LucideGripVertical,
    LucidePencil,
    LucideCheck,
    LucideChevronUp,
    LucideChevronDown,
    LucideLayers,
    LucideCalendarClock,
    LucideTag,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-wizard.page.html',
  styleUrl: './event-wizard.page.css',
})
export class EventWizardPage {
  readonly eventsStore = inject(EventsStore);
  readonly router = inject(Router);

  readonly step = signal<1 | 2 | 3>(1);

  readonly title = signal('Electric Neon Fest 2026');
  readonly description = signal(
    'Festival nocturno de música electrónica, luces y arte digital en el corazón de La Paz.',
  );
  readonly coverPreview = signal<string | null>(null);
  readonly category = signal('Festival y música');
  readonly startDate = signal('2026-11-15T18:00');
  readonly endDate = signal('2026-11-16T02:00');
  readonly country = signal('Bolivia');
  readonly city = signal('La Paz');
  readonly location = signal('Arena Central');
  readonly capacityMax = signal(500);
  readonly minAge = signal(18);
  readonly contactInfo = signal('contacto@electricneon.bo · +591 70012345');

  readonly isFree = signal(false);
  readonly pricingMode = signal<'single' | 'phases'>('phases');
  readonly price = signal(200);
  readonly currency = signal('BOB');
  readonly qrPreview = signal<string | null>(null);
  readonly qrAmount = signal(200);
  readonly qrExpiresAt = signal('2026-11-30');

  readonly phases = signal<PricingPhase[]>([
    {
      id: 'fase-1',
      name: 'Fase 1: Preventa Inicial',
      price: 200,
      startDate: '2026-11-01',
      endDate: '2026-11-15',
      limitSpots: 50,
    },
    {
      id: 'fase-2',
      name: 'Fase 2: Venta Regular',
      price: 250,
      startDate: '2026-11-16',
      endDate: '2026-11-30',
      limitSpots: 100,
    },
  ]);

  readonly activePhase = computed(() => {
    const list = this.phases();
    if (!list.length) return null;
    const nowStr = new Date().toISOString().slice(0, 10);
    const found = list.find((p) => p.startDate <= nowStr && nowStr <= p.endDate);
    return found || list[0];
  });

  readonly effectivePrice = computed(() => {
    if (this.isFree()) return 0;
    if (this.pricingMode() === 'single') return Number(this.price()) || 0;
    const active = this.activePhase();
    return active ? active.price : (this.phases()[0]?.price || 0);
  });

  addPhase(): void {
    const currentList = this.phases();
    const nextNum = currentList.length + 1;
    const lastPhase = currentList[currentList.length - 1];

    let newStart = '2026-12-01';
    const newEnd = '2026-12-15';
    let defaultPrice = 280;

    if (lastPhase) {
      defaultPrice = lastPhase.price + 50;
      if (lastPhase.endDate) {
        newStart = lastPhase.endDate;
      }
    }

    const newPhase: PricingPhase = {
      id: `fase-${Date.now()}`,
      name: `Fase ${nextNum}: Preventa ${nextNum}`,
      price: defaultPrice,
      startDate: newStart,
      endDate: newEnd,
      limitSpots: 50,
    };

    this.phases.update((prev) => [...prev, newPhase]);
  }

  removePhase(index: number): void {
    if (this.phases().length <= 1) return;
    this.phases.update((prev) => prev.filter((_, i) => i !== index));
  }

  updatePhaseName(index: number, name: string): void {
    this.phases.update((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name };
      return copy;
    });
  }

  updatePhasePrice(index: number, price: number | string): void {
    const num = Number(price) || 0;
    this.phases.update((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], price: num };
      return copy;
    });
  }

  updatePhaseStartDate(index: number, startDate: string): void {
    this.phases.update((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], startDate };
      return copy;
    });
  }

  updatePhaseEndDate(index: number, endDate: string): void {
    this.phases.update((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], endDate };
      return copy;
    });
  }

  updatePhaseLimitSpots(index: number, limitSpots: number | string): void {
    const val = Number(limitSpots) || undefined;
    this.phases.update((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], limitSpots: val };
      return copy;
    });
  }

  getPhaseStatus(phase: PricingPhase): 'active' | 'upcoming' | 'expired' {
    const nowStr = new Date().toISOString().slice(0, 10);
    if (phase.startDate && nowStr < phase.startDate) return 'upcoming';
    if (phase.endDate && nowStr > phase.endDate) return 'expired';
    return 'active';
  }

  readonly customFields = signal<
    { label: string; type: string; required: boolean }[]
  >([
    { label: 'Nombres', type: 'text', required: true },
    { label: 'Apellidos', type: 'text', required: true },
    { label: 'Email', type: 'email', required: true },
    { label: 'Celular', type: 'tel', required: true },
    { label: 'Talla de polera', type: 'select', required: true },
  ]);

  readonly newFieldLabel = signal('');
  readonly newFieldType = signal('text');
  readonly newFieldRequired = signal(false);

  readonly editingIndex = signal<number | null>(null);
  readonly editLabel = signal('');
  readonly editType = signal('text');
  readonly editRequired = signal(true);
  readonly draggedIndex = signal<number | null>(null);

  startEdit(index: number): void {
    const field = this.customFields()[index];
    if (!field) return;
    this.editLabel.set(field.label);
    this.editType.set(field.type);
    this.editRequired.set(field.required);
    this.editingIndex.set(index);
  }

  saveEdit(): void {
    const idx = this.editingIndex();
    if (idx === null || !this.editLabel().trim()) return;
    this.customFields.update((list) => {
      const copy = [...list];
      copy[idx] = {
        label: this.editLabel().trim(),
        type: this.editType(),
        required: this.editRequired(),
      };
      return copy;
    });
    this.editingIndex.set(null);
  }

  cancelEdit(): void {
    this.editingIndex.set(null);
  }

  moveFieldUp(index: number): void {
    if (index <= 0) return;
    this.customFields.update((list) => {
      const copy = [...list];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  }

  moveFieldDown(index: number): void {
    const list = this.customFields();
    if (index >= list.length - 1) return;
    this.customFields.update((curr) => {
      const copy = [...curr];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  }

  onDragStart(index: number): void {
    this.draggedIndex.set(index);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(targetIndex: number): void {
    const from = this.draggedIndex();
    if (from !== null && from !== targetIndex) {
      this.customFields.update((list) => {
        const copy = [...list];
        const [moved] = copy.splice(from, 1);
        copy.splice(targetIndex, 0, moved);
        return copy;
      });
    }
    this.draggedIndex.set(null);
  }

  onDragEnd(): void {
    this.draggedIndex.set(null);
  }

  readonly errorMessage = signal<string | null>(null);

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => this.coverPreview.set(reader.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  onQrSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => this.qrPreview.set(reader.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  addCustomField(): void {
    if (!this.newFieldLabel().trim()) return;
    this.customFields.update((prev) => [
      ...prev,
      {
        label: this.newFieldLabel().trim(),
        type: this.newFieldType(),
        required: this.newFieldRequired(),
      },
    ]);
    this.newFieldLabel.set('');
  }

  removeField(index: number): void {
    this.customFields.update((prev) => prev.filter((_, i) => i !== index));
  }

  nextStep(): void {
    if (this.step() === 1) {
      if (!this.title().trim() || !this.location().trim()) {
        this.errorMessage.set('Completa el título y el lugar del evento');
        return;
      }
      this.errorMessage.set(null);
      this.step.set(2);
    } else if (this.step() === 2) {
      this.errorMessage.set(null);
      this.step.set(3);
    }
  }

  prevStep(): void {
    if (this.step() === 3) this.step.set(2);
    else if (this.step() === 2) this.step.set(1);
  }

  publishEvent(): void {
    const isFreeEvent = this.isFree();
    const mode = isFreeEvent ? 'single' : this.pricingMode();
    const finalPrice = this.effectivePrice();

    const created = this.eventsStore.createEvent({
      title: this.title().trim(),
      description: this.description().trim(),
      category: this.category(),
      startDate: this.startDate(),
      endDate: this.endDate(),
      country: this.country(),
      city: this.city(),
      location: this.location().trim(),
      price: finalPrice,
      pricingMode: mode,
      phases: !isFreeEvent && mode === 'phases' ? this.phases() : undefined,
      currency: this.currency(),
      capacityMax: Number(this.capacityMax()) || 100,
      minAge: Number(this.minAge()) || undefined,
      coverUrl: this.coverPreview() || undefined,
      qrImageUrl: this.qrPreview() || undefined,
      qrAmount: Number(this.qrAmount()) || finalPrice,
      qrExpiresAt: this.qrExpiresAt(),
      status: 'published',
      contactInfo: this.contactInfo().trim(),
      customFields: this.customFields(),
    });

    void this.router.navigate(['/panel/eventos', created.id]);
  }
}
