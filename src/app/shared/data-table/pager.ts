import { Component, computed, input, output } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

/** "1–20 of 57" with previous/next (RTL-aware arrows). Pages are zero-based like the API. */
@Component({
  selector: 'ro-pager',
  imports: [LucideChevronLeft, LucideChevronRight],
  host: { class: 'flex items-center justify-between gap-3 px-4 py-3 text-sm text-ink-muted' },
  template: `
    <span>
      @if (total()) {
        <span dir="ltr">{{ from() }}–{{ to() }}</span> من {{ total() }}
      }
    </span>
    <div class="flex gap-1">
      <button
        type="button"
        class="grid size-9 place-items-center rounded-lg hover:bg-surface-sunken disabled:opacity-40"
        aria-label="الصفحة السابقة"
        [disabled]="page() === 0"
        (click)="pageChange.emit(page() - 1)"
      >
        <svg lucideChevronRight size="18" aria-hidden="true"></svg>
      </button>
      <button
        type="button"
        class="grid size-9 place-items-center rounded-lg hover:bg-surface-sunken disabled:opacity-40"
        aria-label="الصفحة التالية"
        [disabled]="to() >= total()"
        (click)="pageChange.emit(page() + 1)"
      >
        <svg lucideChevronLeft size="18" aria-hidden="true"></svg>
      </button>
    </div>
  `,
})
export class Pager {
  readonly page = input.required<number>();
  readonly size = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly from = computed(() => (this.total() ? this.page() * this.size() + 1 : 0));
  protected readonly to = computed(() => Math.min((this.page() + 1) * this.size(), this.total()));
}
