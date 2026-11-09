import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  withComponentInputBinding,
  withRouterConfig,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { Role, TrackingView } from '@core/api/api-types';
import { APP_VERSION } from '@core/app-version';
import { AuthSessionStore } from '@core/auth/auth-session.store';
import { routes } from './app.routes';

const signIn = (role: Role) =>
  TestBed.inject(AuthSessionStore).set({
    accessToken: 'a',
    refreshToken: 'r',
    expiresIn: 900,
    user: { id: 'u1', email: 'u@x.y', fullName: 'سارة أحمد', role },
  });

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          routes,
          withComponentInputBinding(),
          withRouterConfig({ paramsInheritanceStrategy: 'always' }),
        ),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    TestBed.inject(AuthSessionStore).clear();
  });

  it('renders the public request form', async () => {
    const harness = await RouterTestingHarness.create('/request');
    expect(harness.routeNativeElement?.textContent).toContain('اطلب خدمتك');
  });

  it('redirects the root to the public request form', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.textContent).toContain('اطلب خدمتك');
  });

  it('sends a guest who opens /admin to sign in, remembering the target', async () => {
    const harness = await RouterTestingHarness.create('/admin');
    expect(TestBed.inject(Router).url).toBe('/login?returnUrl=%2Fadmin');
    expect(harness.routeNativeElement?.textContent).toContain('تسجيل الدخول');
  });

  it('renders the admin shell for an admin, with navigation, user and version', async () => {
    signIn('ADMIN');
    const harness = await RouterTestingHarness.create('/admin');
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('aside nav')?.querySelectorAll('a').length).toBe(3);
    expect(el.textContent).toContain('سارة أحمد');
    expect(el.querySelector('footer')?.textContent).toContain(APP_VERSION);
  });

  it('keeps an expert out of the admin area', async () => {
    signIn('EXPERT');
    await RouterTestingHarness.create('/admin');
    expect(TestBed.inject(Router).url).toBe('/expert');
  });

  it('opens client tracking by token without login and shows status, quote and step', async () => {
    const harness = await RouterTestingHarness.create('/t/abc123');
    const view: TrackingView = {
      reference: 'RO-2026-0007',
      serviceName: 'التحليل الإحصائي',
      status: 'QUOTED',
      clientName: 'محمد',
      deadline: null,
      quote: { price: 450, currency: 'QAR', note: 'خلال 5 أيام' },
      paidTotal: 0,
      timeline: [],
      files: [],
      createdAt: '2026-11-09T10:00:00Z',
    };
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne((r) => r.url.endsWith('/public/orders/abc123'));
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(view);
    await harness.fixture.whenStable();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('RO-2026-0007');
    expect(text).toContain('بانتظار قبول العرض');
    expect(text).toContain('قبول العرض والبدء');
  });

  it('shows the dashboard tiles for an admin', async () => {
    signIn('ADMIN');
    const harness = await RouterTestingHarness.create('/admin');
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((r) => r.url.endsWith('/admin/orders/stats'))
      .flush({
        byStatus: {
          NEW: 3,
          QUOTED: 1,
          ACCEPTED: 0,
          IN_PROGRESS: 2,
          IN_REVIEW: 0,
          DELIVERED: 0,
          REVISION: 0,
          CLOSED: 4,
          CANCELLED: 0,
        },
        open: 6,
        total: 10,
        money: [{ currency: 'QAR', collectedThisMonth: 1200, outstanding: 300 }],
        dueSoon: 1,
      });
    http
      .expectOne((r) => r.url.endsWith('/admin/orders'))
      .flush({ items: [], page: 0, size: 6, total: 0 });
    await harness.fixture.whenStable();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('طلبات جديدة');
    expect(text).toContain('لا توجد طلبات بعد');
  });

  it('renders the expert area for an expert', async () => {
    signIn('EXPERT');
    const harness = await RouterTestingHarness.create('/expert');
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/expert/tasks'))
      .flush([
        {
          id: 't1',
          reference: 'RO-2026-0003',
          serviceName: 'التحليل الإحصائي',
          status: 'IN_PROGRESS',
          deadline: null,
          updatedAt: '2026-11-09T10:00:00Z',
        },
      ]);
    await harness.fixture.whenStable();
    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('مهام جارية (1)');
    expect(text).toContain('RO-2026-0003');
  });
  it('computes a sample size on the free tool page without login', async () => {
    const harness = await RouterTestingHarness.create('/tools/sample-size');
    await harness.fixture.whenStable();
    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('حاسبة حجم العينة');
    expect(text).toContain('385');
  });

  it('prefills the request form from a tool (service code + details)', async () => {
    const harness = await RouterTestingHarness.create(
      '/request?service=STAT_ANALYSIS&details=' + encodeURIComponent('حسبت حجم العينة: 385'),
    );
    TestBed.inject(HttpTestingController)
      .match((r) => r.url.endsWith('/public/services'))
      .forEach((r) =>
        r.flush([
          {
            id: 's1',
            code: 'STAT_ANALYSIS',
            category: 'ACADEMIC',
            nameAr: 'التحليل الإحصائي',
            nameEn: 'Stats',
            descriptionAr: 'وصف',
            active: true,
            sortOrder: 1,
          },
        ]),
      );
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement as HTMLElement;
    expect((el.querySelector('input[type=radio]') as HTMLInputElement).checked).toBe(true);
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toContain('385');
  });
});
