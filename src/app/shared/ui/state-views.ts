import { Component, input, output } from '@angular/core';
import { LucideDynamicIcon, LucideIcon, LucideInbox } from '@lucide/angular';
import { Alert } from './alert';
import { Button } from './button';

/** Shown while data loads. */
@Component({
  selector: 'ro-loading',
  host: { class: 'flex flex-col gap-3', role: 'status', 'aria-label': 'جارٍ التحميل' },
  template: `
    @for (row of rows; track $index) {
      <div class="h-14 animate-pulse rounded-xl bg-surface-sunken"></div>
    }
  `,
})
export class Loading {
  protected readonly rows = [0, 1, 2];
}

/** Shown when a load fails, with a retry button. */
@Component({
  selector: 'ro-load-error',
  imports: [Alert, Button],
  template: `
    <ro-alert kind="danger">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span>{{ message() }}</span>
        <button roButton variant="secondary" size="sm" type="button" (click)="retry.emit()">
          إعادة المحاولة
        </button>
      </div>
    </ro-alert>
  `,
})
export class LoadError {
  readonly message = input.required<string>();
  readonly retry = output();
}

/** Shown when there is nothing to list. */
@Component({
  selector: 'ro-empty-state',
  imports: [LucideDynamicIcon],
  host: { class: 'flex flex-col items-center gap-2 px-6 py-12 text-center' },
  template: `
    <span class="grid size-12 place-items-center rounded-2xl bg-surface-sunken text-ink-subtle">
      <svg [lucideIcon]="icon()" size="22" aria-hidden="true"></svg>
    </span>
    <p class="font-medium text-ink">{{ title() }}</p>
    @if (description()) {
      <p class="max-w-sm text-sm text-ink-muted">{{ description() }}</p>
    }
    <ng-content />
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly icon = input<LucideIcon>(LucideInbox);
}
