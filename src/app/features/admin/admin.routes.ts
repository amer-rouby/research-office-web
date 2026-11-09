import { Routes } from '@angular/router';
import { LucideClipboardList, LucideLayoutDashboard, LucideUsers } from '@lucide/angular';
import { NavItem } from '@layout/nav-item';
import { SidebarLayout } from '@layout/sidebar-layout';
import { PlaceholderPage } from '@shared/ui/placeholder-page';

const nav: readonly NavItem[] = [
  { label: 'لوحة التحكم', path: '/admin', icon: LucideLayoutDashboard, exact: true },
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
        title: 'لوحة التحكم',
        loadComponent: () => import('./dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'requests',
        title: 'الطلبات',
        loadComponent: () => import('./orders/orders-list.page').then((m) => m.OrdersListPage),
      },
      {
        path: 'requests/:id',
        title: 'تفاصيل الطلب',
        loadComponent: () => import('./orders/order-detail.page').then((m) => m.OrderDetailPage),
      },
      {
        path: 'experts',
        component: PlaceholderPage,
        title: 'الخبراء',
        data: { title: 'الخبراء', description: 'إدارة الخبراء وتخصصاتهم وتوزيع المهام عليهم.' },
      },
    ],
  },
];
