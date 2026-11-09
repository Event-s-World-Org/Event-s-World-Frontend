import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-recover-link-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@participant.recover.title" class="text-2xl font-bold">
        Recuperar enlace de inscripción
      </h1>
    </main>
  `,
})
export class RecoverLinkPage {}

@Component({
  selector: 'app-my-registration-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@participant.myRegistration.title" class="text-2xl font-bold">Mi inscripción</h1>
    </main>
  `,
})
export class MyRegistrationPage {}

@Component({
  selector: 'app-my-registrations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@participant.myRegistrations.title" class="text-2xl font-bold">
        Mis inscripciones
      </h1>
    </main>
  `,
})
export class MyRegistrationsPage {}

export const PARTICIPANT_ROUTES: Routes = [
  {
    path: 'mi-inscripcion/recuperar',
    component: RecoverLinkPage,
  },
  {
    path: 'mi-inscripcion/:token',
    component: MyRegistrationPage,
  },
  {
    path: 'mis-inscripciones',
    component: MyRegistrationsPage,
  },
];
