import { Routes } from '@angular/router';
import { LucideClipboardList, LucideLayoutDashboard, LucideUsers } from '@lucide/angular';
import { NavItem } from '@layout/nav-item';
import { SidebarLayout } from '@layout/sidebar-layout';
import { PlaceholderPage } from '@shared/ui/placeholder-page';

const nav: readonly NavItem[] = [
  { label: 'لوحة التحكم', path: '/admin', icon: LucideLayoutDashboard },
  { label: 'الطلبات', path: '/admin/requests', icon: LucideClipboardList },
  { label: 'الخبراء', path: '/admin/experts', icon: LucideUsers },
];

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: SidebarLayout,
    data: { areaTitle: 'الإدارة', nav },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PlaceholderPage,
        title: 'لوحة التحكم',
        data: { title: 'لوحة التحكم', description: 'نظرة عامة على الطلبات والمهام الجارية.' },
      },
      {
        path: 'requests',
        component: PlaceholderPage,
        title: 'الطلبات',
        data: { title: 'الطلبات', description: 'استقبال الطلبات وتسعيرها وتوزيعها على الخبراء.' },
      },
      {
        path: 'experts',
        component: PlaceholderPage,
        title: 'الخبراء',
        data: { title: 'الخبراء', description: 'إدارة الخبراء وتخصصاتهم.' },
      },
    ],
  },
];
