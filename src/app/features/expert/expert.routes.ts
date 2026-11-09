import { Routes } from '@angular/router';
import { TopbarLayout } from '@layout/topbar-layout';

export const EXPERT_ROUTES: Routes = [
  {
    path: '',
    component: TopbarLayout,
    data: { areaTitle: 'مساحة الخبير' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'مهامي',
        loadComponent: () => import('./expert-tasks.page').then((m) => m.ExpertTasksPage),
      },
      {
        path: 'tasks/:id',
        title: 'مهمة',
        loadComponent: () => import('./expert-task.page').then((m) => m.ExpertTaskPage),
      },
    ],
  },
];
