import { Routes } from '@angular/router';
import { TopbarLayout } from '@layout/topbar-layout';

export const INTAKE_ROUTES: Routes = [
  {
    path: '',
    component: TopbarLayout,
    data: { areaTitle: 'طلب خدمة' },
    children: [
      {
        path: '',
        title: 'اطلب خدمتك',
        loadComponent: () => import('./intake.page').then((m) => m.IntakePage),
      },
    ],
  },
];
