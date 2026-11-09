import { Component, computed, inject } from '@angular/core';
import { LucideLogOut } from '@lucide/angular';
import { AuthSessionStore } from '@core/auth/auth-session.store';
import { AuthService } from '@core/auth/auth.service';

const ROLE_LABEL = { ADMIN: 'مدير', EXPERT: 'خبير' } as const;

/** Signed-in user's initials, name, role and a sign-out button. Renders nothing for guests. */
@Component({
  selector: 'ro-user-menu',
  imports: [LucideLogOut],
  template: `
    @if (user(); as u) {
      <div class="flex items-center gap-3">
        <span
          class="grid size-9 shrink-0 place-items-center rounded-full bg-accent-100 text-sm font-semibold text-accent-800"
          aria-hidden="true"
          >{{ initials() }}</span
        >
        <div class="hidden min-w-0 leading-tight sm:block">
          <p class="truncate text-sm font-medium text-ink">{{ u.fullName }}</p>
          <p class="text-xs text-ink-subtle">{{ roleLabel[u.role] }}</p>
        </div>
        <button
          type="button"
          class="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-sunken hover:text-danger"
          aria-label="تسجيل الخروج"
          title="تسجيل الخروج"
          (click)="auth.logout()"
        >
          <svg lucideLogOut size="18" class="rtl:-scale-x-100" aria-hidden="true"></svg>
        </button>
      </div>
    }
  `,
})
export class UserMenu {
  protected readonly auth = inject(AuthService);
  protected readonly user = inject(AuthSessionStore).user;
  protected readonly roleLabel = ROLE_LABEL;
  protected readonly initials = computed(() =>
    (this.user()?.fullName ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join(''),
  );
}
