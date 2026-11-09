import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Injectable, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Button } from './button';

interface DialogData {
  readonly title: string;
  readonly message?: string;
  readonly confirmText: string;
  readonly danger: boolean;
  /** When set, the dialog asks for a value (e.g. a new password) of at least this length. */
  readonly inputLabel?: string;
  readonly inputMinLength?: number;
}

@Component({
  selector: 'ro-dialog',
  imports: [Button, FormsModule],
  host: {
    class:
      'block w-[min(28rem,calc(100vw-2rem))] rounded-2xl border bg-surface-raised p-6 shadow-lift',
    role: 'alertdialog',
    'aria-modal': 'true',
  },
  template: `
    <h2 class="text-lg font-semibold text-ink">{{ data.title }}</h2>
    @if (data.message) {
      <p class="mt-2 text-sm leading-relaxed text-ink-muted">{{ data.message }}</p>
    }
    @if (data.inputLabel) {
      <label class="mt-4 flex flex-col gap-1.5 text-sm font-medium text-ink">
        {{ data.inputLabel }}
        <input
          class="w-full rounded-xl border bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-focus-ring/30 focus:outline-none"
          dir="ltr"
          autocomplete="off"
          [ngModel]="value()"
          (ngModelChange)="value.set($event)"
          (keydown.enter)="valid() && ref.close(value())"
          cdkFocusInitial
        />
      </label>
      @if (data.inputMinLength) {
        <p class="mt-1 text-xs text-ink-subtle">{{ data.inputMinLength }} أحرف على الأقل</p>
      }
    }
    <div class="mt-6 flex flex-row-reverse flex-wrap gap-2">
      <button
        roButton
        [variant]="data.danger ? 'danger' : 'primary'"
        [disabled]="!valid()"
        (click)="ref.close(data.inputLabel ? value() : true)"
      >
        {{ data.confirmText }}
      </button>
      <button roButton variant="secondary" (click)="ref.close()">إلغاء</button>
    </div>
  `,
})
class ConfirmDialogComponent {
  protected readonly data = inject<DialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<string | true>>(DialogRef);
  protected readonly value = signal('');

  protected valid(): boolean {
    return !this.data.inputLabel || this.value().trim().length >= (this.data.inputMinLength ?? 1);
  }
}

/** In-app replacements for window.confirm / window.prompt, styled like the rest of the app. */
@Injectable({ providedIn: 'root' })
export class Dialogs {
  private readonly dialog = inject(Dialog);

  /** Emits true only when the user confirms. */
  confirm(options: {
    title: string;
    message?: string;
    confirmText?: string;
    danger?: boolean;
  }): Observable<boolean> {
    return this.open({
      confirmText: options.confirmText ?? 'تأكيد',
      danger: options.danger ?? false,
      ...options,
    }).pipe(map((r) => r === true));
  }

  /** Emits the entered value, or null when cancelled. */
  prompt(options: {
    title: string;
    message?: string;
    label: string;
    minLength?: number;
    confirmText?: string;
  }) {
    return this.open({
      title: options.title,
      message: options.message,
      inputLabel: options.label,
      inputMinLength: options.minLength,
      confirmText: options.confirmText ?? 'حفظ',
      danger: false,
    }).pipe(map((r) => (typeof r === 'string' ? r.trim() : null)));
  }

  private open(data: DialogData) {
    return this.dialog.open<string | true, DialogData>(ConfirmDialogComponent, {
      data,
      backdropClass: ['bg-black/40', 'backdrop-blur-[2px]'],
      autoFocus: 'first-tabbable',
    }).closed;
  }
}
