import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { ToolCards } from './tool-cards';

@Component({
  selector: 'ro-tools-index',
  imports: [ToolCards],
  host: { class: 'mx-auto block max-w-6xl px-4 py-10 sm:px-6' },
  template: `
    <h1 class="text-3xl font-bold tracking-tight text-ink">
      أدوات مجانية للباحثين وأصحاب المشاريع
    </h1>
    <p class="mt-2 max-w-2xl text-ink-muted">
      بدون تسجيل وبدون مقابل. وإذا احتجت من يكمل معك، خبراؤنا جاهزون.
    </p>
    <ro-tool-cards class="mt-8" />
  `,
})
class ToolsIndexPage {}

export const TOOLS_ROUTES: Routes = [
  {
    path: '',
    title: 'أدوات مجانية',
    data: {
      description:
        'حاسبة حجم العينة، اختيار الاختبار الإحصائي المناسب، وحاسبة نقطة التعادل — مجانًا.',
    },
    component: ToolsIndexPage,
  },
  {
    path: 'sample-size',
    title: 'حاسبة حجم العينة',
    data: {
      description:
        'احسب حجم عينة الاستبيان بمعادلة كوكران مع تصحيح المجتمع المحدود ونسبة الاستجابة.',
    },
    loadComponent: () => import('./sample-size.page').then((m) => m.SampleSizePage),
  },
  {
    path: 'statistical-test',
    title: 'أي اختبار إحصائي أستخدم؟',
    data: {
      description:
        'اعرف الاختبار الإحصائي المناسب لدراستك: t-test، ANOVA، الارتباط، الانحدار، SEM وغيرها.',
    },
    loadComponent: () => import('./stat-test.page').then((m) => m.StatTestPage),
  },
  {
    path: 'break-even',
    title: 'حاسبة نقطة التعادل',
    data: { description: 'احسب نقطة التعادل ومدة استرداد رأس المال لمشروعك قبل دراسة الجدوى.' },
    loadComponent: () => import('./break-even.page').then((m) => m.BreakEvenPage),
  },
];
