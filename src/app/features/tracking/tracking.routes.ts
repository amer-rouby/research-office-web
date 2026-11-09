import { Routes } from '@angular/router';
import { TopbarLayout } from '@layout/topbar-layout';
import { PlaceholderPage } from '@shared/ui/placeholder-page';

/** Mounted at /t/:token: the client follows a request by link, without logging in. */
export const TRACKING_ROUTES: Routes = [
  {
    path: '',
    component: TopbarLayout,
    data: { areaTitle: 'متابعة الطلب' },
    children: [
      {
        path: '',
        component: PlaceholderPage,
        title: 'متابعة الطلب',
        data: { title: 'متابعة طلبك', description: 'حالة طلبك والملفات المسلّمة.' },
      },
    ],
  },
];
