import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { API_URL } from '@core/api/api-url';
import type { OfficeInfo } from '@core/api/api-types';

/** Office name and contact channels, loaded once from the backend (set by environment variables). */
@Injectable({ providedIn: 'root' })
export class OfficeStore {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  private readonly state = signal<OfficeInfo | null>(null);
  private requested = false;

  readonly info = this.state.asReadonly();
  readonly hasWhatsapp = computed(() => !!this.state()?.whatsapp);

  load(): void {
    if (this.requested) return;
    this.requested = true;
    this.http.get<OfficeInfo>(`${this.api}/public/office`).subscribe({
      next: (info) => this.state.set(info),
      error: () => (this.requested = false),
    });
  }

  /** wa.me link with a prefilled message, or null when no WhatsApp number is configured. */
  whatsappLink(text: string): string | null {
    const number = this.state()?.whatsapp;
    return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
  }
}
