import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@core/api/api-url';
import type {
  CreateOrderRequest,
  CreatedOrder,
  FileView,
  ServiceView,
  TrackingView,
} from '@core/api/api-types';
import { filesForm } from '@core/files/save-blob';

/** Client-side calls: no login, the tracking token is the key. */
@Injectable({ providedIn: 'root' })
export class PublicOrdersApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);

  services() {
    return this.http.get<ServiceView[]>(`${this.api}/public/services`);
  }

  create(request: CreateOrderRequest) {
    return this.http.post<CreatedOrder>(`${this.api}/public/orders`, request);
  }

  track(token: string) {
    return this.http.get<TrackingView>(this.url(token));
  }

  upload(token: string, files: readonly File[]) {
    return this.http.post<FileView[]>(`${this.url(token)}/files`, filesForm(files));
  }

  acceptQuote(token: string) {
    return this.http.post<TrackingView>(`${this.url(token)}/accept-quote`, null);
  }

  requestRevision(token: string, note: string) {
    return this.http.post<TrackingView>(`${this.url(token)}/revision`, { note });
  }

  confirm(token: string) {
    return this.http.post<TrackingView>(`${this.url(token)}/confirm`, null);
  }

  /** Plain link: the browser downloads it directly (no auth header needed). */
  fileUrl(token: string, fileId: string): string {
    return `${this.url(token)}/files/${fileId}`;
  }

  private url(token: string): string {
    return `${this.api}/public/orders/${encodeURIComponent(token)}`;
  }
}
