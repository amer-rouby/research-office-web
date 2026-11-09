import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthTokenStore } from '@core/auth/auth-token.store';
import { apiInterceptor } from './api.interceptor';
import { API_URL } from './api-url';
import { ApiError } from './problem-detail';

const API = 'http://api.test/api';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let tokens: AuthTokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: API_URL, useValue: API },
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    tokens = TestBed.inject(AuthTokenStore);
    tokens.clear();
  });

  afterEach(() => backend.verify());

  it('adds the bearer token to API requests only', () => {
    tokens.set('t-1');

    http.get(`${API}/requests`).subscribe();
    http.get('https://elsewhere.test/data').subscribe();

    expect(backend.expectOne(`${API}/requests`).request.headers.get('Authorization')).toBe('Bearer t-1');
    expect(backend.expectOne('https://elsewhere.test/data').request.headers.has('Authorization')).toBe(false);
  });

  it('maps a ProblemDetail body to ApiError', async () => {
    const result = firstValueFrom(http.get(`${API}/requests/9`));
    backend
      .expectOne(`${API}/requests/9`)
      .flush(
        { title: 'Not Found', status: 404, detail: 'الطلب غير موجود' },
        { status: 404, statusText: 'Not Found' },
      );

    const error = await result.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).message).toBe('الطلب غير موجود');
  });

  it('clears the token on 401', async () => {
    tokens.set('expired');
    const result = firstValueFrom(http.get(`${API}/me`));
    backend.expectOne(`${API}/me`).flush(null, { status: 401, statusText: 'Unauthorized' });

    const error = await result.catch((e: unknown) => e);
    expect((error as ApiError).isUnauthorized).toBe(true);
    expect(tokens.token()).toBeNull();
  });

  it('reports network failures as status 0', async () => {
    const result = firstValueFrom(http.get(`${API}/ping`));
    backend.expectOne(`${API}/ping`).error(new ProgressEvent('error'));

    const error = await result.catch((e: unknown) => e);
    expect((error as ApiError).isNetworkError).toBe(true);
  });
});
