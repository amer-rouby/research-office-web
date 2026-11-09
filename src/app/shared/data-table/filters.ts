import { Component, DestroyRef, inject, input, model, output } from '@angular/core';
import { LucideSearch } from '@lucide/angular';

export interface FilterOption<V> {
  readonly value: V;
  readonly label: string;
  readonly count?: number;
}

/** Pill tabs for one filter (e.g. request status), two-way bound with `[(value)]`. */
@Component({
  selector: 'ro-filter-tabs',
  host: { class: 'flex gap-1.5 overflow-x-auto pb-1', role: 'tablist' },
  template: `
    @for (o of options(); track o.value) {
      <button
        type="button"
        role="tab"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors"
        [class]="
          o.value === value()
            ? 'bg-primary text-on-primary'
            : 'bg-surface-raised text-ink-muted ring-1 ring-border ring-inset hover:text-ink'
        "
        [attr.aria-selected]="o.value === value()"
        (click)="value.set(o.value)"
      >
        {{ o.label }}
        @if (o.count !== undefined) {
          <span class="rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/15">{{
            o.count
          }}</span>
        }
      </button>
    }
  `,
})
export class FilterTabs<V> {
  readonly options = input.required<readonly FilterOption<V>[]>();
  readonly value = model.required<V>();
}

/** Search input that emits after the user pauses typing. */
@Component({
  selector: 'ro-search-box',
  imports: [LucideSearch],
  host: { class: 'relative block' },
  template: `
    <svg
      lucideSearch
      size="18"
      class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-subtle"
      aria-hidden="true"
    ></svg>
    <input
      type="search"
      class="w-full rounded-xl border bg-surface-raised py-2.5 ps-10 pe-3.5 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:ring-2 focus:ring-focus-ring/30 focus:outline-none"
      [placeholder]="placeholder()"
      [attr.aria-label]="placeholder()"
      [value]="value()"
      (input)="onInput($any($event.target).value)"
    />
  `,
})
export class SearchBox {
  readonly placeholder = input('بحث');
  readonly value = input('');
  readonly search = output<string>();
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected onInput(text: string): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.search.emit(text), 350);
  }
}
