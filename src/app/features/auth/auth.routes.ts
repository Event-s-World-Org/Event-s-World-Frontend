import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-sign-up-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@auth.signUp.title" class="text-2xl font-bold">Crear cuenta</h1>
    </main>
  `,
})
export class SignUpPage {}

@Component({
  selector: 'app-verify-email-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@auth.verifyEmail.title" class="text-2xl font-bold">Verificar correo</h1>
    </main>
  `,
})
export class VerifyEmailPage {}

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@auth.login.title" class="text-2xl font-bold">Ingresar</h1>
    </main>
  `,
})
export class LoginPage {}

@Component({
  selector: 'app-reset-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 i18n="@@auth.resetPassword.title" class="text-2xl font-bold">Recuperar contraseña</h1>
    </main>
  `,
})
export class ResetPasswordPage {}

export const AUTH_ROUTES: Routes = [
  {
    path: 'registro',
    component: SignUpPage,
  },
  {
    path: 'registro/verificar',
    component: VerifyEmailPage,
  },
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'recuperar',
    component: ResetPasswordPage,
  },
];
