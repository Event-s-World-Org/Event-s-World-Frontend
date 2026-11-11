import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'panel',
    loadChildren: () =>
      import('./features/organizer/organizer.routes').then(
        (m) => m.ORGANIZER_ROUTES,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/participant/participant.routes').then(
        (m) => m.PARTICIPANT_ROUTES,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/public/public.routes').then((m) => m.NotFoundPage),
  },
];
