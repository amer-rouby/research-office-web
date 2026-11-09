import { Injectable, computed, signal } from '@angular/core';
import type { TokenResponse, UserResponse } from '@core/api/api-types';

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: UserResponse;
}

const STORAGE_KEY = 'ro.session';

function readStored(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

/** The signed-in staff member's tokens and profile. Client tracking links never use it. */
@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly state = signal<AuthSession | null>(readStored());

  readonly session = this.state.asReadonly();
  readonly token = computed(() => this.state()?.accessToken ?? null);
  readonly refreshToken = computed(() => this.state()?.refreshToken ?? null);
  readonly user = computed(() => this.state()?.user ?? null);
  readonly isAuthenticated = computed(() => this.state() !== null);

  constructor() {
    // Keep every open tab on the same session: refresh tokens rotate, so a tab holding an old one
    // would otherwise be signed out when it next refreshes.
    try {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) this.state.set(readStored());
      });
    } catch {
      // no window (tests/SSR): single-tab behaviour
    }
  }

  set(response: TokenResponse): void {
    this.write({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    });
  }

  clear(): void {
    this.write(null);
  }

  private write(session: AuthSession | null): void {
    this.state.set(session);
    try {
      if (session === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }
    } catch {
      // Storage unavailable (private mode / blocked): keep the in-memory session only.
    }
  }
}
