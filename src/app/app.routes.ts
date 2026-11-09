import { inject } from '@angular/core';
import { CanMatchFn, Router, Routes } from '@angular/router';
import { requireRole } from '@core/auth/auth.guard';
import { AuthSessionStore } from '@core/auth/auth-session.store';
import { ROLE_HOME } from '@core/auth/auth.service';

/** A signed-in user opening /login goes straight to their area. */
const guestOnly: CanMatchFn = () => {
  const user = inject(AuthSessionStore).user();
  return user ? inject(Router).parseUrl(ROLE_HOME[user.role]) : true;
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'request' },
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
    path: 't/:token',
    loadChildren: () => import('@features/tracking/tracking.routes').then((m) => m.TRACKING_ROUTES),
  },
  {
    path: 'request',
    loadChildren: () => import('@features/intake/intake.routes').then((m) => m.INTAKE_ROUTES),
  },
  { path: '**', redirectTo: 'request' },
];
