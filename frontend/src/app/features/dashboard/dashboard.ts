import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService, Summary, CategoryRevenue, TopProduct, RegionRevenue, RevenueOverTimeResponse } from '../../core/services/analytics.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DecimalPipe, RouterLink,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatTableModule, MatCardModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, AfterViewChecked {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  @ViewChild('regionChart') regionChartRef!: ElementRef;
  @ViewChild('productsChart') productsChartRef!: ElementRef;

  loading = true;
  summary: Summary | null = null;
  topProducts: TopProduct[] = [];
  tableColumns = ['rank', 'product', 'category', 'revenue', 'units', 'transactions'];

  private categoryData: CategoryRevenue[] = [];
  private trendData: RevenueOverTimeResponse | null = null;
  private regionData: RegionRevenue[] = [];
  private chartsBuilt = false;

  constructor(public auth: AuthService, private analytics: AnalyticsService, private router: Router) {}

  ngOnInit(): void {
    forkJoin({
      summary: this.analytics.getSummary(),
      categories: this.analytics.getRevenueByCategory(),
      trend: this.analytics.getRevenueOverTime(),
      products: this.analytics.getTopProducts(),
      regions: this.analytics.getRevenueByRegion(),
    }).subscribe({
      next: ({ summary, categories, trend, products, regions }) => {
        this.summary = summary;
        this.categoryData = categories;
        this.trendData = trend;
        this.topProducts = products;
        this.regionData = regions;
        this.loading = false;
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  ngAfterViewChecked(): void {
    if (!this.loading && this.categoryChartRef && !this.chartsBuilt) {
      this.chartsBuilt = true;
      setTimeout(() => this.buildCharts(), 0);
    }
  }

  private buildCharts(): void {
    this.buildCategoryChart();
    this.buildTrendChart();
    this.buildRegionChart();
    this.buildProductsChart();
  }

  private buildCategoryChart(): void {
    const colors = ['#3f51b5', '#00bcd4', '#4caf50', '#ff9800', '#e91e63'];
    new Chart(this.categoryChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.categoryData.map(d => d.category),
        datasets: [{ data: this.categoryData.map(d => d.revenue), backgroundColor: colors, borderWidth: 2 }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          tooltip: { callbacks: { label: (ctx) => ` $${ctx.parsed.toLocaleString()}` } }
        }
      }
    });
  }

  private buildTrendChart(): void {
    if (!this.trendData) return;
    const labels = this.trendData.data.map(d => d.month);
    const revenues = this.trendData.data.map(d => d.revenue);
    const trendLine = this.trendData.trend?.trend_line ?? [];

    new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenues,
            borderColor: '#3f51b5',
            backgroundColor: 'rgba(63,81,181,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
          },
          ...(trendLine.length ? [{
            label: 'Trend (Linear Regression)',
            data: trendLine,
            borderColor: '#e91e63',
            borderDash: [6, 3],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
          }] : [])
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: { y: { ticks: { callback: (v) => `$${Number(v).toLocaleString()}` } } }
      }
    });
  }

  private buildRegionChart(): void {
    new Chart(this.regionChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.regionData.map(d => d.region),
        datasets: [{
          label: 'Revenue',
          data: this.regionData.map(d => d.revenue),
          backgroundColor: ['#3f51b5', '#00bcd4', '#4caf50', '#ff9800', '#e91e63'],
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: (v) => `$${Number(v).toLocaleString()}` } } }
      }
    });
  }

  private buildProductsChart(): void {
    const top8 = this.topProducts.slice(0, 8);
    new Chart(this.productsChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: top8.map(p => p.product.length > 18 ? p.product.slice(0, 18) + '…' : p.product),
        datasets: [{ label: 'Revenue', data: top8.map(p => p.revenue), backgroundColor: '#3f51b5', borderRadius: 6 }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { callback: (v) => `$${Number(v).toLocaleString()}` } } }
      }
    });
  }
}
