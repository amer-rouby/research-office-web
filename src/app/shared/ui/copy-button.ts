import { Component, input, signal } from '@angular/core';
import { LucideCheck, LucideCopy } from '@lucide/angular';

/** Copies a value (e.g. a tracking link) and confirms briefly. */
@Component({
  selector: 'ro-copy-button',
  imports: [LucideCopy, LucideCheck],
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-primary hover:bg-brand-50 dark:hover:bg-brand-900"
      (click)="copy()"
    >
      @if (copied()) {
        <svg lucideCheck size="16" aria-hidden="true"></svg> تم النسخ
      } @else {
        <svg lucideCopy size="16" aria-hidden="true"></svg> {{ label() }}
      }
    </button>
  `,
})
export class CopyButton {
  readonly value = input.required<string>();
  readonly label = input('نسخ');
  protected readonly copied = signal(false);

  protected copy(): void {
    void navigator.clipboard?.writeText(this.value()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
