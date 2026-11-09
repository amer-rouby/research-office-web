import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthTokenStore } from '@core/auth/auth-token.store';
import { API_URL } from './api-url';
import { toApiError } from './problem-detail';

/**
 * For requests to the research-office-backend API only:
 * - attaches the bearer token when one is present;
 * - maps every failure to an ApiError built from the ProblemDetail body;
 * - drops the stored token on 401 so the UI can send the user to login.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = inject(API_URL);
  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }

  const tokens = inject(AuthTokenStore);
  const token = tokens.token();
  const request =
    token && !req.headers.has('Authorization')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }
      const apiError = toApiError(error);
      if (apiError.isUnauthorized) {
        tokens.clear();
      }
      return throwError(() => apiError);
    }),
  );
};
