import { Component, input } from '@angular/core';

/** Temporary page body until a feature screen is built. Inputs come from route data. */
@Component({
  selector: 'ro-placeholder-page',
  template: `
    <section class="mx-auto max-w-3xl rounded-2xl border bg-surface-raised p-8 shadow-sm">
      <h1 class="text-2xl font-semibold text-ink">{{ title() }}</h1>
      @if (description(); as text) {
        <p class="mt-3 leading-relaxed text-ink-muted">{{ text }}</p>
      }
      <p class="mt-6 inline-flex rounded-full bg-accent-100 px-3 py-1 text-sm text-accent-800">
        قيد الإنشاء
      </p>
    </section>
  `,
})
export class PlaceholderPage {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
