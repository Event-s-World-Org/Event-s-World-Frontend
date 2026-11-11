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
  LucideArrowLeft,
  LucideBanknote,
  LucideDownload,
  LucideFileSpreadsheet,
  LucideMoon,
  LucidePlus,
  LucideQrCode,
  LucideSearch,
  LucideSun,
  LucideX,
} from '@lucide/angular';
import { exportAttendeesToExcel } from '../../../core/utils/excel-export.util';
import {
  Attendee,
  InPersonStore,
  PaymentMethod,
} from '../services/in-person.store';

@Component({
  selector: 'app-participants-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideArrowLeft,
    LucidePlus,
    LucideSun,
    LucideMoon,
    LucideSearch,
    LucideBanknote,
    LucideQrCode,
    LucideX,
    LucideDownload,
    LucideFileSpreadsheet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './participants.page.html',
  styleUrl: './participants.page.css',
})
export class ParticipantsPage {
  readonly store = inject(InPersonStore);

  readonly eventTitle = signal('Electric Neon Fest 2026');

  exportToExcel(): void {
    exportAttendeesToExcel(this.filteredAttendees(), this.eventTitle());
  }

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

  readonly searchQuery = signal('');
  readonly selectedFilter = signal<'all' | 'paid' | 'installments'>('all');

  readonly selectedAttendeeForPayment = signal<Attendee | null>(null);
  readonly newInstallmentAmount = signal(50);
  readonly newInstallmentMethod = signal<PaymentMethod>('cash');
  readonly newInstallmentVoucher = signal<string | null>(null);
  readonly newInstallmentNote = signal('');

  readonly viewingVoucherUrl = signal<string | null>(null);

  readonly filteredAttendees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.selectedFilter();

    return this.store.attendees().filter((a) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'paid'
            ? a.status === 'paid'
            : a.status === 'installments';

      const matchesQuery =
        !query ||
        a.fullName.toLowerCase().includes(query) ||
        (a.code && a.code.toLowerCase().includes(query)) ||
        (a.email && a.email.toLowerCase().includes(query)) ||
        a.ci.toLowerCase().includes(query) ||
        a.phone.includes(query);

      return matchesFilter && matchesQuery;
    });
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.newInstallmentVoucher.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeVoucher(): void {
    this.newInstallmentVoucher.set(null);
  }

  openInstallmentModal(attendee: Attendee): void {
    this.selectedAttendeeForPayment.set(attendee);
    const debt = this.store.getAttendeeRemainingDebt(attendee);
    this.newInstallmentAmount.set(debt);
    this.newInstallmentMethod.set('cash');
    this.newInstallmentVoucher.set(null);
    this.newInstallmentNote.set('');
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
      note: this.newInstallmentNote().trim() || 'Cobro de cuota presencial',
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
