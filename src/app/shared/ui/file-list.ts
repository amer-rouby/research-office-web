import { Component, input, output } from '@angular/core';
import { LucideDownload, LucideFileText } from '@lucide/angular';
import type { FileKind, FileView } from '@core/api/api-types';
import { BytesPipe, DateTimePipe } from '@shared/pipes/format.pipes';

export const FILE_KIND_LABEL: Record<FileKind, string> = {
  CLIENT_UPLOAD: 'من العميل',
  DELIVERABLE: 'تسليم',
  INTERNAL: 'داخلي',
};

/** Files of a request; the page decides how a download happens (link or authenticated fetch). */
@Component({
  selector: 'ro-file-list',
  imports: [LucideFileText, LucideDownload, BytesPipe, DateTimePipe],
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
              {{ kindLabel[f.kind] }} · {{ f.sizeBytes | roBytes }} ·
              {{ f.uploadedAt | roDateTime }}
            </p>
          </div>
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
  readonly download = output<FileView>();
  protected readonly kindLabel = FILE_KIND_LABEL;
}
