import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { TokenResponse } from '@core/api/api-types';
import { AuthSessionStore } from '@core/auth/auth-session.store';
import { apiInterceptor } from './api.interceptor';
import { API_URL } from './api-url';
import { ApiError } from './problem-detail';

const API = 'http://api.test/api';
const tokens = (access: string, refresh = 'r-1'): TokenResponse => ({
  accessToken: access,
  refreshToken: refresh,
  expiresIn: 900,
  user: { id: 'u1', email: 'a@b.c', fullName: 'Admin', role: 'ADMIN' },
});

describe('apiInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let session: AuthSessionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: API_URL, useValue: API },
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    session = TestBed.inject(AuthSessionStore);
    session.clear();
  });

  afterEach(() => backend.verify());

  it('adds the bearer token to API requests only', () => {
    session.set(tokens('t-1'));

    http.get(`${API}/requests`).subscribe();
    http.get('https://elsewhere.test/data').subscribe();

    expect(backend.expectOne(`${API}/requests`).request.headers.get('Authorization')).toBe(
      'Bearer t-1',
    );
    expect(
      backend.expectOne('https://elsewhere.test/data').request.headers.has('Authorization'),
    ).toBe(false);
  });

  it('maps a ProblemDetail body to ApiError with its code', async () => {
    const result = firstValueFrom(http.get(`${API}/requests/9`));
    backend
      .expectOne(`${API}/requests/9`)
      .flush(
        { title: 'Not Found', status: 404, detail: 'الطلب غير موجود', code: 'NOT_FOUND' },
        { status: 404, statusText: 'Not Found' },
      );

    const error = (await result.catch((e: unknown) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('العنصر المطلوب غير موجود.');
    expect(error.problem.code).toBe('NOT_FOUND');
  });

  it('on 401 refreshes once and retries with the new token', async () => {
    session.set(tokens('expired', 'r-old'));
    const result = firstValueFrom(http.get<{ ok: boolean }>(`${API}/orders`));

    backend.expectOne(`${API}/orders`).flush(null, { status: 401, statusText: 'Unauthorized' });
    const refresh = backend.expectOne(`${API}/auth/refresh`);
    expect(refresh.request.body).toEqual({ refreshToken: 'r-old' });
    refresh.flush(tokens('fresh', 'r-new'));
    const retried = backend.expectOne(`${API}/orders`);
    expect(retried.request.headers.get('Authorization')).toBe('Bearer fresh');
    retried.flush({ ok: true });

    expect(await result).toEqual({ ok: true });
    expect(session.refreshToken()).toBe('r-new');
  });

  it('signs out when the refresh itself fails', async () => {
    session.set(tokens('expired'));
    const result = firstValueFrom(http.get(`${API}/orders`));

    backend.expectOne(`${API}/orders`).flush(null, { status: 401, statusText: 'Unauthorized' });
    backend
      .expectOne(`${API}/auth/refresh`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    const error = (await result.catch((e: unknown) => e)) as ApiError;
    expect(error.isUnauthorized).toBe(true);
    expect(session.isAuthenticated()).toBe(false);
  });

  it('reports network failures as status 0', async () => {
    const result = firstValueFrom(http.get(`${API}/ping`));
    backend.expectOne(`${API}/ping`).error(new ProgressEvent('error'));

    const error = (await result.catch((e: unknown) => e)) as ApiError;
    expect(error.isNetworkError).toBe(true);
  });
});
