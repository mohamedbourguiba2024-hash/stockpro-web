import { Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  template: `<div class="box"><canvas #canvas></canvas></div>`,
  styles: `
    :host { display: block; }
    .box { position: relative; height: 280px; }
  `
})
export class ChartComponent implements OnDestroy {
  config = input.required<ChartConfiguration>();
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  constructor() {
    effect(() => {
      const cfg = this.config();
      const el = this.canvas().nativeElement;
      this.chart?.destroy();
      this.chart = new Chart(el, {
        ...cfg,
        options: { responsive: true, maintainAspectRatio: false, ...cfg.options }
      });
    });
  }

  ngOnDestroy() { this.chart?.destroy(); }
}
