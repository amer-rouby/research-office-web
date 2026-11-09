import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { ExpertTask } from '@core/api/api-types';
import { AuthSessionStore } from '@core/auth/auth-session.store';
import { createLoader } from '@core/data/loader';
import { CellDef, Column, DataTable } from '@shared/data-table/data-table';
import { formatDate } from '@shared/pipes/format.pipes';
import { Card } from '@shared/ui/card';
import { PageHeader } from '@shared/ui/page-header';
import { EmptyState, LoadError, Loading } from '@shared/ui/state-views';
import { StatusBadge } from '@shared/ui/status-badge';
import { ExpertTasksApi } from './expert-tasks.api';

const COLUMNS: readonly Column<ExpertTask>[] = [
  {
    key: 'reference',
    header: 'الرقم',
    value: (t) => t.reference,
    class: 'whitespace-nowrap font-medium',
  },
  { key: 'service', header: 'الخدمة', value: (t) => t.serviceName },
  { key: 'status', header: 'الحالة' },
  {
    key: 'deadline',
    header: 'التسليم',
    value: (t) => formatDate(t.deadline),
    class: 'hidden sm:table-cell',
  },
];

const ACTIVE = new Set(['ACCEPTED', 'IN_PROGRESS', 'REVISION', 'IN_REVIEW']);

@Component({
  selector: 'ro-expert-tasks-page',
  imports: [PageHeader, Card, DataTable, CellDef, StatusBadge, Loading, LoadError, EmptyState],
  host: { class: 'mx-auto flex w-full max-w-5xl flex-col gap-6' },
  template: `
    <ro-page-header [title]="'أهلًا ' + (user()?.fullName ?? '')" subtitle="المهام المسندة إليك." />

    @if (tasks.loading() && !tasks.data()) {
      <ro-loading />
    } @else if (tasks.error()) {
      <ro-load-error [message]="tasks.error()!" (retry)="tasks.reload()" />
    } @else {
      @for (group of groups(); track group.title) {
        <ro-card [title]="group.title + ' (' + group.rows.length + ')'" flush>
          @if (group.rows.length) {
            <ro-data-table [columns]="columns" [rows]="group.rows" (rowClick)="open($event)">
              <ng-template roCell="status" let-row
                ><ro-status-badge [status]="row.status"
              /></ng-template>
            </ro-data-table>
          } @else {
            <ro-empty-state [title]="group.empty" />
          }
        </ro-card>
      }
    }
  `,
})
export class ExpertTasksPage {
  private readonly api = inject(ExpertTasksApi);
  private readonly router = inject(Router);
  protected readonly user = inject(AuthSessionStore).user;
  protected readonly columns = COLUMNS;
  protected readonly tasks = createLoader(() => this.api.list());
  protected readonly groups = computed(() => {
    const all = this.tasks.data() ?? [];
    return [
      {
        title: 'مهام جارية',
        empty: 'لا توجد مهام جارية الآن',
        rows: all.filter((t) => ACTIVE.has(t.status)),
      },
      {
        title: 'مهام سابقة',
        empty: 'لا توجد مهام سابقة',
        rows: all.filter((t) => !ACTIVE.has(t.status)),
      },
    ];
  });

  constructor() {
    this.tasks.reload();
  }

  protected open(task: ExpertTask): void {
    void this.router.navigate(['/expert/tasks', task.id]);
  }
}
