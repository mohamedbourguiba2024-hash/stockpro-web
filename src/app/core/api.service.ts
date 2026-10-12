import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category, Movement, MovementRequest, MovementType, Page, Product, ProductRequest, Supplier } from './models';
export interface MovementQuery {
  productId?: number | null;
  type?: MovementType | null;
  from?: string;
  to?: string;
  page: number;
  size: number;
}
export interface ProductQuery {
  q?: string;
  categoryId?: number | null;
  lowStock?: boolean;
  page: number;
  size: number;
  sort: string;
  dir: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl + '/api';

  products(query: ProductQuery) {
    let params = new HttpParams()
      .set('page', query.page).set('size', query.size)
      .set('sort', query.sort).set('dir', query.dir);
    if (query.q) params = params.set('q', query.q);
    if (query.categoryId) params = params.set('categoryId', query.categoryId);
    if (query.lowStock) params = params.set('lowStock', true);
    return this.http.get<Page<Product>>(`${this.base}/products`, { params });
  }

  createProduct(body: ProductRequest) {
    return this.http.post<Product>(`${this.base}/products`, body);
  }

  updateProduct(id: number, body: ProductRequest) {
    return this.http.put<Product>(`${this.base}/products/${id}`, body);
  }

  deleteProduct(id: number) {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }

  exportProducts() {
    return this.http.get(`${this.base}/products/export`, { responseType: 'blob' });
  }

  categories() { return this.http.get<Category[]>(`${this.base}/categories`); }
  suppliers() { return this.http.get<Supplier[]>(`${this.base}/suppliers`); }
  movements(q: MovementQuery) {
    let params = new HttpParams().set('page', q.page).set('size', q.size);
    if (q.productId) params = params.set('productId', q.productId);
    if (q.type) params = params.set('type', q.type);
    if (q.from) params = params.set('from', q.from);
    if (q.to) params = params.set('to', q.to);
    return this.http.get<Page<Movement>>(`${this.base}/movements`, { params });
  }

  createMovement(body: MovementRequest) {
    return this.http.post<Movement>(`${this.base}/movements`, body);
  }

  productOptions() {
    return this.products({ page: 0, size: 100, sort: 'nom', dir: 'asc' });
  }
}
