import { Component, computed, effect, inject, input, signal } from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideMessageCircle } from '@lucide/angular';
import { Observable } from 'rxjs';
import type { FileKind, FileView, OrderDetail, OrderStatus } from '@core/api/api-types';
import { createLoader, errorMessage } from '@core/data/loader';
import { STATUS } from '@core/orders/order-status';
import { FormField } from '@shared/forms/form-field';
import { Input } from '@shared/forms/input';
import { DatePipe, DateTimePipe } from '@shared/pipes/format.pipes';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';
import { CopyButton } from '@shared/ui/copy-button';
import { FileDrop } from '@shared/ui/file-drop';
import { FileList } from '@shared/ui/file-list';
import { LoadError, Loading } from '@shared/ui/state-views';
import { StatusBadge } from '@shared/ui/status-badge';
import { Timeline } from '@shared/ui/timeline';
import { StaffApi } from '../staff/staff.api';
import { AdminOrdersApi } from './admin-orders.api';
import { PaymentsCard } from './payments-card';
import { Dialogs } from '@shared/ui/dialog.service';

/** Steps that need a confirmation, with what they mean for the client. */
const CONFIRM: Partial<
  Record<OrderStatus, { title: string; message: string; confirmText: string; danger?: boolean }>
> = {
  DELIVERED: {
    title: 'تسليم الطلب للعميل؟',
    message: 'سيظهر للعميل أن عمله جاهز ويمكنه تحميل الملفات المرسلة له.',
    confirmText: 'تسليم',
  },
  CLOSED: {
    title: 'إغلاق الطلب؟',
    message: 'لن تظهر للطلب خطوات أخرى بعد الإغلاق.',
    confirmText: 'إغلاق الطلب',
  },
  CANCELLED: {
    title: 'إلغاء الطلب؟',
    message: 'سيتم إيقاف الطلب نهائيًا ولن يمكن إكماله.',
    confirmText: 'إلغاء الطلب',
    danger: true,
  },
};

const ACTION_ORDER: OrderStatus[] = [
  'ACCEPTED',
  'DELIVERED',
  'IN_PROGRESS',
  'IN_REVIEW',
  'REVISION',
  'NEW',
  'CLOSED',
  'CANCELLED',
];

const CURRENCIES = ['QAR', 'SAR', 'AED', 'KWD', 'OMR', 'BHD', 'USD', 'EGP'];

