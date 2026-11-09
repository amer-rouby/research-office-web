import { Routes } from '@angular/router';
import { TopbarLayout } from '@layout/topbar-layout';

/** Mounted at /t/:token: the client follows a request by link, without logging in. */
export const TRACKING_ROUTES: Routes = [
  {
    path: '',
    component: TopbarLayout,
    data: { areaTitle: 'متابعة الطلب' },
    children: [
      {
        path: '',
        title: 'متابعة الطلب',
        loadComponent: () => import('./tracking.page').then((m) => m.TrackingPage),
      },
    ],
  },
];
