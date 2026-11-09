import { Routes } from '@angular/router';
import { TopbarLayout } from '@layout/topbar-layout';
import { PlaceholderPage } from '@shared/ui/placeholder-page';

export const INTAKE_ROUTES: Routes = [
  {
    path: '',
    component: TopbarLayout,
    data: { areaTitle: 'طلب خدمة' },
    children: [
      {
        path: '',
        component: PlaceholderPage,
        title: 'طلب خدمة',
        data: {
          title: 'اطلب خدمتك',
          description: 'تحليل إحصائي، تدقيق وتنسيق، دراسات جدوى. أرسل طلبك وسنعود إليك بالتسعير.',
        },
      },
    ],
  },
];
