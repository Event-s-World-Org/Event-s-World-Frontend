import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-my-events-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@organizer.myEvents.title" class="text-2xl font-bold">Mis eventos</h1>
    </main>
  `,
})
export class MyEventsPage {}

@Component({
  selector: 'app-event-wizard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@organizer.eventWizard.title" class="text-2xl font-bold">Configurar evento</h1>
    </main>
  `,
})
export class EventWizardPage {}

@Component({
  selector: 'app-event-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@organizer.dashboard.title" class="text-2xl font-bold">Panel del evento</h1>
    </main>
  `,
})
export class EventDashboardPage {}

@Component({
  selector: 'app-participants-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@organizer.participants.title" class="text-2xl font-bold">Participantes</h1>
    </main>
  `,
})
export class ParticipantsPage {}

@Component({
  selector: 'app-participant-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@organizer.participantDetail.title" class="text-2xl font-bold">
        Detalle de participante
      </h1>
    </main>
  `,
})
export class ParticipantDetailPage {}

@Component({
  selector: 'app-payment-review-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@organizer.payments.title" class="text-2xl font-bold">Revisión de pagos</h1>
    </main>
  `,
})
export class PaymentReviewPage {}

@Component({
  selector: 'app-in-person-registration-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@organizer.inPerson.title" class="text-2xl font-bold">Inscripción presencial</h1>
    </main>
  `,
})
export class InPersonRegistrationPage {}

@Component({
  selector: 'app-event-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@organizer.settings.title" class="text-2xl font-bold">
        Configuración del evento
      </h1>
    </main>
  `,
})
export class EventSettingsPage {}

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@organizer.profile.title" class="text-2xl font-bold">Mi perfil</h1>
    </main>
  `,
})
export class ProfilePage {}

export const ORGANIZER_ROUTES: Routes = [
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
    path: 'eventos/:id/participantes/:pid',
    component: ParticipantDetailPage,
  },
  {
    path: 'eventos/:id/pagos',
    component: PaymentReviewPage,
  },
  {
    path: 'eventos/:id/presencial',
    component: InPersonRegistrationPage,
  },
  {
    path: 'eventos/:id/configuracion',
    component: EventSettingsPage,
  },
  {
    path: 'perfil',
    component: ProfilePage,
  },
];
