import { Component, input } from '@angular/core';

/** Title row of a staff page; `[actions]` content sits on its end. */
@Component({
  selector: 'ro-page-header',
  host: { class: 'flex flex-wrap items-end justify-between gap-4' },
  template: `
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-ink">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="mt-1 text-sm text-ink-muted">{{ subtitle() }}</p>
      }
    </div>
    <ng-content select="[actions]" />
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
