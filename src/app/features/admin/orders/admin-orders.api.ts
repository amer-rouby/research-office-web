import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API_URL } from '@core/api/api-url';
import type {
  FileKind,
  FileView,
  NoteRequest,
  OrderDetail,
  OrderPage,
  OrderStats,
  OrderStatus,
  QuoteRequest,
  StatusChangeRequest,
} from '@core/api/api-types';
import { filesForm, saveBlob } from '@core/files/save-blob';

export interface OrderQuery {
  readonly status?: OrderStatus | null;
  readonly q?: string;
  readonly page?: number;
  readonly size?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminOrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_URL)}/admin/orders`;

  list(query: OrderQuery) {
    let params = new HttpParams().set('page', query.page ?? 0).set('size', query.size ?? 20);
    if (query.status) params = params.set('status', query.status);
    if (query.q?.trim()) params = params.set('q', query.q.trim());
    return this.http.get<OrderPage>(this.base, { params });
  }

  stats() {
    return this.http.get<OrderStats>(`${this.base}/stats`);
  }

  detail(id: string) {
    return this.http.get<OrderDetail>(`${this.base}/${id}`);
  }

  quote(id: string, body: QuoteRequest) {
    return this.http.post<OrderDetail>(`${this.base}/${id}/quote`, body);
  }

  changeStatus(id: string, body: StatusChangeRequest) {
    return this.http.post<OrderDetail>(`${this.base}/${id}/status`, body);
  }

  addNote(id: string, body: NoteRequest) {
    return this.http.post<OrderDetail>(`${this.base}/${id}/notes`, body);
  }

  upload(id: string, kind: FileKind, files: readonly File[]) {
    return this.http.post<OrderDetail>(`${this.base}/${id}/files`, filesForm(files), {
      params: { kind },
    });
  }

  /** Authenticated download (the token is sent by the interceptor), then saved locally. */
  download(id: string, file: FileView) {
    return this.http
      .get(`${this.base}/${id}/files/${file.id}`, { responseType: 'blob' })
      .pipe(map((blob) => saveBlob(blob, file.name)));
  }
}