/** Everything about one request: client, quote, status actions, notes, files, history. */
@Component({
  selector: 'ro-order-detail-page',
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    Input,
    Button,
    Alert,
    Card,
    CopyButton,
    FileDrop,
    FileList,
    StatusBadge,
    Timeline,
    Loading,
    LoadError,
    DatePipe,
    DateTimePipe,
    LucideArrowRight,
    LucideMessageCircle,
    PaymentsCard,
  ],
  template: `
    <a
      routerLink="/admin/requests"
      class="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
    >
      <svg lucideArrowRight size="16" aria-hidden="true"></svg> كل الطلبات
    </a>

    @if (order.loading() && !order.data()) {
      <ro-loading />
    } @else if (order.error() && !order.data()) {
      <ro-load-error [message]="order.error()!" (retry)="order.reload()" />
    } @else if (order.data(); as o) {
      <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-sm text-ink-muted">
            <bdi>{{ o.reference }}</bdi>
          </p>
          <h1 class="mt-1 text-2xl font-bold text-ink">{{ o.serviceName }}</h1>
          <p class="mt-1 text-sm text-ink-subtle">
            أُرسل {{ o.createdAt | roDateTime }}
            @if (o.deadline) {
              · التسليم المطلوب {{ o.deadline | roDate }}
            }
          </p>
        </div>
        <ro-status-badge [status]="o.status" />
      </header>

      @if (actionError()) {
        <ro-alert kind="danger" class="mb-4">{{ actionError() }}</ro-alert>
      }

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="flex flex-col gap-6 lg:col-span-2">
          <ro-card title="تفاصيل الطلب">
            <p class="leading-relaxed whitespace-pre-line text-ink" dir="auto">{{ o.details }}</p>
          </ro-card>

          @if (o.status === 'NEW' || o.status === 'QUOTED') {
            <ro-card [title]="o.quote ? 'تعديل عرض السعر' : 'إرسال عرض سعر'">
              <form
                class="grid gap-4 sm:grid-cols-3"
                [formGroup]="quoteForm"
                (ngSubmit)="sendQuote()"
                novalidate
              >
                <ro-form-field label="السعر" [control]="quoteForm.controls.price" required>
                  <input
                    roInput
                    type="number"
                    min="1"
                    step="0.01"
                    formControlName="price"
                    dir="ltr"
                  />
                </ro-form-field>
                <ro-form-field label="العملة" [control]="quoteForm.controls.currency" required>
                  <select roInput formControlName="currency">
                    @for (c of currencies; track c) {
                      <option [value]="c">{{ c }}</option>
                    }
                  </select>
                </ro-form-field>
                <ro-form-field
                  label="ملاحظة للعميل"
                  class="sm:col-span-3"
                  [control]="quoteForm.controls.note"
                >
                  <input
                    roInput
                    formControlName="note"
                    placeholder="مثل: التسليم خلال 5 أيام عمل"
                  />
                </ro-form-field>
                <div class="sm:col-span-3">
                  <button roButton type="submit" [loading]="busy()">إرسال العرض</button>
                </div>
              </form>
            </ro-card>
          }

          @if (o.quote; as q) {
            <ro-payments-card
              [order]="o"
              [quote]="q"
              [busy]="busy()"
              (add)="run(api.addPayment(id(), $event))"
              (remove)="run(api.deletePayment(id(), $event.id))"
            />
          }

          <ro-card title="الملفات">
            @if (o.files.length) {
              <ro-file-list
                [files]="o.files"
                [canPublish]="true"
                (download)="download($event)"
                (publish)="publish($event)"
              />
            } @else {
              <p class="text-sm text-ink-subtle">لا توجد ملفات.</p>
            }
            <div class="mt-4 flex flex-col gap-3 border-t pt-4">
              <ro-file-drop [(files)]="newFiles" />
              @if (newFiles().length) {
                <div class="flex flex-wrap items-center gap-3">
                  <select roInput class="!w-auto" [(ngModel)]="uploadKind" aria-label="نوع الملف">
                    <option value="DELIVERABLE">تسليم للعميل</option>
                    <option value="INTERNAL">ملف داخلي</option>
                  </select>
                  <button roButton variant="secondary" [loading]="busy()" (click)="upload()">
                    رفع
                  </button>
                </div>
              }
            </div>
          </ro-card>

          <ro-card title="سجل الطلب">
            <ro-timeline [entries]="o.timeline" [showVisibility]="true" />
          </ro-card>
        </div>

        <aside class="flex flex-col gap-6">
          <ro-card title="العميل">
            <dl class="flex flex-col gap-3 text-sm">
              <div>
                <dt class="text-ink-subtle">الاسم</dt>
                <dd class="font-medium text-ink">{{ o.clientName }}</dd>
              </div>
              <div>
                <dt class="text-ink-subtle">الهاتف</dt>
                <dd class="text-ink" dir="ltr">{{ o.clientPhone }}</dd>
              </div>
              @if (o.clientEmail) {
                <div>
                  <dt class="text-ink-subtle">البريد</dt>
                  <dd class="break-all text-ink" dir="ltr">{{ o.clientEmail }}</dd>
                </div>
              }
              @if (o.country) {
                <div>
                  <dt class="text-ink-subtle">الدولة</dt>
                  <dd class="text-ink">{{ o.country }}</dd>
                </div>
              }
            </dl>
            <a
              roButton
              variant="secondary"
              block
              class="mt-4"
              [href]="whatsapp()"
              target="_blank"
              rel="noopener"
            >
              <svg lucideMessageCircle size="16" aria-hidden="true"></svg> مراسلة على واتساب
            </a>
            <div
              class="mt-3 flex items-center justify-between gap-2 rounded-xl bg-surface-sunken px-3 py-2"
            >
              <span class="text-xs text-ink-muted">رابط متابعة العميل</span>
              <ro-copy-button [value]="o.trackingUrl" label="نسخ" />
            </div>
          </ro-card>

          <ro-card title="الخبير المسؤول">
            <div class="flex flex-col gap-3">
              @if (o.assignedExpert; as e) {
                <p class="text-sm text-ink">
                  مُسند إلى <strong>{{ e.fullName }}</strong>
                </p>
              } @else {
                <p class="text-sm text-ink-subtle">لم يُسند لخبير بعد.</p>
              }
              @if (experts().length) {
                <div class="flex gap-2">
                  <select roInput [(ngModel)]="expertId" aria-label="اختر الخبير">
                    <option value="">اختر الخبير</option>
                    @for (x of experts(); track x.id) {
                      <option [value]="x.id">{{ x.fullName }}</option>
                    }
                  </select>
                  <button
                    roButton
                    variant="secondary"
                    [disabled]="!expertId() || expertId() === o.assignedExpert?.id || busy()"
                    (click)="assign()"
                  >
                    {{ o.assignedExpert ? 'تغيير' : 'إسناد' }}
                  </button>
                </div>
              } @else {
                <a routerLink="/admin/experts" class="text-sm text-primary hover:underline"
                  >أضف خبيرًا أولًا</a
                >
              }
            </div>
          </ro-card>

          <ro-card title="تحديث الطلب">
            <div class="flex flex-col gap-4">
              <ro-form-field label="ملاحظة (اختياري)">
                <textarea roInput rows="3" [(ngModel)]="note"></textarea>
              </ro-form-field>
              <label class="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  class="size-4 accent-primary"
                  [(ngModel)]="visibleToClient"
                />
                تظهر للعميل
              </label>
              <div class="flex flex-wrap gap-2">
                @for (s of actions(); track s) {
                  <button
                    roButton
                    size="sm"
                    [variant]="s === 'CANCELLED' ? 'danger' : $first ? 'primary' : 'secondary'"
                    [disabled]="busy() || (s === 'DELIVERED' && !hasDeliverable())"
                    (click)="move(s)"
                  >
                    {{ label(s) }}
                  </button>
                }
                <button
                  roButton
                  size="sm"
                  variant="secondary"
                  [disabled]="busy() || note().trim().length === 0"
                  (click)="saveNote()"
                >
                  حفظ الملاحظة فقط
                </button>
              </div>
              @if (actions().includes('DELIVERED') && !hasDeliverable()) {
                <p class="rounded-xl bg-warning-soft px-3 py-2 text-xs text-ink">
                  للتسليم: اضغط «للعميل» بجانب ملف واحد على الأقل في قسم الملفات.
                </p>
              }
              @if (!actions().length) {
                <p class="text-xs text-ink-subtle">لا توجد خطوات تالية لهذه الحالة.</p>
              }
            </div>
          </ro-card>
        </aside>
      </div>
    }
  `,
})
export class OrderDetailPage {
  /** Route param `:id`. */
  readonly id = input.required<string>();

