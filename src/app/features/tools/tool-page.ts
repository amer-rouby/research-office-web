import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';

/** Frame shared by every free tool: back link, title, intro, inputs (start) and result (end). */
@Component({
  selector: 'ro-tool-page',
  imports: [RouterLink, LucideArrowRight],
  host: { class: 'mx-auto block max-w-5xl px-4 py-8 sm:px-6' },
  template: `
    <a
      routerLink="/tools"
      class="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
    >
      <svg lucideArrowRight size="16" aria-hidden="true"></svg> كل الأدوات
    </a>
    <h1 class="mt-3 text-3xl font-bold tracking-tight text-ink">{{ title() }}</h1>
    <p class="mt-2 max-w-2xl text-ink-muted">{{ intro() }}</p>
    <div class="mt-8 grid gap-6 lg:grid-cols-5">
      <section
        class="rounded-2xl border bg-surface-raised p-5 shadow-sm lg:col-span-3"
        aria-label="المدخلات"
      >
        <ng-content select="[inputs]" />
      </section>
      <section class="flex flex-col gap-4 lg:col-span-2" aria-live="polite" aria-label="النتيجة">
        <ng-content select="[result]" />
      </section>
    </div>
  `,
})
export class ToolPage {
  readonly title = input.required<string>();
  readonly intro = input.required<string>();
}
