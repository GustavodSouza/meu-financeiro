import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loginWithGoogle(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.loginWithGoogle();
      await this.router.navigateByUrl('/dashboard');
    } catch {
      this.error.set('Não foi possível entrar com o Google. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
