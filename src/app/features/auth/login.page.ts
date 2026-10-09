import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="wrapper">
      <mat-card class="card">
        <mat-card-header>
          <mat-card-title>StockPro</mat-card-title>
          <mat-card-subtitle>Connexion à votre espace</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="username" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <mat-error>Email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password" />
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <mat-error>Mot de passe obligatoire</mat-error>
              }
            </mat-form-field>

            @if (error()) {
              <p class="error">{{ error() }}</p>
            }

            <button mat-flat-button type="submit" [disabled]="form.invalid || loading()">
              {{ loading() ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
  :host { display: block; }
  .wrapper { min-height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; }
  .card { width: 100%; max-width: 400px; padding: 16px; }
  form { display: flex; flex-direction: column; gap: 8px; margin-top: 24px; }
  .error { color: #b3261e; margin: 0; }
`
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.loading.set(false);
        this.error.set(err.status === 0
          ? "Impossible de joindre le serveur"
          : err.error?.message ?? 'Erreur de connexion');
      }
    });
  }
}
