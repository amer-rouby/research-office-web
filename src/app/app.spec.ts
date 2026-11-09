import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { Role } from '@core/api/api-types';
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
        provideRouter(routes, withComponentInputBinding()),
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

  it('opens client tracking by token without login', async () => {
    const harness = await RouterTestingHarness.create('/t/abc123');
    expect(harness.routeNativeElement?.textContent).toContain('متابعة طلبك');
  });

  it('renders the expert area for an expert', async () => {
    signIn('EXPERT');
    const harness = await RouterTestingHarness.create('/expert');
    expect(harness.routeNativeElement?.textContent).toContain('مهامي');
  });
});
