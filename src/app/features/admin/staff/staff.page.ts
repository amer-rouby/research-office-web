import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Role, StaffView } from '@core/api/api-types';
import { AuthSessionStore } from '@core/auth/auth-session.store';
import { ROLE_LABEL } from '@core/auth/roles';
import { createLoader, errorMessage } from '@core/data/loader';
import { CellDef, Column, DataTable } from '@shared/data-table/data-table';
import { FormField } from '@shared/forms/form-field';
import { Input } from '@shared/forms/input';
import { formatDate } from '@shared/pipes/format.pipes';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';
import { PageHeader } from '@shared/ui/page-header';
import { EmptyState, LoadError, Loading } from '@shared/ui/state-views';
import { StaffApi } from './staff.api';
import { Dialogs } from '@shared/ui/dialog.service';

const COLUMNS: readonly Column<StaffView>[] = [
  { key: 'name', header: 'الاسم', value: (s) => s.fullName, class: 'font-medium' },
  { key: 'email', header: 'البريد', value: (s) => s.email, class: 'hidden md:table-cell' },
  { key: 'role', header: 'الدور', value: (s) => ROLE_LABEL[s.role] },
  {
    key: 'since',
    header: 'منذ',
    value: (s) => formatDate(s.createdAt),
    class: 'hidden lg:table-cell',
  },
  { key: 'actions', header: '' },
];

/** Team accounts: experts who do the work and admins who manage requests. */
@Component({
  selector: 'ro-staff-page',
  imports: [
    ReactiveFormsModule,
    PageHeader,
    Card,
    Button,
    Alert,
    FormField,
    Input,
    DataTable,
    CellDef,
    Loading,
    LoadError,
    EmptyState,
  ],
  host: { class: 'flex flex-col gap-6' },
  template: `
    <ro-page-header
      title="الفريق"
      subtitle="الخبراء ينفذون الطلبات المسندة إليهم، والمدير يدير كل شيء."
    />

    @if (error()) {
      <ro-alert kind="danger">{{ error() }}</ro-alert>
    }
    @if (notice()) {
      <ro-alert kind="success">{{ notice() }}</ro-alert>
    }

    <div class="grid gap-6 xl:grid-cols-3">
      <ro-card title="أعضاء الفريق" flush class="xl:col-span-2">
        @if (staff.loading() && !staff.data()) {
          <div class="p-5"><ro-loading /></div>
        } @else if (staff.error()) {
          <div class="p-5">
            <ro-load-error [message]="staff.error()!" (retry)="staff.reload()" />
          </div>
        } @else if (staff.data()?.length) {
          <ro-data-table [columns]="columns" [rows]="staff.data()!" [clickable]="false">
            <ng-template roCell="actions" let-row>
              <div class="flex justify-end gap-1">
                @if (!row.active) {
                  <span
                    class="me-2 self-center rounded-full bg-surface-sunken px-2 py-0.5 text-xs text-ink-muted"
                    >موقوف</span
                  >
                }
                <button roButton size="sm" variant="ghost" (click)="resetPassword(row)">
                  كلمة المرور
                </button>
                @if (row.id !== me()?.id) {
                  <button roButton size="sm" variant="ghost" (click)="toggle(row)">
                    {{ row.active ? 'إيقاف' : 'تفعيل' }}
                  </button>
                }
              </div>
            </ng-template>
          </ro-data-table>
        } @else {
          <ro-empty-state title="لا يوجد أعضاء" />
        }
      </ro-card>

      <ro-card title="إضافة عضو">
        <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="create()" novalidate>
          <ro-form-field label="الاسم" [control]="form.controls.fullName" required>
            <input roInput formControlName="fullName" />
          </ro-form-field>
          <ro-form-field label="البريد الإلكتروني" [control]="form.controls.email" required>
            <input roInput type="email" formControlName="email" dir="ltr" />
          </ro-form-field>
          <ro-form-field
            label="كلمة المرور المؤقتة"
            hint="10 أحرف على الأقل، أرسلها للعضو بطريقة آمنة"
            [control]="form.controls.password"
            required
          >
            <input
              roInput
              type="text"
              formControlName="password"
              dir="ltr"
              autocomplete="new-password"
            />
          </ro-form-field>
          <ro-form-field label="الدور" [control]="form.controls.role" required>
            <select roInput formControlName="role">
              <option value="EXPERT">خبير</option>
              <option value="ADMIN">مدير</option>
            </select>
          </ro-form-field>
          <button roButton type="submit" [loading]="busy()">إضافة</button>
        </form>
      </ro-card>
    </div>
  `,
})
export class StaffPage {
  private readonly api = inject(StaffApi);
  private readonly dialogs = inject(Dialogs);
  protected readonly me = inject(AuthSessionStore).user;
  protected readonly columns = COLUMNS;
  protected readonly staff = createLoader(() => this.api.list());
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10)]],
    role: ['EXPERT' as Role, Validators.required],
  });

  constructor() {
    this.staff.reload();
  }

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.act(this.api.create(this.form.getRawValue()), 'تمت إضافة العضو.', () =>
      this.form.reset({ role: 'EXPERT' }),
    );
  }

  protected toggle(s: StaffView): void {
    this.act(this.api.update(s.id, { fullName: s.fullName, active: !s.active }), null);
  }

  protected resetPassword(s: StaffView): void {
    this.dialogs
      .prompt({
        title: 'تغيير كلمة المرور',
        message: `كلمة مرور جديدة لـ ${s.fullName}. أرسلها له بطريقة آمنة.`,
        label: 'كلمة المرور الجديدة',
        minLength: 10,
      })
      .subscribe(
        (password) =>
          password && this.act(this.api.resetPassword(s.id, password), 'تم تغيير كلمة المرور.'),
      );
  }

  private act(call: import('rxjs').Observable<unknown>, notice: string | null, after?: () => void) {
    this.busy.set(true);
    this.error.set(null);
    this.notice.set(null);
    call.subscribe({
      next: () => {
        this.busy.set(false);
        this.notice.set(notice);
        after?.();
        this.staff.reload();
      },
      error: (e: unknown) => {
        this.busy.set(false);
        this.error.set(errorMessage(e));
      },
    });
  }
}
