import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = '/api';

export interface Summary {
  total_revenue: number;
  total_transactions: number;
  total_units_sold: number;
  avg_order_value: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  transactions: number;
  units: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  transactions: number;
}

export interface RevenueOverTimeResponse {
  data: MonthlyRevenue[];
  trend: {
    slope: number;
    intercept: number;
    trend_line: number[];
    forecast: number[];
  } | null;
}

export interface TopProduct {
  product_id: number;
  product: string;
  category: string;
  revenue: number;
  units: number;
  transactions: number;
}

export interface RegionRevenue {
  region: string;
  revenue: number;
  transactions: number;
  units: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${API}/analytics/summary/`);
  }

  getRevenueByCategory(): Observable<CategoryRevenue[]> {
    return this.http.get<CategoryRevenue[]>(`${API}/analytics/revenue-by-category/`);
  }

  getRevenueOverTime(): Observable<RevenueOverTimeResponse> {
    return this.http.get<RevenueOverTimeResponse>(`${API}/analytics/revenue-over-time/`);
  }

  getTopProducts(limit = 10): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${API}/analytics/top-products/?limit=${limit}`);
  }

  getRevenueByRegion(): Observable<RegionRevenue[]> {
    return this.http.get<RegionRevenue[]>(`${API}/analytics/revenue-by-region/`);
  }
}
