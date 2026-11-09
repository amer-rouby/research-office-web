import { DestroyRef, inject, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ApiError } from '@core/api/problem-detail';

/**
 * Loading state for one remote value: `data`, `loading`, `error`, `reload()`, `set()`.
 * The same shape on every screen, so templates always read loading/error the same way.
 */
export function createLoader<T>(fetch: () => Observable<T>) {
  const data = signal<T | undefined>(undefined);
  const loading = signal(false);
  const error = signal<string | null>(null);
  let sub: Subscription | undefined;
  inject(DestroyRef).onDestroy(() => sub?.unsubscribe());

  const reload = () => {
    sub?.unsubscribe();
    loading.set(true);
    error.set(null);
    sub = fetch().subscribe({
      next: (value) => {
        data.set(value);
        loading.set(false);
      },
      error: (e: unknown) => {
        error.set(errorMessage(e));
        loading.set(false);
      },
    });
  };

  return {
    data: data.asReadonly(),
    loading: loading.asReadonly(),
    error: error.asReadonly(),
    reload,
    /** Replace the value with a fresher one returned by a mutation. */
    set: (value: T) => data.set(value),
  };
}

/** Human message for any failure (ApiError detail, or a generic fallback). */
export function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.message : 'حدث خطأ غير متوقع، حاول مرة أخرى.';
}
