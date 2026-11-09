import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@core/api/api-url';
import type {
  FileKind,
  FileView,
  NoteRequest,
  OrderDetail,
  OrderPage,
  OrderStats,
  OrderStatus,
  PaymentRequest,
  QuoteRequest,
  StatusChangeRequest,
} from '@core/api/api-types';
import { FileDownload } from '@core/files/file-download.service';
import { filesForm } from '@core/files/save-blob';

export interface OrderQuery {
  readonly status?: OrderStatus | null;
  readonly q?: string;
  readonly page?: number;
  readonly size?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminOrdersApi {
  private readonly http = inject(HttpClient);
  private readonly downloads = inject(FileDownload);
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

  assign(id: string, expertId: string) {
    return this.http.post<OrderDetail>(`${this.base}/${id}/assign`, { expertId });
  }

  addPayment(id: string, body: PaymentRequest) {
    return this.http.post<OrderDetail>(`${this.base}/${id}/payments`, body);
  }

  deletePayment(id: string, paymentId: string) {
    return this.http.delete<OrderDetail>(`${this.base}/${id}/payments/${paymentId}`);
  }

  upload(id: string, kind: FileKind, files: readonly File[]) {
    return this.http.post<OrderDetail>(`${this.base}/${id}/files`, filesForm(files), {
      params: { kind },
    });
  }

  /** Makes a reviewed internal file visible to the client. */
  publish(id: string, file: FileView) {
    return this.http.post<OrderDetail>(`${this.base}/${id}/files/${file.id}/publish`, null);
  }

  download(id: string, file: FileView) {
    return this.downloads.save(`${this.base}/${id}/files/${file.id}`, file.name);
  }
}
