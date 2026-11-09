import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideDynamicIcon } from '@lucide/angular';
import { TOOLS } from './tools';

/** Grid of the free tools (tools page and landing page). */
@Component({
  selector: 'ro-tool-cards',
  imports: [RouterLink, LucideDynamicIcon, LucideArrowLeft],
  host: { class: 'grid gap-4 md:grid-cols-3' },
  template: `
    @for (t of tools; track t.path) {
      <a
        [routerLink]="['/tools', t.path]"
        class="group flex flex-col gap-3 rounded-2xl border bg-surface-raised p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lift"
      >
        <span class="grid size-12 place-items-center rounded-xl bg-accent-100 text-accent-800">
          <svg [lucideIcon]="t.icon" size="22" aria-hidden="true"></svg>
        </span>
        <span class="text-xs font-medium text-accent-700 dark:text-accent-300">{{
          t.audience
        }}</span>
        <span class="text-lg font-semibold text-ink">{{ t.title }}</span>
        <span class="flex-1 text-sm leading-relaxed text-ink-muted">{{ t.description }}</span>
        <span class="inline-flex items-center gap-1 text-sm font-medium text-primary">
          جرّبها مجانًا
          <svg
            lucideArrowLeft
            size="16"
            class="transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          ></svg>
        </span>
      </a>
    }
  `,
})
export class ToolCards {
  protected readonly tools = TOOLS;
}
