import { Component, input } from '@angular/core';
import { LucideEyeOff } from '@lucide/angular';
import type { TimelineEntry } from '@core/api/api-types';
import { timelineTitle } from '@core/orders/order-status';
import { DateTimePipe } from '@shared/pipes/format.pipes';

/** Chronological history of a request. Staff see which entries are hidden from the client. */
@Component({
  selector: 'ro-timeline',
  imports: [DateTimePipe, LucideEyeOff],
  template: `
    <ol class="relative flex flex-col gap-5 border-s-2 border-border ps-5">
      @for (e of entries(); track e.id) {
        <li class="relative">
          <span
            class="absolute -start-[1.6rem] top-1.5 size-3 rounded-full border-2 border-surface-raised bg-primary"
            aria-hidden="true"
          ></span>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p class="font-medium text-ink">{{ title(e) }}</p>
            @if (showVisibility() && !e.visibleToClient) {
              <span
                class="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 text-xs text-ink-muted"
              >
                <svg lucideEyeOff size="12" aria-hidden="true"></svg> داخلي
              </span>
            }
          </div>
          @if (e.note) {
            <p class="mt-1 text-sm leading-relaxed whitespace-pre-line text-ink-muted">
              {{ e.note }}
            </p>
          }
          <p class="mt-1 text-xs text-ink-subtle">{{ e.actor }} · {{ e.at | roDateTime }}</p>
        </li>
      }
    </ol>
  `,
})
export class Timeline {
  readonly entries = input.required<readonly TimelineEntry[]>();
  /** Staff view: mark internal entries. */
  readonly showVisibility = input(false);
  protected readonly title = timelineTitle;
}