  protected readonly api = inject(AdminOrdersApi);
  private readonly dialogs = inject(Dialogs);
  private readonly staffApi = inject(StaffApi);
  private readonly staff = createLoader(() => this.staffApi.list('EXPERT'));
  protected readonly experts = computed(() => (this.staff.data() ?? []).filter((x) => x.active));
  protected readonly expertId = signal('');
  protected readonly currencies = CURRENCIES;
  protected readonly order = createLoader(() => this.api.detail(this.id()));
  protected readonly busy = signal(false);
  protected readonly actionError = signal<string | null>(null);
  protected readonly note = signal('');
  protected readonly visibleToClient = signal(true);
  protected readonly newFiles = signal<File[]>([]);
  protected readonly uploadKind = signal<FileKind>('DELIVERABLE');

  protected readonly quoteForm = inject(NonNullableFormBuilder).group({
    price: [null as number | null, [Validators.required, Validators.min(1)]],
    currency: ['QAR', Validators.required],
    note: ['', Validators.maxLength(1000)],
  });

  /** Next statuses offered as buttons; quoting has its own form. */
  protected readonly hasDeliverable = computed(() =>
    (this.order.data()?.files ?? []).some((f) => f.kind === 'DELIVERABLE'),
  );
  protected readonly remaining = computed(() => {
    const o = this.order.data();
    return o?.quote ? Math.max(o.quote.price - o.paidTotal, 0) : 0;
  });
  protected readonly actions = computed(() =>
    (this.order.data()?.nextStatuses ?? [])
      .filter((s) => s !== 'QUOTED')
      // the main forward step first; closing and cancelling last so a double click can't hit them
      .sort((a, b) => ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b)),
  );
  protected readonly whatsapp = computed(() => {
    const o = this.order.data();
    if (!o) return '';
    const text = `مرحبًا ${o.clientName}، يمكنك متابعة طلبك ${o.reference} من هنا: ${o.trackingUrl}`;
    return `https://wa.me/${o.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  });

  constructor() {
    this.staff.reload();
    effect(() => this.expertId.set(this.order.data()?.assignedExpert?.id ?? ''));
    effect(() => {
      this.id();
      this.order.reload();
    });
    effect(() => {
      const q = this.order.data()?.quote;
      if (q)
        this.quoteForm.patchValue({ price: q.price, currency: q.currency, note: q.note ?? '' });
    });
  }

  protected label(s: OrderStatus): string {
    return STATUS[s].action;
  }

  protected sendQuote(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }
    const v = this.quoteForm.getRawValue();
    this.run(this.api.quote(this.id(), { ...v, price: Number(v.price), note: v.note || null }));
  }

  protected move(status: OrderStatus): void {
    const change = () =>
      this.run(
        this.api.changeStatus(this.id(), {
          status,
          note: this.note().trim() || null,
          visibleToClient: this.visibleToClient(),
        }),
      );
    const ask = CONFIRM[status];
    if (!ask) return change();
    const owed = this.remaining();
    const message =
      status === 'CLOSED' && owed > 0
        ? `${ask.message} تنبيه: ما زال على العميل ${owed} ${this.order.data()?.quote?.currency ?? ''}.`
        : ask.message;
    this.dialogs.confirm({ ...ask, message }).subscribe((ok) => ok && change());
  }

  protected saveNote(): void {
    this.run(
      this.api.addNote(this.id(), {
        note: this.note().trim(),
        visibleToClient: this.visibleToClient(),
      }),
    );
  }

  protected upload(): void {
    this.run(this.api.upload(this.id(), this.uploadKind(), this.newFiles()), () =>
      this.newFiles.set([]),
    );
  }

  protected assign(): void {
    this.run(this.api.assign(this.id(), this.expertId()));
  }

  protected publish(file: FileView): void {
    this.dialogs
      .confirm({
        title: 'إرسال الملف للعميل؟',
        message: `سيظهر «${file.name}» في صفحة متابعة العميل ويمكنه تحميله.`,
        confirmText: 'إرسال للعميل',
      })
      .subscribe((ok) => ok && this.run(this.api.publish(this.id(), file)));
  }

  protected download(file: FileView): void {
    this.api
      .download(this.id(), file)
      .subscribe({ error: (e: unknown) => this.actionError.set(errorMessage(e)) });
  }

  protected run(call: Observable<OrderDetail>, after?: () => void): void {
    this.busy.set(true);
    this.actionError.set(null);
    call.subscribe({
      next: (detail) => {
        this.order.set(detail);
        this.busy.set(false);
        this.note.set('');
        after?.();
      },
      error: (e: unknown) => {
        this.actionError.set(errorMessage(e));
        this.busy.set(false);
      },
    });
  }
}
