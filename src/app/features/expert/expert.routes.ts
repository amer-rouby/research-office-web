import { Routes } from '@angular/router';
import { TopbarLayout } from '@layout/topbar-layout';
import { PlaceholderPage } from '@shared/ui/placeholder-page';

export const EXPERT_ROUTES: Routes = [
  {
    path: '',
    component: TopbarLayout,
    data: { areaTitle: 'مساحة الخبير' },
    children: [
      {
        path: '',
        component: PlaceholderPage,
        title: 'مهامي',
        data: { title: 'مهامي', description: 'المهام المسندة إليك ومواعيد تسليمها.' },
      },
    ],
  },
];
