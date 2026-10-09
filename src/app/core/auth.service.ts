import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type Role = 'ADMIN' | 'MAGASINIER';

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
}

const STORAGE_KEY = 'stockpro_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private state = signal<AuthResponse | null>(this.load());

  readonly user = this.state.asReadonly();
  readonly isAdmin = computed(() => this.state()?.role === 'ADMIN');

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(tap(res => this.save(res)));
  }

  logout() {
    this.state.set(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignoré */ }
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return this.state()?.token ?? null;
  }

  isLoggedIn(): boolean {
    const token = this.token;
    if (!token) return false;
    if (this.isExpired(token)) {
      this.state.set(null);
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignoré */ }
      return false;
    }
    return true;
  }

  private save(res: AuthResponse) {
    this.state.set(res);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(res)); } catch { /* ignoré */ }
  }

  private load(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  }

  private isExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(payload));
      return typeof exp === 'number' && exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
