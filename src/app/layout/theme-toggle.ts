import { Component, inject } from '@angular/core';
import { LucideMoon, LucideSun } from '@lucide/angular';
import { ThemeService } from '@core/theme/theme.service';

@Component({
  selector: 'ro-theme-toggle',
  imports: [LucideMoon, LucideSun],
  template: `
    <button
      type="button"
      class="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-sunken hover:text-ink"
      [attr.aria-label]="theme.theme() === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'"
      (click)="theme.toggle()"
    >
      @if (theme.theme() === 'dark') {
        <svg lucideSun size="18" aria-hidden="true"></svg>
      } @else {
        <svg lucideMoon size="18" aria-hidden="true"></svg>
      }
    </button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
}
