import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { OrganizerShellComponent } from '../../layouts/organizer-shell.component';
import { EventDashboardPage } from './pages/event-dashboard.page';
import { EventWizardPage } from './pages/event-wizard.page';
import { InPersonRegistrationPage } from './pages/in-person-registration.page';
import { MyEventsPage } from './pages/my-events.page';
import { ParticipantsPage } from './pages/participants.page';

export {
  EventDashboardPage,
  EventWizardPage,
  InPersonRegistrationPage,
  MyEventsPage,
  ParticipantsPage,
};

export const ORGANIZER_ROUTES: Routes = [
  {
    path: '',
    component: OrganizerShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'eventos',
        pathMatch: 'full',
      },
      {
        path: 'eventos',
        component: MyEventsPage,
      },
      {
        path: 'eventos/nuevo',
        component: EventWizardPage,
      },
      {
        path: 'eventos/:id/editar',
        component: EventWizardPage,
      },
      {
        path: 'eventos/:id',
        component: EventDashboardPage,
      },
      {
        path: 'eventos/:id/participantes',
        component: ParticipantsPage,
      },
      {
        path: 'eventos/:id/pagos',
        component: ParticipantsPage,
      },
      {
        path: 'eventos/:id/presencial',
        component: InPersonRegistrationPage,
      },
      {
        path: 'eventos/:id/configuracion',
        component: EventWizardPage,
      },
    ],
  },
];
