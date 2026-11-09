import { Component, computed, input } from '@angular/core';
import {
  LucideCircleAlert,
  LucideCircleCheck,
  LucideDynamicIcon,
  LucideInfo,
  LucideTriangleAlert,
} from '@lucide/angular';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const TONES = {
  info: {
    classes: 'bg-brand-50 text-brand-800 dark:bg-brand-900 dark:text-brand-100',
    icon: LucideInfo,
  },
  success: { classes: 'bg-success-soft text-success', icon: LucideCircleCheck },
  warning: { classes: 'bg-warning-soft text-ink', icon: LucideTriangleAlert },
  danger: { classes: 'bg-danger-soft text-danger', icon: LucideCircleAlert },
} as const;

@Component({
  selector: 'ro-alert',
  imports: [LucideDynamicIcon],
  host: {
    '[class]': '"flex items-start gap-3 rounded-xl px-4 py-3 text-sm " + tone().classes',
    '[attr.role]': 'kind() === "danger" ? "alert" : "status"',
  },
  template: `
    <svg [lucideIcon]="tone().icon" size="18" class="mt-0.5 shrink-0" aria-hidden="true"></svg>
    <div class="min-w-0 flex-1"><ng-content /></div>
  `,
})
export class Alert {
  readonly kind = input<AlertTone>('info');
  protected readonly tone = computed(() => TONES[this.kind()]);
}
