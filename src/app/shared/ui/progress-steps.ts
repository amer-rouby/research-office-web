import { Component, input } from '@angular/core';
import { LucideCheck } from '@lucide/angular';

/** Horizontal journey (wraps on phones): done steps get a check, the current one is highlighted. */
@Component({
  selector: 'ro-progress-steps',
  imports: [LucideCheck],
  template: `
    <ol class="grid grid-cols-3 gap-y-4 sm:grid-cols-6">
      @for (step of steps(); track step; let i = $index) {
        <li class="flex flex-col items-center gap-2 text-center">
          <span
            class="grid size-9 place-items-center rounded-full text-sm font-semibold transition-colors"
            [class]="
              i < current()
                ? 'bg-primary text-on-primary'
                : i === current()
                  ? 'bg-accent-400 text-accent-900 ring-4 ring-accent-100 dark:ring-accent-900'
                  : 'bg-surface-sunken text-ink-subtle'
            "
            [attr.aria-current]="i === current() ? 'step' : null"
          >
            @if (i < current()) {
              <svg lucideCheck size="16" aria-hidden="true"></svg>
            } @else {
              {{ i + 1 }}
            }
          </span>
          <span
            class="text-xs"
            [class]="i <= current() ? 'font-medium text-ink' : 'text-ink-subtle'"
            >{{ step }}</span
          >
        </li>
      }
    </ol>
  `,
})
export class ProgressSteps {
  readonly steps = input.required<readonly string[]>();
  /** Index of the current step (-1 = none). */
  readonly current = input.required<number>();
}
