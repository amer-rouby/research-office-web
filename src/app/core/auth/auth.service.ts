import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, map, shareReplay, tap, throwError } from 'rxjs';
import { API_URL } from '@core/api/api-url';
import type { LoginRequest, Role, TokenResponse } from '@core/api/api-types';
import { AuthSessionStore } from './auth-session.store';

/** Home route of each staff role. */
export const ROLE_HOME: Record<Role, string> = { ADMIN: '/admin', EXPERT: '/expert' };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  private readonly session = inject(AuthSessionStore);
  private readonly router = inject(Router);

  /** One refresh at a time: parallel 401s share the same request. */
  private refreshing: Observable<string> | null = null;

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.api}/auth/login`, credentials)
      .pipe(tap((res) => this.session.set(res)));
  }

  /** Exchanges the refresh token for a new access token (rotation). */
  refresh(): Observable<string> {
    const refreshToken = this.session.refreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    this.refreshing ??= this.http
      .post<TokenResponse>(`${this.api}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) => this.session.set(res)),
        map((res) => res.accessToken),
        finalize(() => (this.refreshing = null)),
        shareReplay(1),
      );
    return this.refreshing;
  }

  logout(): void {
    const refreshToken = this.session.refreshToken();
    this.session.clear();
    void this.router.navigateByUrl('/login');
    if (refreshToken) {
      this.http.post(`${this.api}/auth/logout`, { refreshToken }).subscribe({ error: () => {} });
    }
  }

  /** Sends the user to sign in again, remembering where they were. */
  expire(returnUrl = this.router.url): void {
    this.session.clear();
    void this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }
}
