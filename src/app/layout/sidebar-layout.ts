import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AppFooter } from './app-footer';
import { Brand } from './brand';
import { NavItem } from './nav-item';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

const LINK =
  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-muted hover:bg-surface-sunken hover:text-ink';
const ACTIVE = 'bg-brand-50 font-medium !text-primary dark:bg-brand-900';

/** Staff shell: side navigation (top tabs on phones) + header + content. Configured by route data. */
@Component({
  selector: 'ro-sidebar-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideDynamicIcon,
    Brand,
    ThemeToggle,
    UserMenu,
    AppFooter,
  ],
  host: { class: 'flex min-h-dvh' },
  template: `
    <aside
      class="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e bg-surface-raised md:flex"
    >
      <div class="flex h-16 items-center border-b px-4"><ro-brand /></div>
      <nav class="flex flex-1 flex-col gap-1 p-3" [attr.aria-label]="areaTitle()">
        @for (item of nav(); track item.path) {
          <a
            [routerLink]="item.path"
            [routerLinkActive]="active"
            [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            [class]="link"
          >
            <svg [lucideIcon]="item.icon" size="18" aria-hidden="true"></svg>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </aside>
    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-surface-raised/90 px-4 backdrop-blur sm:px-6"
      >
        <div class="md:hidden"><ro-brand /></div>
        <span class="hidden font-medium text-ink md:inline">{{ areaTitle() }}</span>
        <div class="flex items-center gap-2">
          <ro-theme-toggle />
          <ro-user-menu />
        </div>
      </header>
      <nav
        class="flex gap-1 overflow-x-auto border-b bg-surface-raised px-3 py-2 md:hidden"
        [attr.aria-label]="areaTitle()"
      >
        @for (item of nav(); track item.path) {
          <a
            [routerLink]="item.path"
            [routerLinkActive]="active"
            [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            [class]="link + ' shrink-0'"
          >
            <svg [lucideIcon]="item.icon" size="16" aria-hidden="true"></svg>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
      <main class="flex-1 p-4 sm:p-6"><router-outlet /></main>
      <ro-app-footer />
    </div>
  `,
})
export class SidebarLayout {
  readonly areaTitle = input.required<string>();
  readonly nav = input<readonly NavItem[]>([]);
  protected readonly link = LINK;
  protected readonly active = ACTIVE;
}
