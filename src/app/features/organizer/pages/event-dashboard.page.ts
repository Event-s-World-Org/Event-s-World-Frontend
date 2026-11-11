import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideBanknote,
  LucideCheck,
  LucideCopy,
  LucideDownload,
  LucideFileSpreadsheet,
  LucideMoon,
  LucidePlus,
  LucideQrCode,
  LucideSun,
  LucideUsers,
  LucideZap,
} from '@lucide/angular';
import { exportAttendeesToExcel } from '../../../core/utils/excel-export.util';
import { InPersonStore } from '../services/in-person.store';

@Component({
  selector: 'app-event-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideArrowLeft,
    LucidePlus,
    LucideSun,
    LucideMoon,
    LucideBanknote,
    LucideQrCode,
    LucideUsers,
    LucideArrowRight,
    LucideCopy,
    LucideCheck,
    LucideZap,
    LucideDownload,
    LucideFileSpreadsheet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-dashboard.page.html',
  styleUrl: './event-dashboard.page.css',
})
export class EventDashboardPage {
  readonly store = inject(InPersonStore);

  readonly eventTitle = signal('Electric Neon Fest 2026');
  readonly eventStatus = signal('Publicado');
  readonly publicUrl = signal('eventsworld.app/e/electric-neon-fest-2026');
  readonly capacityMax = signal(500);
  readonly copied = signal(false);

  exportToExcel(): void {
    exportAttendeesToExcel(this.store.attendees(), this.eventTitle());
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

  copyLink(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(this.publicUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  readonly totalExpectedRevenue = () => {
    return this.store.totalCollected() + this.store.pendingBalance();
  };
}
