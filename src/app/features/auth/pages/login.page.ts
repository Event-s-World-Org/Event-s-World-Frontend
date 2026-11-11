import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAlertCircle,
  LucideEye,
  LucideEyeOff,
  LucideLock,
  LucideLogIn,
  LucideSparkles,
  LucideUser,
} from '@lucide/angular';
import { AuthStore } from '../services/auth.store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideUser,
    LucideLock,
    LucideLogIn,
    LucideEye,
    LucideEyeOff,
    LucideAlertCircle,
    LucideSparkles,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
})
export class LoginPage {
  readonly authStore = inject(AuthStore);
  readonly router = inject(Router);

  readonly username = signal('Shadith');
  readonly password = signal('Santiago1:8');
  readonly showPassword = signal(false);
  readonly rememberMe = signal(true);
  readonly errorMessage = signal<string | null>(null);

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  fillShadithCredentials(): void {
    this.username.set('Shadith');
    this.password.set('Santiago1:8');
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    const result = this.authStore.login(this.username(), this.password());
    if (result.success) {
      void this.router.navigate(['/panel/eventos']);
    } else {
      this.errorMessage.set(result.message || 'Credenciales incorrectas');
    }
  }
}
