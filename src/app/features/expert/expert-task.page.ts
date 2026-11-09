import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { Observable } from 'rxjs';
import type { ExpertTaskDetail, FileView } from '@core/api/api-types';
import { createLoader, errorMessage } from '@core/data/loader';
import { FormField } from '@shared/forms/form-field';
import { Input } from '@shared/forms/input';
import { DatePipe } from '@shared/pipes/format.pipes';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';
import { FileDrop } from '@shared/ui/file-drop';
import { FileList } from '@shared/ui/file-list';
import { LoadError, Loading } from '@shared/ui/state-views';
import { StatusBadge } from '@shared/ui/status-badge';
import { Timeline } from '@shared/ui/timeline';
import { ExpertTasksApi } from './expert-tasks.api';

/** One task for the expert: the brief, client files, upload work, submit for review. */
@Component({
  selector: 'ro-expert-task-page',
  imports: [
    RouterLink,
    FormsModule,
    FormField,
    Input,
    Button,
    Alert,
    Card,
    FileDrop,
    FileList,
    StatusBadge,
    Timeline,
    Loading,
    LoadError,
    DatePipe,
    LucideArrowRight,
  ],
  host: { class: 'mx-auto block w-full max-w-5xl' },
  template: `
    <a
      routerLink="/expert"
      class="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
    >
      <svg lucideArrowRight size="16" aria-hidden="true"></svg> مهامي
    </a>

    @if (task.loading() && !task.data()) {
      <ro-loading />
    } @else if (task.error() && !task.data()) {
      <ro-load-error [message]="task.error()!" (retry)="task.reload()" />
    } @else if (task.data(); as t) {
      <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-sm text-ink-muted">
            <bdi>{{ t.reference }}</bdi>
          </p>
          <h1 class="mt-1 text-2xl font-bold text-ink">{{ t.serviceName }}</h1>
          @if (t.deadline) {
            <p class="mt-1 text-sm text-ink-subtle">التسليم المطلوب {{ t.deadline | roDate }}</p>
          }
        </div>
        <ro-status-badge [status]="t.status" />
      </header>

      @if (actionError()) {
        <ro-alert kind="danger" class="mb-4">{{ actionError() }}</ro-alert>
      }
      @if (t.canStart) {
        <ro-alert kind="info" class="mb-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span>{{
              t.status === 'REVISION'
                ? 'العميل طلب تعديلًا. راجع السجل ثم ابدأ.'
                : 'المهمة جاهزة للبدء.'
            }}</span>
            <button roButton size="sm" [loading]="busy()" (click)="run(api.start(id()))">
              بدء العمل
            </button>
          </div>
        </ro-alert>
      }

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="flex flex-col gap-6 lg:col-span-2">
          <ro-card title="المطلوب">
            <p class="leading-relaxed whitespace-pre-line text-ink" dir="auto">{{ t.details }}</p>
          </ro-card>

          <ro-card title="الملفات">
            @if (t.files.length) {
              <ro-file-list [files]="t.files" (download)="download($event)" />
            } @else {
              <p class="text-sm text-ink-subtle">لا توجد ملفات.</p>
            }
            @if (t.canSubmit) {
              <div class="mt-4 flex flex-col gap-3 border-t pt-4">
                <p class="text-sm text-ink-muted">
                  ارفع عملك هنا. لن يراه العميل قبل مراجعة الإدارة.
                </p>
                <ro-file-drop [(files)]="newFiles" />
                @if (newFiles().length) {
                  <button roButton type="button" [loading]="busy()" (click)="upload()">
                    رفع {{ newFiles().length }} ملف
                  </button>
                }
              </div>
            }
          </ro-card>

          <ro-card title="سجل المهمة">
            <ro-timeline [entries]="t.timeline" [showVisibility]="true" />
          </ro-card>
        </div>

        <aside class="flex flex-col gap-6">
          <ro-card title="ملاحظة">
            <div class="flex flex-col gap-3">
              <ro-form-field label="ملاحظة للإدارة">
                <textarea roInput rows="4" [(ngModel)]="note"></textarea>
              </ro-form-field>
              @if (t.canSubmit) {
                @if (!hasWork()) {
                  <p class="rounded-xl bg-warning-soft px-3 py-2 text-xs text-ink">
                    ارفع ملف عملك أولًا، ثم أرسله للمراجعة.
                  </p>
                }
                <button
                  roButton
                  [disabled]="!hasWork()"
                  [loading]="busy()"
                  (click)="run(api.submit(id(), note().trim() || null))"
                >
                  إرسال للمراجعة
                </button>
              }
              <button
                roButton
                variant="secondary"
                [disabled]="busy() || !note().trim()"
                (click)="run(api.note(id(), note().trim()))"
              >
                حفظ الملاحظة فقط
              </button>
            </div>
          </ro-card>
        </aside>
      </div>
    }
  `,
})
export class ExpertTaskPage {
  /** Route param `:id`. */
  readonly id = input.required<string>();

  protected readonly api = inject(ExpertTasksApi);
  protected readonly task = createLoader(() => this.api.detail(this.id()));
  protected readonly busy = signal(false);
  /** The expert has uploaded at least one work file (required before review). */
  protected readonly hasWork = computed(() =>
    (this.task.data()?.files ?? []).some((f) => f.kind === 'INTERNAL'),
  );
  protected readonly actionError = signal<string | null>(null);
  protected readonly note = signal('');
  protected readonly newFiles = signal<File[]>([]);

  constructor() {
    effect(() => {
      this.id();
      this.task.reload();
    });
  }

  protected upload(): void {
    this.run(this.api.upload(this.id(), this.newFiles()), () => this.newFiles.set([]));
  }

  protected download(file: FileView): void {
    this.api
      .download(this.id(), file)
      .subscribe({ error: (e: unknown) => this.actionError.set(errorMessage(e)) });
  }

  protected run(call: Observable<ExpertTaskDetail>, after?: () => void): void {
    this.busy.set(true);
    this.actionError.set(null);
    call.subscribe({
      next: (detail) => {
        this.task.set(detail);
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
