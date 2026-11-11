import { Routes } from '@angular/router';
import { LoginPage } from './pages/login.page';

export { LoginPage };

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginPage,
  },
];
