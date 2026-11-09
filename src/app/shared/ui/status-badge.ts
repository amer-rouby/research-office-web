import { Component, computed, input } from '@angular/core';
import type { OrderStatus } from '@core/api/api-types';
import { STATUS, Tone } from '@core/orders/order-status';

export const TONE_CLASSES: Record<Tone, string> = {
  info: 'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900 dark:text-brand-100 dark:ring-brand-700',
  warning: 'bg-warning-soft text-ink ring-warning/40',
  success: 'bg-success-soft text-success ring-success/30',
  danger: 'bg-danger-soft text-danger ring-danger/30',
  neutral: 'bg-surface-sunken text-ink-muted ring-border',
};

@Component({
  selector: 'ro-status-badge',
  host: {
    '[class]':
      '"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ring-1 ring-inset " + classes()',
  },
  template: `<span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span
    >{{ label() }}`,
})
export class StatusBadge {
  readonly status = input.required<OrderStatus>();
  protected readonly label = computed(() => STATUS[this.status()].label);
  protected readonly classes = computed(() => TONE_CLASSES[STATUS[this.status()].tone]);
}
