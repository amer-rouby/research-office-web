import { Component, booleanAttribute, input } from '@angular/core';

/** Surface for a block of content, with an optional title row (`[actions]` slot on its end). */
@Component({
  selector: 'ro-card',
  host: { class: 'block rounded-2xl border bg-surface-raised shadow-soft' },
  template: `
    @if (title()) {
      <header class="flex items-center justify-between gap-3 border-b px-5 py-3.5">
        <h2 class="font-semibold text-ink">{{ title() }}</h2>
        <ng-content select="[actions]" />
      </header>
    }
    <div [class]="flush() ? '' : 'p-5'"><ng-content /></div>
  `,
})
export class Card {
  readonly title = input<string>();
  /** No inner padding (for tables and lists that run edge to edge). */
  readonly flush = input(false, { transform: booleanAttribute });
}
