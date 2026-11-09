import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AppFooter } from './app-footer';
import { Brand } from './brand';
import { NavItem } from './nav-item';
import { ThemeToggle } from './theme-toggle';

/** Staff shell: side navigation + header + content. Configured by route data. */
@Component({
  selector: 'ro-sidebar-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon, Brand, ThemeToggle, AppFooter],
  host: { class: 'flex min-h-dvh' },
  template: `
    <aside class="hidden w-64 shrink-0 flex-col border-e bg-surface-raised md:flex">
      <div class="flex h-16 items-center border-b px-4"><ro-brand /></div>
      <nav class="flex flex-1 flex-col gap-1 p-3" [attr.aria-label]="areaTitle()">
        @for (item of nav(); track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-brand-50 text-primary dark:bg-brand-900"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-surface-sunken hover:text-ink"
          >
            <svg [lucideIcon]="item.icon" size="18" aria-hidden="true"></svg>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </aside>
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-16 items-center justify-between border-b bg-surface-raised px-6">
        <span class="font-medium text-ink">{{ areaTitle() }}</span>
        <ro-theme-toggle />
      </header>
      <main class="flex-1 p-6"><router-outlet /></main>
      <ro-app-footer />
    </div>
  `,
})
export class SidebarLayout {
  readonly areaTitle = input.required<string>();
  readonly nav = input<readonly NavItem[]>([]);
}
