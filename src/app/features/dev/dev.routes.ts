import { Routes } from '@angular/router';

/** Development-only pages. They are not reachable in production builds (see app.routes.ts). */
export const DEV_ROUTES: Routes = [
  {
    path: 'tokens',
    loadComponent: () => import('./pages/tokens-page').then((m) => m.TokensPage),
  },
];
