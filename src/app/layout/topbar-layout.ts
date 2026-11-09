import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFooter } from './app-footer';
import { Brand } from './brand';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

/** Simple shell for expert, client-tracking and public pages. Configured by route data. */
@Component({
  selector: 'ro-topbar-layout',
  imports: [RouterOutlet, Brand, ThemeToggle, UserMenu, AppFooter],
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <header
      class="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-surface-raised/90 px-4 backdrop-blur sm:px-6"
    >
      <ro-brand />
      <div class="flex items-center gap-3">
        <span class="hidden text-sm text-ink-muted sm:inline">{{ areaTitle() }}</span>
        <ro-theme-toggle />
        <ro-user-menu />
      </div>
    </header>
    <main class="flex-1 p-4 sm:p-6"><router-outlet /></main>
    <ro-app-footer />
  `,
})
export class TopbarLayout {
  readonly areaTitle = input.required<string>();
}
