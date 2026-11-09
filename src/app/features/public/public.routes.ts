import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-explore-events-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@public.explore.title" class="text-2xl font-bold">Explorar eventos</h1>
    </main>
  `,
})
export class ExploreEventsPage {}

@Component({
  selector: 'app-event-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@public.eventDetail.title" class="text-2xl font-bold">Detalle del evento</h1>
      <p class="mt-2">{{ slug() }}</p>
    </main>
  `,
})
export class EventDetailPage {
  readonly slug = input<string>('');
}

@Component({
  selector: 'app-event-registration-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@public.registration.title" class="text-2xl font-bold">
        Formulario de inscripción
      </h1>
    </main>
  `,
})
export class EventRegistrationPage {}

@Component({
  selector: 'app-event-registration-done-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@public.registrationDone.title" class="text-2xl font-bold">
        Inscripción enviada
      </h1>
    </main>
  `,
})
export class EventRegistrationDonePage {}

@Component({
  selector: 'app-terms-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@public.terms.title" class="text-2xl font-bold">Términos y condiciones</h1>
    </main>
  `,
})
export class TermsPage {}

@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@public.privacy.title" class="text-2xl font-bold">Política de privacidad</h1>
    </main>
  `,
})
export class PrivacyPage {}

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@public.notFound.title" class="text-2xl font-bold">Página no encontrada</h1>
    </main>
  `,
})
export class NotFoundPage {}

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ExploreEventsPage,
  },
  {
    path: 'e/:slug',
    component: EventDetailPage,
  },
  {
    path: 'e/:slug/inscripcion',
    component: EventRegistrationPage,
  },
  {
    path: 'e/:slug/inscripcion/listo',
    component: EventRegistrationDonePage,
  },
  {
    path: 'legal/terminos',
    component: TermsPage,
  },
  {
    path: 'legal/privacidad',
    component: PrivacyPage,
  },
];
