import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthSessionStore } from '@core/auth/auth-session.store';
import { AuthService } from '@core/auth/auth.service';
import { API_URL } from './api-url';
import { ApiError, toApiError } from './problem-detail';

const withToken = (req: HttpRequest<unknown>, token: string | null) =>
  token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

/**
 * For research-office-backend API requests only:
 * - attaches the bearer token;
 * - on 401, refreshes the session once and retries; if that fails, sends the user to sign in;
 * - maps every failure to an {@link ApiError} built from the ProblemDetail body.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = inject(API_URL);
  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }
  const session = inject(AuthSessionStore);
  const auth = inject(AuthService);
  const isAuthCall = req.url.startsWith(`${apiUrl}/auth/`);
  const toError = (error: unknown) =>
    throwError(() => (error instanceof HttpErrorResponse ? toApiError(error) : error));

  const request = req.headers.has('Authorization') ? req : withToken(req, session.token());

  return next(request).pipe(
    catchError((error: unknown) => {
      const unauthorized =
        error instanceof HttpErrorResponse && error.status === 401 && !isAuthCall;
      if (!unauthorized) {
        return toError(error);
      }
      if (session.refreshToken() === null) {
        session.clear();
        return toError(error);
      }
      return auth.refresh().pipe(
        catchError(() => {
          auth.expire();
          return throwError(() => new ApiError(401, { title: 'انتهت الجلسة', status: 401 }));
        }),
        switchMap((token) => next(withToken(req, token)).pipe(catchError(toError))),
      );
    }),
  );
};
