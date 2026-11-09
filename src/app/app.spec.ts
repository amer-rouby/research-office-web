import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { APP_VERSION } from '@core/app-version';
import { routes } from './app.routes';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
  });

  it('renders the public request form', async () => {
    const harness = await RouterTestingHarness.create('/request');
    expect(harness.routeNativeElement?.textContent).toContain('اطلب خدمتك');
  });

  it('redirects the root to the public request form', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.textContent).toContain('اطلب خدمتك');
  });

  it('renders the admin sidebar shell with its navigation and the version footer', async () => {
    const harness = await RouterTestingHarness.create('/admin');
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('aside nav')?.querySelectorAll('a').length).toBe(3);
    expect(el.textContent).toContain('لوحة التحكم');
    expect(el.querySelector('footer')?.textContent).toContain(APP_VERSION);
  });

  it('opens client tracking by token without login', async () => {
    const harness = await RouterTestingHarness.create('/t/abc123');
    expect(harness.routeNativeElement?.textContent).toContain('متابعة طلبك');
  });

  it('renders the expert area', async () => {
    const harness = await RouterTestingHarness.create('/expert');
    expect(harness.routeNativeElement?.textContent).toContain('مهامي');
  });
});
