import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'ro.accessToken';

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Holds the staff/expert access token. Client tracking links never use it. */
@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  private readonly tokenState = signal<string | null>(readStored());

  readonly token = this.tokenState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);

  set(token: string): void {
    this.tokenState.set(token);
    this.persist(token);
  }

  clear(): void {
    this.tokenState.set(null);
    this.persist(null);
  }

  private persist(token: string | null): void {
    try {
      if (token === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, token);
      }
    } catch {
      // Storage unavailable (private mode / blocked): keep the in-memory token only.
    }
  }
}
