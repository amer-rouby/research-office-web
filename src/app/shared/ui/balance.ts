import { Component, computed, input } from '@angular/core';
import type { Quote } from '@core/api/api-types';
import { formatMoney } from '@shared/pipes/format.pipes';

/** Paid vs. remaining against a quote, with a progress bar. Used by staff and client pages. */
@Component({
  selector: 'ro-balance',
  host: { class: 'flex flex-col gap-2' },
  template: `
    <div class="h-2 overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
      <div class="h-full rounded-full bg-success transition-all" [style.width.%]="percent()"></div>
    </div>
    <div class="flex justify-between text-sm">
      <span class="text-ink-muted"
        >المدفوع <strong class="text-ink">{{ paidText() }}</strong></span
      >
      <span class="text-ink-muted">
        @if (remaining() > 0) {
          المتبقي <strong class="text-ink">{{ remainingText() }}</strong>
        } @else {
          <strong class="text-success">تم السداد بالكامل</strong>
        }
      </span>
    </div>
  `,
})
export class Balance {
  readonly quote = input.required<Quote>();
  readonly paid = input.required<number>();

  protected readonly remaining = computed(() => Math.max(this.quote().price - this.paid(), 0));
  protected readonly percent = computed(() =>
    Math.min(100, Math.round((this.paid() / this.quote().price) * 100)),
  );
  protected readonly paidText = computed(() =>
    formatMoney({ price: this.paid(), currency: this.quote().currency }),
  );
  protected readonly remainingText = computed(() =>
    formatMoney({ price: this.remaining(), currency: this.quote().currency }),
  );
}
