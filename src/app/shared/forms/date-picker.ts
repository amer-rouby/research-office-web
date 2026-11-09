import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCalendar, LucideChevronLeft, LucideChevronRight, LucideX } from '@lucide/angular';
import { FormField } from './form-field';

const LOCALE = 'ar-u-nu-latn';
const MONTH = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
const DISPLAY = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
/** Saturday-first week, as used across the Gulf. */
const WEEKDAYS = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
];

/** yyyy-mm-dd in local time (what the API expects for LocalDate). */
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (s: string | null) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

interface Day {
  readonly date: Date;
  readonly key: string;
  readonly inMonth: boolean;
  readonly disabled: boolean;
}

/**
 * Arabic calendar for date fields (replaces the browser's mm/dd/yyyy input).
 * Works with reactive forms: `<ro-date-picker formControlName="deadline" [min]="today" />`.
 */
@Component({
  selector: 'ro-date-picker',
  imports: [
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    LucideCalendar,
    LucideChevronLeft,
    LucideChevronRight,
    LucideX,
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatePicker), multi: true },
  ],
  host: { class: 'block' },
  template: `
    <div
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      class="flex w-full items-center gap-2 rounded-xl border bg-surface-raised px-3.5 py-2.5 text-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-focus-ring/30"
      [class.bg-surface-sunken]="disabled()"
    >
      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-2 text-start focus:outline-none disabled:cursor-not-allowed"
        [id]="field?.controlId"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-expanded]="open()"
        aria-haspopup="dialog"
        [disabled]="disabled()"
        (click)="toggle()"
        (blur)="touched()"
      >
        <svg lucideCalendar size="18" class="shrink-0 text-ink-subtle" aria-hidden="true"></svg>
        <span class="truncate" [class]="value() ? 'text-ink' : 'text-ink-subtle'">{{
          label()
        }}</span>
      </button>
      @if (value() && !disabled()) {
        <button
          type="button"
          class="grid size-6 place-items-center rounded-md text-ink-subtle hover:bg-surface-sunken hover:text-ink"
          aria-label="مسح التاريخ"
          (click)="select(null)"
        >
          <svg lucideX size="14" aria-hidden="true"></svg>
        </button>
      }
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      (overlayOutsideClick)="open.set(false)"
      (detach)="open.set(false)"
      (overlayKeydown)="$event.key === 'Escape' && open.set(false)"
    >
      <div
        class="w-72 rounded-2xl border bg-surface-raised p-3 shadow-lift"
        role="dialog"
        aria-label="اختر التاريخ"
        dir="rtl"
      >
        <div class="flex items-center justify-between px-1 pb-2">
          <button
            type="button"
            class="grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-surface-sunken"
            aria-label="الشهر السابق"
            (click)="shift(-1)"
          >
            <svg lucideChevronRight size="18" aria-hidden="true"></svg>
          </button>
          <span class="text-sm font-semibold text-ink">{{ monthLabel() }}</span>
          <button
            type="button"
            class="grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-surface-sunken"
            aria-label="الشهر التالي"
            (click)="shift(1)"
          >
            <svg lucideChevronLeft size="18" aria-hidden="true"></svg>
          </button>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-[11px] text-ink-subtle">
          @for (w of weekdays; track w) {
            <span class="py-1">{{ w }}</span>
          }
        </div>
        <div class="grid grid-cols-7 gap-1">
          @for (d of days(); track d.key) {
            <button
              type="button"
              class="aspect-square rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              [class]="dayClass(d)"
              [disabled]="d.disabled"
              [attr.aria-pressed]="d.key === value()"
              [attr.aria-label]="d.date.toLocaleDateString('ar')"
              (click)="select(d.key)"
            >
              {{ d.date.getDate() }}
            </button>
          }
        </div>
        <div class="mt-2 flex justify-between border-t pt-2">
          <button
            type="button"
            class="rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-brand-50 disabled:opacity-40 dark:hover:bg-brand-900"
            [disabled]="todayDisabled()"
            (click)="select(today)"
          >
            اليوم
          </button>
          <button
            type="button"
            class="rounded-lg px-2 py-1 text-xs text-ink-muted hover:bg-surface-sunken"
            (click)="open.set(false)"
          >
            إغلاق
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class DatePicker implements ControlValueAccessor {
  /** Earliest selectable date, yyyy-mm-dd. */
  readonly min = input<string | null>(null);
  readonly placeholder = input('اختر التاريخ');

  protected readonly field = inject(FormField, { optional: true });
  protected readonly weekdays = WEEKDAYS;
  protected readonly positions = POSITIONS;
  protected readonly today = iso(new Date());

  protected readonly value = signal<string | null>(null);
  protected readonly disabled = signal(false);
  protected readonly open = signal(false);
  private readonly view = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  private onChange: (v: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly label = computed(() => {
    const d = parse(this.value());
    return d ? DISPLAY.format(d) : this.placeholder();
  });
  protected readonly monthLabel = computed(() => MONTH.format(this.view()));
  protected readonly todayDisabled = computed(() => !!this.min() && this.today < this.min()!);

  protected readonly days = computed<Day[]>(() => {
    const first = this.view();
    // JS: 0=Sun..6=Sat → offset so the grid starts on Saturday
    const offset = (first.getDay() + 1) % 7;
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
    const min = this.min();
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = iso(date);
      return {
        date,
        key,
        inMonth: date.getMonth() === first.getMonth(),
        disabled: !!min && key < min,
      };
    });
  });

  protected dayClass(d: Day): string {
    if (d.key === this.value()) return 'bg-primary font-semibold text-on-primary';
    const base = d.inMonth
      ? 'text-ink hover:bg-brand-50 dark:hover:bg-brand-900'
      : 'text-ink-subtle hover:bg-surface-sunken';
    return d.key === this.today ? `${base} ring-1 ring-primary ring-inset` : base;
  }

  protected toggle(): void {
    const selected = parse(this.value());
    if (selected) this.view.set(new Date(selected.getFullYear(), selected.getMonth(), 1));
    this.open.update((o) => !o);
  }

  protected shift(months: number): void {
    const v = this.view();
    this.view.set(new Date(v.getFullYear(), v.getMonth() + months, 1));
  }

  protected select(key: string | null): void {
    this.value.set(key);
    this.onChange(key);
    this.onTouched();
    this.open.set(false);
  }

  protected describedBy(): string | null {
    return this.field && this.field.hasMessage() ? this.field.messageId : null;
  }

  protected touched(): void {
    if (!this.open()) this.onTouched();
  }

  writeValue(v: string | null): void {
    this.value.set(v || null);
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}
