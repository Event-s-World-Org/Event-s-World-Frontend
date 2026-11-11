import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-admin-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@admin.overview.title" class="text-2xl font-bold">Panel de administración</h1>
    </main>
  `,
})
export class AdminOverviewPage {}

@Component({
  selector: 'app-admin-events-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@admin.events.title" class="text-2xl font-bold">Gestión de eventos</h1>
    </main>
  `,
})
export class AdminEventsPage {}

@Component({
  selector: 'app-admin-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@admin.users.title" class="text-2xl font-bold">Gestión de usuarios</h1>
    </main>
  `,
})
export class AdminUsersPage {}

@Component({
  selector: 'app-admin-audit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@admin.audit.title" class="text-2xl font-bold">Auditoría</h1>
    </main>
  `,
})
export class AdminAuditPage {}

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminOverviewPage,
  },
  {
    path: 'eventos',
    component: AdminEventsPage,
  },
  {
    path: 'usuarios',
    component: AdminUsersPage,
  },
  {
    path: 'auditoria',
    component: AdminAuditPage,
  },
];
