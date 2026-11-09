import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideClipboardCheck,
  LucideAlarmClock,
  LucideClock,
  LucideDynamicIcon,
  LucideFileWarning,
  LucideHammer,
  LucideIcon,
  LucideInbox,
  LucideSend,
} from '@lucide/angular';
import type { OrderStatus, OrderSummary } from '@core/api/api-types';
import { AuthSessionStore } from '@core/auth/auth-session.store';
import { createLoader } from '@core/data/loader';
import { CellDef, DataTable } from '@shared/data-table/data-table';
import { Card } from '@shared/ui/card';
import { PageHeader } from '@shared/ui/page-header';
import { EmptyState, LoadError, Loading } from '@shared/ui/state-views';
import { StatusBadge } from '@shared/ui/status-badge';
import { AdminOrdersApi } from './orders/admin-orders.api';
import { ORDER_COLUMNS } from './orders/order-columns';
import { formatMoney } from '@shared/pipes/format.pipes';

/** Icon chip colours by meaning. */
const TONE = {
  info: 'bg-brand-50 text-primary dark:bg-brand-900',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
};

const TILES: readonly {
  label: string;
  hint: string;
  statuses: OrderStatus[];
  icon: LucideIcon;
  tone: string;
}[] = [
  {
    label: 'طلبات جديدة',
    hint: 'تحتاج عرض سعر',
    statuses: ['NEW'],
    icon: LucideInbox,
    tone: TONE.info,
  },
  {
    label: 'بانتظار العميل',
    hint: 'عرض سعر لم يُقبل بعد',
    statuses: ['QUOTED'],
    icon: LucideClock,
    tone: TONE.warning,
  },
  {
    label: 'قيد التنفيذ',
    hint: 'مقبولة أو جارٍ العمل عليها',
    statuses: ['IN_PROGRESS', 'ACCEPTED'],
    icon: LucideHammer,
    tone: TONE.info,
  },
  {
    label: 'طلبات تعديل',
    hint: 'العميل طلب تعديلًا',
    statuses: ['REVISION'],
    icon: LucideFileWarning,
    tone: TONE.danger,
  },
  {
    label: 'مراجعة الجودة',
    hint: 'جاهزة للمراجعة قبل التسليم',
    statuses: ['IN_REVIEW'],
    icon: LucideClipboardCheck,
    tone: TONE.warning,
  },
  {
    label: 'تم التسليم',
    hint: 'بانتظار تأكيد العميل',
    statuses: ['DELIVERED'],
    icon: LucideSend,
    tone: TONE.success,
  },
];

@Component({
  selector: 'ro-dashboard-page',
  imports: [
    RouterLink,
    PageHeader,
    Card,
    DataTable,
    CellDef,
    StatusBadge,
    Loading,
    LoadError,
    EmptyState,
    LucideDynamicIcon,
  ],
  host: { class: 'flex flex-col gap-6' },
  template: `
    <ro-page-header [title]="greeting()" subtitle="نظرة سريعة على ما يحتاج متابعتك اليوم." />

    @if (stats.error()) {
      <ro-load-error [message]="stats.error()!" (retry)="stats.reload()" />
    }
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      @for (t of tiles(); track t.label) {
        <a
          [routerLink]="['/admin/requests']"
          [queryParams]="{ status: t.statuses[0] }"
          class="group flex items-center gap-4 rounded-2xl border bg-surface-raised p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lift"
        >
          <span class="grid size-12 shrink-0 place-items-center rounded-xl" [class]="t.tone">
            <svg [lucideIcon]="t.icon" size="22" aria-hidden="true"></svg>
          </span>
          <div class="min-w-0">
            <p class="text-sm text-ink-muted">{{ t.label }}</p>
            <p class="text-3xl font-bold text-ink">{{ t.count ?? '—' }}</p>
            <p class="truncate text-xs text-ink-subtle">{{ t.hint }}</p>
          </div>
        </a>
      }
    </div>

    @if (stats.data(); as s) {
      <!-- money and deadlines -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (m of s.money; track m.currency) {
          <div class="rounded-2xl border bg-surface-raised p-5 shadow-soft">
            <p class="text-sm text-ink-muted">المحصّل هذا الشهر</p>
            <p class="mt-1 text-2xl font-bold text-success">
              <bdi>{{ money(m.collectedThisMonth, m.currency) }}</bdi>
            </p>
            <p class="mt-3 text-sm text-ink-muted">مستحق على العملاء</p>
            <p
              class="mt-1 text-lg font-semibold"
              [class]="m.outstanding > 0 ? 'text-warning' : 'text-ink'"
            >
              <bdi>{{ money(m.outstanding, m.currency) }}</bdi>
            </p>
          </div>
        } @empty {
          <div class="rounded-2xl border bg-surface-raised p-5 text-sm text-ink-muted shadow-soft">
            لا توجد مدفوعات أو مستحقات بعد.
          </div>
        }
        <a
          routerLink="/admin/requests"
          [queryParams]="{ status: 'IN_PROGRESS' }"
          class="flex items-center gap-4 rounded-2xl border bg-surface-raised p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary"
        >
          <span
            class="grid size-12 shrink-0 place-items-center rounded-xl"
            [class]="s.dueSoon ? tone.danger : tone.success"
          >
            <svg [lucideIcon]="dueIcon" size="22" aria-hidden="true"></svg>
          </span>
          <div>
            <p class="text-sm text-ink-muted">تسليمها خلال 3 أيام</p>
            <p class="text-3xl font-bold text-ink">{{ s.dueSoon }}</p>
            <p class="text-xs text-ink-subtle">طلبات جارية قرب موعدها</p>
          </div>
        </a>
      </div>
    }

    <ro-card title="أحدث الطلبات" flush>
      <a actions routerLink="/admin/requests" class="text-sm text-primary hover:underline"
        >عرض الكل</a
      >
      @if (recent.loading() && !recent.data()) {
        <div class="p-5"><ro-loading /></div>
      } @else if (recent.data()?.items?.length) {
        <ro-data-table [columns]="columns" [rows]="recent.data()!.items" (rowClick)="open($event)">
          <ng-template roCell="status" let-row
            ><ro-status-badge [status]="row.status"
          /></ng-template>
        </ro-data-table>
      } @else {
        <ro-empty-state
          title="لا توجد طلبات بعد"
          description="شارك رابط صفحة الطلب مع عملائك لتبدأ الطلبات بالوصول."
        />
      }
    </ro-card>
  `,
})
export class DashboardPage {
  private readonly api = inject(AdminOrdersApi);
  private readonly router = inject(Router);
  private readonly user = inject(AuthSessionStore).user;

  protected readonly columns = ORDER_COLUMNS;
  protected readonly stats = createLoader(() => this.api.stats());
  protected readonly recent = createLoader(() => this.api.list({ page: 0, size: 6 }));
  protected readonly greeting = computed(() => `أهلًا ${this.user()?.fullName ?? ''}`);
  protected readonly tone = TONE;
  protected readonly dueIcon = LucideAlarmClock;
  protected money(price: number, currency: string): string {
    return formatMoney({ price, currency });
  }

  protected readonly tiles = computed(() => {
    const by = this.stats.data()?.byStatus;
    return TILES.map((t) => ({
      ...t,
      count: by ? t.statuses.reduce((n, s) => n + (by[s] ?? 0), 0) : undefined,
    }));
  });

  constructor() {
    this.stats.reload();
    this.recent.reload();
  }

  protected open(order: OrderSummary): void {
    void this.router.navigate(['/admin/requests', order.id]);
  }
}
