import { inject } from '@angular/core';
import { CanMatchFn, Router, Routes } from '@angular/router';
import { requireRole } from '@core/auth/auth.guard';
import { AuthSessionStore } from '@core/auth/auth-session.store';
import { ROLE_HOME } from '@core/auth/auth.service';
import { PublicLayout } from '@layout/public-layout';

/** A signed-in user opening /login goes straight to their area. */
const guestOnly: CanMatchFn = () => {
  const user = inject(AuthSessionStore).user();
  return user ? inject(Router).parseUrl(ROLE_HOME[user.role]) : true;
};

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [guestOnly],
    title: 'تسجيل الدخول',
    loadComponent: () => import('@features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    canMatch: [requireRole('ADMIN')],
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'expert',
    canMatch: [requireRole('EXPERT', 'ADMIN')],
    loadChildren: () => import('@features/expert/expert.routes').then((m) => m.EXPERT_ROUTES),
  },
  {
    // Public website: landing, free tools, request form, client tracking
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('@features/landing/landing.page').then((m) => m.LandingPage),
      },
      {
        path: 'tools',
        loadChildren: () => import('@features/tools/tools.routes').then((m) => m.TOOLS_ROUTES),
      },
      {
        path: 'request',
        title: 'اطلب خدمتك',
        data: { description: 'أرسل طلبك وارفق ملفاتك واستلم عرض السعر خلال 24 ساعة.' },
        loadComponent: () => import('@features/intake/intake.page').then((m) => m.IntakePage),
      },
      {
        path: 't/:token',
        title: 'متابعة الطلب',
        loadComponent: () => import('@features/tracking/tracking.page').then((m) => m.TrackingPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
