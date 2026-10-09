import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule,
    MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="brand">StockPro</div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Tableau de bord</span>
          </a>
          <a mat-list-item routerLink="/products" routerLinkActive="active">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Produits</span>
          </a>
          <!-- Les autres liens (Produits, Mouvements, etc.) seront ajoutés au fur et à mesure -->
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar>
          <span class="spacer"></span>
          <span class="user">{{ auth.user()?.email }} ({{ auth.user()?.role }})</span>
          <button mat-button (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Déconnexion
          </button>
        </mat-toolbar>
        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .container { height: 100vh; }
    .sidenav { width: 240px; }
    .brand { font-size: 1.4rem; font-weight: 500; padding: 20px 16px; }
    .spacer { flex: 1; }
    .user { margin-right: 16px; font-size: 0.9rem; }
    .content { padding: 24px; }
    .active { background: rgba(0, 0, 0, 0.06); }
    .brand { font-size: 1.4rem; font-weight: 500; padding: 20px 16px; box-sizing: border-box; }
  `
})
export class ShellComponent {
  auth = inject(AuthService);
}
