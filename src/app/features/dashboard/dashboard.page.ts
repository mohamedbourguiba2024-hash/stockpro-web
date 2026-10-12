import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChartConfiguration } from 'chart.js';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { DashboardStats, Product } from '../../core/models';
import { ChartComponent } from '../../shared/chart.component';

const NAVY = '#0B2A4A';
const BLUE = '#1E88C8';
const GREEN = '#1B7F4B';
const RED = '#B3261E';

@Component({
  selector: 'app-dashboard-page',
  imports: [DecimalPipe, RouterLink, MatIconModule, MatButtonModule, ChartComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage implements OnInit {
  private api = inject(ApiService);

  stats = signal<DashboardStats | null>(null);
  lowStock = signal<Product[]>([]);
  loading = signal(true);
  error = signal(false);

  movementsChart = computed<ChartConfiguration | null>(() => {
    const s = this.stats();
    if (!s) return null;
    const labels = s.mouvementsParJour.map(d => `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`);
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Entrées', data: s.mouvementsParJour.map(d => d.entrees), backgroundColor: GREEN, borderRadius: 4, maxBarThickness: 24 },
          { label: 'Sorties', data: s.mouvementsParJour.map(d => d.sorties), backgroundColor: RED, borderRadius: 4, maxBarThickness: 24 }
        ]
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    };
  });

  categoryChart = computed<ChartConfiguration | null>(() => {
    const s = this.stats();
    if (!s) return null;
    const palette = [BLUE, NAVY, '#5BB1E0', '#4A6785', '#9CC9E6', '#2C4A6B'];
    return {
      type: 'doughnut',
      data: {
        labels: s.stockParCategorie.map(c => c.categorie),
        datasets: [{
          data: s.stockParCategorie.map(c => c.quantite),
          backgroundColor: s.stockParCategorie.map((_, i) => palette[i % palette.length]),
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: { cutout: '60%', plugins: { legend: { position: 'bottom' } } }
    };
  });

  ngOnInit() {
    forkJoin({ stats: this.api.dashboard(), low: this.api.lowStock() }).subscribe({
      next: ({ stats, low }) => {
        this.stats.set(stats);
        this.lowStock.set(low);
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }
}
