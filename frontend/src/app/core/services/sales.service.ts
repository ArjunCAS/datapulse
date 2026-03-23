import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = '/api/sales';

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  category: number;
  category_name: string;
  price: number;
}

export interface Transaction {
  id: number;
  product: number;
  product_name: string;
  category_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  region: string;
  sale_date: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TransactionFilters {
  date_from?: string;
  date_to?: string;
  region?: string;
  product__category?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  constructor(private http: HttpClient) {}

  getTransactions(filters: TransactionFilters = {}): Observable<PaginatedResponse<Transaction>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.http.get<PaginatedResponse<Transaction>>(`${API}/transactions/`, { params });
  }

  createTransaction(data: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>(`${API}/transactions/`, data);
  }

  updateTransaction(id: number, data: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${API}/transactions/${id}/`, data);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/transactions/${id}/`);
  }

  getCategories(): Observable<PaginatedResponse<Category>> {
    return this.http.get<PaginatedResponse<Category>>(`${API}/categories/?page_size=100`);
  }

  getProducts(categoryId?: number): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams().set('page_size', '100');
    if (categoryId) params = params.set('category', String(categoryId));
    return this.http.get<PaginatedResponse<Product>>(`${API}/products/`, { params });
  }
}
