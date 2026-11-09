import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideMessageCircle } from '@lucide/angular';
import { OfficeStore } from '@core/site/office.store';
import { Button } from '@shared/ui/button';
import { AppFooter } from './app-footer';
import { Brand } from './brand';
import { ThemeToggle } from './theme-toggle';

const LINKS = [
  { label: 'الخدمات', path: '/', fragment: 'services' },
  { label: 'أدوات مجانية', path: '/tools' },
  { label: 'تتبع طلبك', path: '/', fragment: 'track' },
];

/** Shell of every public page: site navigation, request button, WhatsApp, footer. */
@Component({
  selector: 'ro-public-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Brand,
    ThemeToggle,
    AppFooter,
    Button,
    LucideMessageCircle,
  ],
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <header class="sticky top-0 z-20 border-b bg-surface-raised/90 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <ro-brand />
        <nav class="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          @for (l of links; track l.label) {
            <a
              [routerLink]="l.path"
              [fragment]="l.fragment"
              routerLinkActive="text-primary"
              [routerLinkActiveOptions]="{ exact: true }"
              class="rounded-lg px-3 py-2 text-sm text-ink-muted hover:text-ink"
              >{{ l.label }}</a
            >
          }
        </nav>
        <div class="flex items-center gap-2">
          <ro-theme-toggle />
          <a roButton size="sm" variant="ghost" routerLink="/login">دخول الفريق</a>
          <a roButton size="sm" routerLink="/request">اطلب خدمة</a>
        </div>
      </div>
    </header>

    <main class="flex-1"><router-outlet /></main>

    @if (whatsapp(); as link) {
      <a
        [href]="link"
        target="_blank"
        rel="noopener"
        class="fixed bottom-5 start-5 z-30 grid size-14 place-items-center rounded-full bg-success text-white shadow-lift transition-transform hover:scale-105"
        aria-label="تواصل معنا على واتساب"
      >
        <svg lucideMessageCircle size="26" aria-hidden="true"></svg>
      </a>
    }
    <ro-app-footer />
  `,
})
export class PublicLayout {
  private readonly office = inject(OfficeStore);
  protected readonly links = LINKS;

  constructor() {
    this.office.load();
  }

  protected whatsapp(): string | null {
    return this.office.whatsappLink('مرحبًا، أريد الاستفسار عن خدمة');
  }
}
