import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideCalendar,
  LucideCreditCard,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMenu,
  LucideMoon,
  LucidePlus,
  LucideShield,
  LucideSun,
  LucideUsers,
  LucideZap,
} from '@lucide/angular';
import { AuthStore } from '../features/auth/services/auth.store';
import { RealtimeSyncService } from '../core/services/realtime-sync.service';
import { EventsStore } from '../features/organizer/services/events.store';
import { FeatureFlagService } from '../core/config/feature-flag.service';

@Component({
  selector: 'app-organizer-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideZap,
    LucideUsers,
    LucideCreditCard,
    LucideCalendar,
    LucideShield,
    LucidePlus,
    LucideMenu,
    LucideSun,
    LucideMoon,
    LucideLogOut,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organizer-shell.component.html',
  styleUrl: './organizer-shell.component.css',
})
export class OrganizerShellComponent {
  readonly authStore = inject(AuthStore);
  readonly syncService = inject(RealtimeSyncService);
  readonly eventsStore = inject(EventsStore);
  readonly featureFlags = inject(FeatureFlagService);
  readonly router = inject(Router);

  readonly isDrawerOpen = signal(false);

  readonly isDark = signal<boolean>(
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false,
  );

  readonly activeEventId = signal('ev-identikids-2026');
  readonly activeEventTitle = signal('Camp Kids 2026');

  toggleDrawer(): void {
    this.isDrawerOpen.update((v) => !v);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  toggleTheme(): void {
    if (typeof document === 'undefined') return;
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    if (isCurrentlyDark) {
      document.documentElement.classList.remove('dark');
      this.isDark.set(false);
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      this.isDark.set(true);
      localStorage.setItem('theme', 'dark');
    }
  }
}
