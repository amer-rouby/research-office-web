import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFooter } from './app-footer';
import { Brand } from './brand';
import { ThemeToggle } from './theme-toggle';

/** Simple shell for expert, client-tracking and public pages. Configured by route data. */
@Component({
  selector: 'ro-topbar-layout',
  imports: [RouterOutlet, Brand, ThemeToggle, AppFooter],
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <header class="flex h-16 items-center justify-between gap-4 border-b bg-surface-raised px-6">
      <ro-brand />
      <div class="flex items-center gap-3">
        <span class="text-sm text-ink-muted">{{ areaTitle() }}</span>
        <ro-theme-toggle />
      </div>
    </header>
    <main class="flex-1 p-6"><router-outlet /></main>
    <ro-app-footer />
  `,
})
export class TopbarLayout {
  readonly areaTitle = input.required<string>();
}
