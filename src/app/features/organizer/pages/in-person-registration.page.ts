import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowLeft,
  LucideBanknote,
  LucideCamera,
  LucideCheck,
  LucideMoon,
  LucideQrCode,
  LucideSearch,
  LucideSun,
  LucideX,
} from '@lucide/angular';
import {
  Attendee,
  InPersonStore,
  PaymentMethod,
} from '../services/in-person.store';

@Component({
  selector: 'app-in-person-registration-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideArrowLeft,
    LucideSun,
    LucideMoon,
    LucideCheck,
    LucideBanknote,
    LucideQrCode,
    LucideCamera,
    LucideSearch,
    LucideAlertCircle,
    LucideX,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './in-person-registration.page.html',
  styleUrl: './in-person-registration.page.css',
})
export class InPersonRegistrationPage {
  readonly store = inject(InPersonStore);

  readonly activeTab = signal<'wizard' | 'installments'>('wizard');

  readonly isDark = signal<boolean>(
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false,
  );

  toggleTheme(): void {
    if (typeof document === 'undefined') return;
    const nextDark = !this.isDark();
    this.isDark.set(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }

  readonly currentStep = signal<1 | 2 | 3>(1);

  readonly firstName = signal('Juan');
  readonly lastName = signal('Pérez');
  readonly email = signal('juan.perez@email.com');
  readonly phone = signal('77218934');
  readonly shirtSize = signal('M');
  readonly ticketType = signal('General');
  readonly eventTitle = signal('Electric Neon Fest 2026');
  readonly basePrice = signal(120);
  readonly remainingSpots = signal(12);

  readonly paymentMode = signal<'full' | 'installment'>('full');
  readonly installmentAmount = signal(40);
  readonly paymentMethod = signal<PaymentMethod>('cash');

  readonly cashReceived = signal<number>(150);
  readonly organizerName = signal('Ana Quispe');

  readonly cashChange = computed(() => {
    const toPay =
      this.paymentMode() === 'full'
        ? this.basePrice()
        : Number(this.installmentAmount()) || 0;
    const received = Number(this.cashReceived()) || 0;
    return Math.max(0, received - toPay);
  });

  readonly voucherPreview = signal<string | null>(null);

  readonly registeredAttendee = signal<Attendee | null>(null);

  readonly formError = signal<string | null>(null);

  goToStep2(): void {
    if (!this.firstName().trim() || !this.lastName().trim()) {
      this.formError.set('Por favor ingresa los nombres y apellidos');
      return;
    }
    if (!this.email().trim()) {
      this.formError.set('Por favor ingresa el email para el enlace personal');
      return;
    }
    this.formError.set(null);
    this.currentStep.set(2);
  }

  goToStep1(): void {
    this.currentStep.set(1);
  }

  confirmPayment(): void {
    const fullName = `${this.firstName().trim()} ${this.lastName().trim()}`;
    const total = Number(this.basePrice()) || 120;
    const amountToPay =
      this.paymentMode() === 'full'
        ? total
        : Number(this.installmentAmount()) || 0;

    if (this.paymentMethod() === 'cash' && Number(this.cashReceived()) < amountToPay) {
      this.formError.set('El efectivo recibido debe ser igual o mayor al total a cobrar');
      return;
    }
    this.formError.set(null);

    const created = this.store.registerAttendee({
      eventId: 'electric-neon-fest-2026',
      fullName,
      email: this.email().trim(),
      ci: this.phone(),
      phone: this.phone().trim(),
      ticketType: this.ticketType(),
      shirtSize: this.shirtSize(),
      registeredBy: this.organizerName(),
      totalPrice: total,
      initialPayment:
        amountToPay > 0
          ? {
              amount: amountToPay,
              method: this.paymentMethod(),
              voucherUrl: this.voucherPreview() || undefined,
              note:
                this.paymentMode() === 'full'
                  ? 'Cobro presencial total'
                  : 'Cobro presencial cuota inicial',
            }
          : undefined,
    });

    this.registeredAttendee.set(created);
    this.currentStep.set(3);
  }

  startNewRegistration(): void {
    this.firstName.set('');
    this.lastName.set('');
    this.email.set('');
    this.phone.set('');
    this.shirtSize.set('M');
    this.voucherPreview.set(null);
    this.paymentMode.set('full');
    this.cashReceived.set(120);
    this.registeredAttendee.set(null);
    this.currentStep.set(1);
  }

  readonly searchQuery = signal('');
  readonly selectedAttendeeForPayment = signal<Attendee | null>(null);
  readonly newInstallmentAmount = signal(40);
  readonly newInstallmentMethod = signal<PaymentMethod>('cash');
  readonly newInstallmentVoucher = signal<string | null>(null);
  readonly viewingVoucherUrl = signal<string | null>(null);

  readonly attendeesWithDebt = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.store
      .attendees()
      .filter((a) => {
        const remaining = this.store.getAttendeeRemainingDebt(a);
        const matchesQuery =
          !query ||
          a.fullName.toLowerCase().includes(query) ||
          a.code?.toLowerCase().includes(query) ||
          a.ci.toLowerCase().includes(query) ||
          a.phone.includes(query);
        return remaining > 0 && matchesQuery;
      });
  });

  onFileSelected(event: Event, target: 'initial' | 'installment'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (target === 'initial') {
          this.voucherPreview.set(base64);
        } else {
          this.newInstallmentVoucher.set(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeVoucher(target: 'initial' | 'installment'): void {
    if (target === 'initial') {
      this.voucherPreview.set(null);
    } else {
      this.newInstallmentVoucher.set(null);
    }
  }

  openInstallmentModal(attendee: Attendee): void {
    this.selectedAttendeeForPayment.set(attendee);
    const debt = this.store.getAttendeeRemainingDebt(attendee);
    this.newInstallmentAmount.set(debt);
    this.newInstallmentMethod.set('cash');
    this.newInstallmentVoucher.set(null);
  }

  closeInstallmentModal(): void {
    this.selectedAttendeeForPayment.set(null);
  }

  submitInstallment(): void {
    const attendee = this.selectedAttendeeForPayment();
    if (!attendee) return;

    const amount = Number(this.newInstallmentAmount()) || 0;
    if (amount <= 0) return;

    this.store.addInstallment(attendee.id, {
      amount,
      method: this.newInstallmentMethod(),
      voucherUrl: this.newInstallmentVoucher() || undefined,
      note: 'Cobro de cuota presencial',
    });

    this.closeInstallmentModal();
  }

  openVoucherModal(url: string): void {
    this.viewingVoucherUrl.set(url);
  }

  closeVoucherModal(): void {
    this.viewingVoucherUrl.set(null);
  }
}
