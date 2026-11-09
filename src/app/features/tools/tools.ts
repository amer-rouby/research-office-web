import { LucideCalculator, LucideIcon, LucideScale, LucideUsers } from '@lucide/angular';

/** The free tools, listed once for the tools page, the landing page and the routes. */
export interface ToolInfo {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly audience: string;
  readonly icon: LucideIcon;
}

export const TOOLS: readonly ToolInfo[] = [
  {
    path: 'sample-size',
    title: 'حاسبة حجم العينة',
    description: 'كم مشاركًا تحتاج في استبيانك؟ بمعادلة كوكران وتصحيح المجتمع المحدود.',
    audience: 'للباحثين والطلاب',
    icon: LucideUsers,
  },
  {
    path: 'statistical-test',
    title: 'أي اختبار إحصائي أستخدم؟',
    description: 'أسئلة قصيرة عن دراستك تنتهي بالاختبار المناسب وسببه والبرنامج.',
    audience: 'للباحثين والطلاب',
    icon: LucideScale,
  },
  {
    path: 'break-even',
    title: 'حاسبة نقطة التعادل',
    description: 'كم تبيع شهريًا لتغطي تكاليفك، ومتى تسترد رأس مالك؟',
    audience: 'لأصحاب المشاريع',
    icon: LucideCalculator,
  },
];
