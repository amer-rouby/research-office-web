import { Component, input, output } from '@angular/core';
import { LucideDownload, LucideFileText, LucideSend } from '@lucide/angular';
import type { FileKind, FileView } from '@core/api/api-types';
import { BytesPipe, DateTimePipe } from '@shared/pipes/format.pipes';

export const FILE_KIND_LABEL: Record<FileKind, string> = {
  CLIENT_UPLOAD: 'من العميل',
  DELIVERABLE: 'تسليم',
  INTERNAL: 'داخلي',
};

/**
 * Files of a request; the page decides how a download happens (link or authenticated fetch).
 * With `canPublish`, internal files get a "send to client" action (admin review gate).
 */
@Component({
  selector: 'ro-file-list',
  imports: [LucideFileText, LucideDownload, LucideSend, BytesPipe, DateTimePipe],
  template: `
    <ul class="flex flex-col divide-y">
      @for (f of files(); track f.id) {
        <li class="flex items-center gap-3 py-3">
          <span
            class="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary dark:bg-brand-900"
          >
            <svg lucideFileText size="18" aria-hidden="true"></svg>
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-ink" dir="auto">{{ f.name }}</p>
            <p class="text-xs text-ink-subtle">
              {{ kindLabel[f.kind] }} · {{ f.uploadedBy }} · {{ f.sizeBytes | roBytes }} ·
              {{ f.uploadedAt | roDateTime }}
            </p>
          </div>
          @if (canPublish() && f.kind === 'INTERNAL') {
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-brand-50 dark:hover:bg-brand-900"
              [attr.aria-label]="'إرسال ' + f.name + ' للعميل'"
              (click)="publish.emit(f)"
            >
              <svg lucideSend size="14" class="rtl:-scale-x-100" aria-hidden="true"></svg> للعميل
            </button>
          }
          <button
            type="button"
            class="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-sunken hover:text-primary"
            [attr.aria-label]="'تحميل ' + f.name"
            (click)="download.emit(f)"
          >
            <svg lucideDownload size="18" aria-hidden="true"></svg>
          </button>
        </li>
      }
    </ul>
  `,
})
export class FileList {
  readonly files = input.required<readonly FileView[]>();
  readonly canPublish = input(false);
  readonly download = output<FileView>();
  readonly publish = output<FileView>();
  protected readonly kindLabel = FILE_KIND_LABEL;
}
