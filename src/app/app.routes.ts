import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'request' },
  {
    path: 'admin',
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'expert',
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
