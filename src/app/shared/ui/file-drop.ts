import { Component, booleanAttribute, input, model, signal } from '@angular/core';
import { LucideCloudUpload, LucideX } from '@lucide/angular';
import { BytesPipe } from '@shared/pipes/format.pipes';

/** Matches the backend allow-list (FilesService.ALLOWED) and 50 MB limit. */
export const ACCEPTED_FILES =
  '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.rtf,.odt,.ods,.sav,.spv,.omv,.dta,.sps,.zip,.rar,.7z,.png,.jpg,.jpeg,.webp';
const MAX_BYTES = 50 * 1024 * 1024;

/** Drag-and-drop or browse for files; two-way bound through `[(files)]`. */
@Component({
  selector: 'ro-file-drop',
  imports: [LucideCloudUpload, LucideX, BytesPipe],
  template: `
    <label
      class="relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-within:border-primary hover:border-primary hover:bg-brand-50/50 dark:hover:bg-brand-900/30"
      [class.border-primary]="dragging()"
      [class.bg-brand-50]="dragging()"
      (dragover)="$event.preventDefault(); dragging.set(true)"
      (dragleave)="dragging.set(false)"
      (drop)="onDrop($event)"
    >
      <svg lucideCloudUpload size="28" class="text-primary" aria-hidden="true"></svg>
      <span class="text-sm font-medium text-ink">اسحب الملفات هنا أو اضغط للاختيار</span>
      <span class="text-xs text-ink-subtle">PDF، Word، Excel، SPSS وغيرها · حتى 50 ميجا للملف</span>
      <input
        type="file"
        class="sr-only"
        [multiple]="multiple()"
        [accept]="accept"
        (change)="onPick($event)"
      />
    </label>
    @if (rejected()) {
      <p class="mt-2 text-xs text-danger" role="alert">{{ rejected() }}</p>
    }
    @if (files().length) {
      <ul class="mt-3 flex flex-col gap-2">
        @for (f of files(); track f.name + f.size) {
          <li class="flex items-center gap-3 rounded-xl bg-surface-sunken px-3 py-2 text-sm">
            <span class="min-w-0 flex-1 truncate text-ink" dir="auto">{{ f.name }}</span>
            <span class="text-xs text-ink-subtle">{{ f.size | roBytes }}</span>
            <button
              type="button"
              class="text-ink-subtle hover:text-danger"
              [attr.aria-label]="'إزالة ' + f.name"
              (click)="remove(f)"
            >
              <svg lucideX size="16" aria-hidden="true"></svg>
            </button>
          </li>
        }
      </ul>
    }
  `,
})
export class FileDrop {
  readonly files = model<File[]>([]);
  readonly multiple = input(true, { transform: booleanAttribute });
  protected readonly accept = ACCEPTED_FILES;
  protected readonly dragging = signal(false);
  protected readonly rejected = signal<string | null>(null);

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.add(Array.from(input.files ?? []));
    input.value = '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.add(Array.from(event.dataTransfer?.files ?? []));
  }

  protected remove(file: File): void {
    this.files.update((list) => list.filter((f) => f !== file));
  }

  private add(picked: File[]): void {
    const allowed = new Set(ACCEPTED_FILES.split(','));
    const ok = picked.filter(
      (f) =>
        f.size <= MAX_BYTES && allowed.has('.' + (f.name.split('.').pop() ?? '').toLowerCase()),
    );
    this.rejected.set(
      ok.length < picked.length ? 'تم تجاهل ملفات غير مدعومة أو أكبر من 50 ميجا.' : null,
    );
    this.files.update((list) => (this.multiple() ? [...list, ...ok] : ok.slice(0, 1)));
  }
}
