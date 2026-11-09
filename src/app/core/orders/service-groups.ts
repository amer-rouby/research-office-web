import { LucideBriefcase, LucideGraduationCap, LucideIcon } from '@lucide/angular';
import type { ServiceView } from '@core/api/api-types';

export interface ServiceGroup {
  readonly category: 'ACADEMIC' | 'BUSINESS';
  readonly title: string;
  readonly icon: LucideIcon;
  readonly services: ServiceView[];
}

const GROUPS = [
  { category: 'ACADEMIC', title: 'خدمات الباحثين والطلاب', icon: LucideGraduationCap },
  { category: 'BUSINESS', title: 'خدمات الشركات ورواد الأعمال', icon: LucideBriefcase },
] as const;

/** Services split by audience, in catalog order (landing page and request form). */
export function groupServices(services: readonly ServiceView[]): ServiceGroup[] {
  return GROUPS.map((g) => ({ ...g, services: services.filter((s) => s.category === g.category) }));
}
