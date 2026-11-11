import { Routes } from '@angular/router';
import { provideIcons } from '../../shared/ui/icons';

/** Development-only pages. They are not reachable in production builds (see app.routes.ts). */
export const DEV_ROUTES: Routes = [
  {
    path: '',
    providers: [provideIcons()],
    children: [
      {
        path: 'tokens',
        loadComponent: () => import('./pages/tokens-page').then((m) => m.TokensPage),
      },
      {
        path: 'ui',
        loadComponent: () => import('./pages/ui-page').then((m) => m.UiPage),
      },
    ],
  },
];
