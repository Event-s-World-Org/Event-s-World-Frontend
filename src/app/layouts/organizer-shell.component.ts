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
  template: `
    <div class="min-h-screen text-text font-sans flex flex-col lg:flex-row">
      
      <!-- ========================================================
           PANEL DESPLEGABLE / SIDEBAR AL LADO IZQUIERDO
           (Fiel a ORG-01..06 de wireframes.excalidraw con Lucide Icons)
           ======================================================== -->

      <!-- Backdrop oscuro para móvil cuando el drawer está abierto -->
      @if (isDrawerOpen()) {
        <button 
          type="button"
          aria-label="Cerrar menú lateral"
          (click)="closeDrawer()" 
          (keydown.escape)="closeDrawer()"
          class="fixed inset-0 z-40 w-full h-full bg-black/60 backdrop-blur-sm lg:hidden transition-opacity cursor-pointer border-0 p-0 m-0 text-left">
        </button>
      }

      <!-- Contenedor del Drawer lateral izquierdo -->
      <aside 
        [class.-translate-x-full]="!isDrawerOpen()"
        [class.translate-x-0]="isDrawerOpen()"
        class="fixed inset-y-0 left-0 z-50 w-72 glass-overlay lg:glass border-r border-white/20 dark:border-white/10 p-4 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-64 lg:min-h-screen lg:z-10 shadow-2xl lg:shadow-none">
        
        <div class="space-y-4">
          <!-- Cabecera de Marca -->
          <div class="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <span class="text-base font-extrabold tracking-tight text-text flex items-center gap-1.5">
                <span class="w-6 h-6 rounded-lg bg-primary text-on-primary flex items-center justify-center text-xs font-black shadow-sm">EW</span>
                Event's World
              </span>
              <span class="text-[10px] uppercase font-bold text-primary tracking-widest block pl-7">ORGANIZADOR</span>
            </div>

            <!-- Botón cerrar solo en móvil -->
            <button 
              type="button" 
              (click)="closeDrawer()" 
              aria-label="Cerrar menú"
              class="p-1.5 rounded-lg text-muted hover:text-text lg:hidden cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Botón de Acción Rápida: + Crear Evento (ORG-01) -->
          <a 
            routerLink="/panel/eventos/nuevo" 
            (click)="closeDrawer()"
            class="w-full bg-primary hover:bg-primary-hover active:scale-[0.98] text-on-primary font-bold py-2.5 px-3.5 rounded-xl shadow-[0_6px_18px_rgba(11,99,182,0.35)] flex items-center justify-center gap-2 text-xs transition-all cursor-pointer">
            <svg lucidePlus class="w-4 h-4"></svg>
            <span>Crear nuevo evento</span>
          </a>

          <!-- Selector de Evento Activo -->
          <div class="glass p-2.5 rounded-xl border border-border/40 space-y-1">
            <span class="text-[10px] uppercase font-bold text-muted block">Evento activo</span>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-text truncate">
                {{ activeEventTitle() }}
              </span>
              <span class="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                ●
              </span>
            </div>
          </div>

          <!-- Lista de Navegación Lateral con Lucide Icons -->
          <nav class="space-y-1 text-xs font-semibold">
            <a 
              [routerLink]="['/panel/eventos', activeEventId()]" 
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-primary text-on-primary shadow-sm"
              (click)="closeDrawer()"
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface/40 transition-all text-text">
              <svg lucideLayoutDashboard class="w-4 h-4"></svg>
              <span>Dashboard del evento</span>
            </a>

            <a 
              [routerLink]="['/panel/eventos', activeEventId(), 'presencial']" 
              routerLinkActive="bg-primary text-on-primary shadow-sm"
              (click)="closeDrawer()"
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface/40 transition-all text-text">
              <svg lucideZap class="w-4 h-4"></svg>
              <span>Inscripción presencial</span>
            </a>

            <a 
              [routerLink]="['/panel/eventos', activeEventId(), 'participantes']" 
              routerLinkActive="bg-primary text-on-primary shadow-sm"
              (click)="closeDrawer()"
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface/40 transition-all text-text">
              <svg lucideUsers class="w-4 h-4"></svg>
              <span>Participantes</span>
            </a>

            @if (featureFlags.canReviewPayments()) {
              <a 
                [routerLink]="['/panel/eventos', activeEventId(), 'pagos']" 
                routerLinkActive="bg-primary text-on-primary shadow-sm"
                (click)="closeDrawer()"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface/40 transition-all text-text">
                <svg lucideCreditCard class="w-4 h-4"></svg>
                <span>Revisión de pagos</span>
              </a>
            }

            <a 
              routerLink="/panel/eventos" 
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-primary text-on-primary shadow-sm"
              (click)="closeDrawer()"
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface/40 transition-all text-text">
              <svg lucideCalendar class="w-4 h-4"></svg>
              <span>Mis eventos (ORG-01)</span>
            </a>

            <div class="pt-2 border-t border-border/30">
              <span class="px-3 text-[10px] uppercase font-bold text-muted block mb-1">Próximamente</span>
              <span class="flex items-center gap-2.5 px-3 py-2 text-muted opacity-60 cursor-not-allowed">
                <svg lucideShield class="w-4 h-4"></svg>
                <span>Equipos (Splitter)</span>
              </span>
            </div>
          </nav>
        </div>

        <!-- Pie de navegación / Perfil -->
        <div class="pt-3 border-t border-border/40 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-bold text-xs">
                {{ authStore.currentUser()?.avatarInitials || 'SC' }}
              </div>
              <div>
                <span class="text-xs font-bold text-text block leading-tight">
                  {{ authStore.displayName() }}
                </span>
                <span class="text-[10px] text-muted block">Organizadora</span>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <!-- Botón cambio tema -->
              <button 
                type="button" 
                (click)="toggleTheme()" 
                aria-label="Cambiar tema día/noche"
                class="p-2 rounded-xl glass border border-border/40 text-text hover:text-primary transition-all cursor-pointer flex items-center justify-center">
                @if (isDark()) {
                  <svg lucideSun class="w-4 h-4 text-amber-400"></svg>
                } @else {
                  <svg lucideMoon class="w-4 h-4 text-primary"></svg>
                }
              </button>

              <!-- Botón cerrar sesión -->
              <button 
                type="button" 
                (click)="authStore.logout()" 
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                class="p-2 rounded-xl glass border border-border/40 text-muted hover:text-rose-500 transition-all cursor-pointer flex items-center justify-center">
                <svg lucideLogOut class="w-4 h-4"></svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- ========================================================
           CONTENIDO CENTRAL (BARRA SUPERIOR + ROUTER-OUTLET)
           ======================================================== -->
      <div class="flex-1 flex flex-col min-w-0">
        
        <!-- Top bar global para desplegar el drawer en móvil -->
        <header class="sticky top-0 z-30 glass border-b border-white/20 dark:border-white/10 px-4 py-2.5 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <!-- Botón Hamburguesa para desplegar panel izquierdo en móvil -->
            <button 
              type="button" 
              (click)="toggleDrawer()"
              aria-label="Abrir menú de navegación lateral"
              class="p-2 -ml-2 rounded-xl glass border border-border/40 hover:text-primary transition-all cursor-pointer flex items-center justify-center text-text">
              <svg lucideMenu class="w-5 h-5"></svg>
            </button>

            <span class="text-xs font-extrabold tracking-tight text-text">
              Panel del Organizador
            </span>

            @if (syncService.status() === 'connected') {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>En vivo</span>
              </span>
            } @else {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-muted">
                <span>Local</span>
              </span>
            }
          </div>

          <div class="flex items-center gap-2">
            <!-- Botón directo Crear Evento -->
            <a 
              routerLink="/panel/eventos/nuevo" 
              class="text-xs font-bold bg-primary hover:bg-primary-hover text-on-primary px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5">
              <svg lucidePlus class="w-3.5 h-3.5"></svg>
              <span class="hidden sm:inline">Crear evento</span>
            </a>

            <!-- Toggle tema en barra -->
            <button 
              type="button" 
              (click)="toggleTheme()" 
              aria-label="Cambiar tema día/noche"
              class="p-2 rounded-xl glass border border-border/40 text-text hover:text-primary transition-all cursor-pointer flex items-center justify-center">
              @if (isDark()) {
                <svg lucideSun class="w-4 h-4 text-amber-400"></svg>
              } @else {
                <svg lucideMoon class="w-4 h-4 text-primary"></svg>
              }
            </button>
          </div>
        </header>

        <!-- Outlet de la página hija -->
        <main class="flex-1">
          <router-outlet />
        </main>
      </div>

    </div>
  `,
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

  readonly activeEventTitle = () => {
    return this.eventsStore.activeEvent()?.title || 'Electric Neon Fest 2026';
  };

  readonly activeEventId = () => {
    return this.eventsStore.activeEvent()?.id || 'demo';
  };

  toggleDrawer(): void {
    this.isDrawerOpen.update((v) => !v);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

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
}
