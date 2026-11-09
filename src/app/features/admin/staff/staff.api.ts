import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@core/api/api-url';
import type { CreateStaffRequest, Role, StaffView, UpdateStaffRequest } from '@core/api/api-types';

@Injectable({ providedIn: 'root' })
export class StaffApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_URL)}/admin/staff`;

  list(role?: Role) {
    return this.http.get<StaffView[]>(this.base, { params: role ? { role } : {} });
  }

  create(body: CreateStaffRequest) {
    return this.http.post<StaffView>(this.base, body);
  }

  update(id: string, body: UpdateStaffRequest) {
    return this.http.put<StaffView>(`${this.base}/${id}`, body);
  }

  resetPassword(id: string, password: string) {
    return this.http.post<void>(`${this.base}/${id}/password`, { password });
  }
}
