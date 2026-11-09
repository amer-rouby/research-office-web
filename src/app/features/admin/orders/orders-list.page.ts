import { Component, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideExternalLink } from '@lucide/angular';
import type { OrderStatus, OrderSummary } from '@core/api/api-types';
import { createLoader } from '@core/data/loader';
import { ALL_STATUSES, STATUS } from '@core/orders/order-status';
import { CellDef, DataTable } from '@shared/data-table/data-table';
import { FilterOption, FilterTabs, SearchBox } from '@shared/data-table/filters';
import { Pager } from '@shared/data-table/pager';
import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';
import { PageHeader } from '@shared/ui/page-header';
import { EmptyState, LoadError, Loading } from '@shared/ui/state-views';
import { StatusBadge } from '@shared/ui/status-badge';
import { AdminOrdersApi } from './admin-orders.api';
import { ORDER_COLUMNS } from './order-columns';

const PAGE_SIZE = 20;

/** Requests list. Filters live in the URL (?status=&q=&page=) so they survive reloads and links. */
@Component({
  selector: 'ro-orders-list-page',
  imports: [
    RouterLink,
    PageHeader,
    Card,
    Button,
    DataTable,
    CellDef,
    FilterTabs,
    SearchBox,
    Pager,
    StatusBadge,
    Loading,
    LoadError,
    EmptyState,
    LucideExternalLink,
  ],
  host: { class: 'flex flex-col gap-5' },
  template: `
    <ro-page-header title="الطلبات" subtitle="كل طلبات العملاء، من الاستلام حتى الإغلاق.">
      <a roButton variant="secondary" actions routerLink="/request" target="_blank">
        <svg lucideExternalLink size="16" aria-hidden="true"></svg> صفحة الطلب العامة
      </a>
    </ro-page-header>

    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <ro-filter-tabs
        [options]="statusOptions()"
        [value]="status() ?? ''"
        (valueChange)="go({ status: $event || null, page: 0 })"
      />
      <ro-search-box
        class="lg:w-72"
        placeholder="بحث بالاسم أو الرقم أو الهاتف"
        [value]="q() ?? ''"
        (search)="go({ q: $event || null, page: 0 })"
      />
    </div>

    <ro-card flush>
      @if (orders.loading() && !orders.data()) {
        <div class="p-5"><ro-loading /></div>
      } @else if (orders.error()) {
        <div class="p-5">
          <ro-load-error [message]="orders.error()!" (retry)="orders.reload()" />
        </div>
      } @else if (orders.data(); as p) {
        @if (p.items.length) {
          <ro-data-table [columns]="columns" [rows]="p.items" (rowClick)="open($event)">
            <ng-template roCell="status" let-row>
              <ro-status-badge [status]="row.status" />
            </ng-template>
          </ro-data-table>
          <ro-pager
            class="border-t"
            [page]="p.page"
            [size]="p.size"
            [total]="p.total"
            (pageChange)="go({ page: $event })"
          />
        } @else {
          <ro-empty-state title="لا توجد طلبات" description="لا توجد طلبات تطابق هذا الفلتر." />
        }
      }
    </ro-card>
  `,
})
export class OrdersListPage {
  /** Query params bound as inputs. */
  readonly status = input<OrderStatus | null>(null);
  readonly q = input<string | null>(null);
  readonly page = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });

  private readonly api = inject(AdminOrdersApi);
  private readonly router = inject(Router);

  protected readonly columns = ORDER_COLUMNS;
  protected readonly orders = createLoader(() =>
    this.api.list({ status: this.status(), q: this.q() ?? '', page: this.page(), size: PAGE_SIZE }),
  );
  private readonly stats = createLoader(() => this.api.stats());

  protected readonly statusOptions = computed<FilterOption<string>[]>(() => {
    const counts = this.stats.data();
    return [
      { value: '', label: 'الكل', count: counts?.total },
      ...ALL_STATUSES.map((s) => ({
        value: s,
        label: STATUS[s].label,
        count: counts?.byStatus[s],
      })),
    ];
  });

  constructor() {
    this.stats.reload();
    effect(() => {
      this.status();
      this.q();
      this.page();
      this.orders.reload();
    });
  }

  protected go(params: { status?: string | null; q?: string | null; page?: number }): void {
    void this.router.navigate([], { queryParams: params, queryParamsHandling: 'merge' });
  }

  protected open(order: OrderSummary): void {
    void this.router.navigate(['/admin/requests', order.id]);
  }
}
