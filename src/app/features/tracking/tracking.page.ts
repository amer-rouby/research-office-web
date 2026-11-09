import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideFileSearch } from '@lucide/angular';
import { Observable } from 'rxjs';
import type { FileView, TrackingView } from '@core/api/api-types';
import { createLoader, errorMessage } from '@core/data/loader';
import { CLIENT_STEPS, STATUS, stepOf } from '@core/orders/order-status';
import { PublicOrdersApi } from '@core/orders/public-orders.api';
import { FormField } from '@shared/forms/form-field';
import { Input } from '@shared/forms/input';
import { DatePipe, MoneyPipe } from '@shared/pipes/format.pipes';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Balance } from '@shared/ui/balance';
import { Card } from '@shared/ui/card';
import { FileDrop } from '@shared/ui/file-drop';
import { FileList } from '@shared/ui/file-list';
import { ProgressSteps } from '@shared/ui/progress-steps';
import { EmptyState, Loading } from '@shared/ui/state-views';
import { StatusBadge } from '@shared/ui/status-badge';
import { Timeline } from '@shared/ui/timeline';

/** The client's page, opened from the private link: status, quote, files and actions. */
@Component({
  selector: 'ro-tracking-page',
  imports: [
    FormsModule,
    FormField,
    Input,
    Button,
    Alert,
    Card,
    Balance,
    FileDrop,
    FileList,
    ProgressSteps,
    StatusBadge,
    Timeline,
    Loading,
    EmptyState,
    DatePipe,
    MoneyPipe,
  ],
  template: `
    <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      @if (order.loading() && !order.data()) {
        <ro-loading />
      } @else if (order.error() && !order.data()) {
        <ro-card>
          <ro-empty-state
            [icon]="notFoundIcon"
            title="لم نجد هذا الطلب"
            description="تأكد من الرابط المرسل إليك، أو تواصل معنا على واتساب."
          />
        </ro-card>
      } @else if (order.data(); as o) {
        <header class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm text-ink-muted">
              طلب رقم <span dir="ltr">{{ o.reference }}</span>
            </p>
            <h1 class="mt-1 text-2xl font-bold text-ink">{{ o.serviceName }}</h1>
            <p class="mt-1 text-sm text-ink-subtle">
              أهلًا {{ o.clientName }} · أُرسل في {{ o.createdAt | roDate }}
              @if (o.deadline) {
                · التسليم المطلوب {{ o.deadline | roDate }}
              }
            </p>
          </div>
          <ro-status-badge [status]="o.status" />
        </header>

        <ro-card>
          @if (o.status === 'CANCELLED') {
            <ro-alert kind="danger">{{ hint() }}</ro-alert>
          } @else {
            <ro-progress-steps [steps]="steps" [current]="step()" />
            <p class="mt-6 rounded-xl bg-surface-sunken px-4 py-3 text-center text-sm text-ink">
              {{ hint() }}
            </p>
          }
        </ro-card>

        @if (actionError()) {
          <ro-alert kind="danger">{{ actionError() }}</ro-alert>
        }

        @if (o.quote; as q) {
          <ro-card title="عرض السعر">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-3xl font-bold text-ink">{{ q | roMoney }}</p>
                @if (q.note) {
                  <p class="mt-1 text-sm text-ink-muted">{{ q.note }}</p>
                }
                @if (o.paidTotal > 0) {
                  <ro-balance class="mt-3 min-w-64" [quote]="q" [paid]="o.paidTotal" />
                }
              </div>
              @if (o.status === 'QUOTED') {
                <button
                  roButton
                  size="lg"
                  [loading]="busy()"
                  (click)="run(api.acceptQuote(token()))"
                >
                  قبول العرض والبدء
                </button>
              }
            </div>
          </ro-card>
        }

        @if (o.status === 'DELIVERED') {
          <ro-card title="استلام العمل">
            <div class="flex flex-col gap-4">
              <p class="text-sm text-ink-muted">
                حمّل ملفاتك من الأسفل. إذا كان كل شيء مناسبًا أكّد الاستلام، أو اكتب ما تريد تعديله.
              </p>
              <ro-form-field label="ملاحظات التعديل (عند الحاجة)">
                <textarea roInput rows="3" [(ngModel)]="revisionNote"></textarea>
              </ro-form-field>
              <div class="flex flex-wrap gap-3">
                <button roButton [loading]="busy()" (click)="run(api.confirm(token()))">
                  تأكيد الاستلام
                </button>
                <button
                  roButton
                  variant="secondary"
                  [disabled]="revisionNote().trim().length < 3 || busy()"
                  (click)="run(api.requestRevision(token(), revisionNote()))"
                >
                  طلب تعديل
                </button>
              </div>
            </div>
          </ro-card>
        }

        <div class="grid gap-6 lg:grid-cols-5">
          <ro-card title="الملفات" class="lg:col-span-3">
            @if (o.files.length) {
              <ro-file-list [files]="o.files" (download)="download($event)" />
            } @else {
              <p class="text-sm text-ink-subtle">لا توجد ملفات بعد.</p>
            }
            @if (canUpload()) {
              <div class="mt-4 flex flex-col gap-3 border-t pt-4">
                <ro-file-drop [(files)]="newFiles" />
                @if (newFiles().length) {
                  <button roButton variant="secondary" [loading]="busy()" (click)="upload()">
                    رفع الملفات
                  </button>
                }
              </div>
            }
          </ro-card>
          <ro-card title="سجل الطلب" class="lg:col-span-2">
            <ro-timeline [entries]="o.timeline" />
          </ro-card>
        </div>
      }
    </div>
  `,
})
export class TrackingPage {
  /** Route param `:token`. */
  readonly token = input.required<string>();

  protected readonly api = inject(PublicOrdersApi);
  protected readonly steps = CLIENT_STEPS;
  protected readonly notFoundIcon = LucideFileSearch;
  protected readonly order = createLoader(() => this.api.track(this.token()));
  protected readonly step = computed(() => stepOf(this.order.data()?.status ?? 'NEW'));
  protected readonly hint = computed(() => STATUS[this.order.data()?.status ?? 'NEW'].clientHint);
  protected readonly canUpload = computed(() => {
    const s = this.order.data()?.status;
    return !!s && s !== 'CLOSED' && s !== 'CANCELLED';
  });

  protected readonly busy = signal(false);
  protected readonly actionError = signal<string | null>(null);
  protected readonly revisionNote = signal('');
  protected readonly newFiles = signal<File[]>([]);

  constructor() {
    effect(() => {
      this.token();
      this.order.reload();
    });
  }

  protected run(call: Observable<TrackingView>): void {
    this.busy.set(true);
    this.actionError.set(null);
    call.subscribe({
      next: (view) => {
        this.order.set(view);
        this.busy.set(false);
        this.revisionNote.set('');
      },
      error: (e: unknown) => {
        this.actionError.set(errorMessage(e));
        this.busy.set(false);
      },
    });
  }

  protected upload(): void {
    this.busy.set(true);
    this.api.upload(this.token(), this.newFiles()).subscribe({
      next: () => {
        this.newFiles.set([]);
        this.busy.set(false);
        this.order.reload();
      },
      error: (e: unknown) => {
        this.actionError.set(errorMessage(e));
        this.busy.set(false);
      },
    });
  }

  protected download(file: FileView): void {
    window.open(this.api.fileUrl(this.token(), file.id), '_blank', 'noopener');
  }
}
