import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideBellRing,
  LucideChevronDown,
  LucideCircleCheck,
  LucideDynamicIcon,
  LucideHandCoins,
  LucideLock,
  LucideMessageCircle,
  LucideTimer,
} from '@lucide/angular';
import { of, switchMap } from 'rxjs';
import type { CreatedOrder } from '@core/api/api-types';
import { createLoader, errorMessage } from '@core/data/loader';
import { PublicOrdersApi } from '@core/orders/public-orders.api';
import { groupServices } from '@core/orders/service-groups';
import { OfficeStore } from '@core/site/office.store';
import { DatePicker } from '@shared/forms/date-picker';
import { FormField } from '@shared/forms/form-field';
import { Input } from '@shared/forms/input';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';
import { CopyButton } from '@shared/ui/copy-button';
import { FileDrop } from '@shared/ui/file-drop';
import { LoadError, Loading } from '@shared/ui/state-views';

/** Reassurance shown before the client writes anything. */
const PROMISES = [
  { icon: LucideHandCoins, text: 'لا تدفع شيئًا الآن' },
  { icon: LucideTimer, text: 'عرض سعر خلال 24 ساعة' },
  { icon: LucideLock, text: 'بياناتك وملفاتك سرية' },
];

/** What happens after sending, so the client knows exactly what to expect. */
const NEXT = [
  { title: 'نراجع طلبك', text: 'يقرأ مختص التفاصيل والملفات.' },
  { title: 'يصلك عرض السعر', text: 'السعر والمدة خلال 24 ساعة على صفحة المتابعة وواتساب.' },
  { title: 'توافق ونبدأ', text: 'لا يبدأ العمل ولا تدفع إلا بعد موافقتك.' },
];

const localIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

@Component({
  selector: 'ro-intake-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FormField,
    Input,
    DatePicker,
    Button,
    Alert,
    Card,
    CopyButton,
    FileDrop,
    Loading,
    LoadError,
    LucideDynamicIcon,
    LucideCircleCheck,
    LucideChevronDown,
    LucideMessageCircle,
    LucideBellRing,
  ],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      @if (created(); as done) {
        <!-- success -->
        <ro-card class="mx-auto block max-w-2xl">
          <div class="flex flex-col items-center gap-4 py-6 text-center">
            <span class="grid size-16 place-items-center rounded-full bg-success-soft text-success">
              <svg lucideCircleCheck size="32" aria-hidden="true"></svg>
            </span>
            <h1 class="text-2xl font-bold text-ink">تم استلام طلبك بنجاح</h1>
            <p class="text-ink-muted">
              رقم طلبك
              <strong class="text-ink"
                ><bdi>{{ done.reference }}</bdi></strong
              >
            </p>

            <div class="w-full rounded-2xl bg-surface-sunken p-4 text-start">
              <p class="flex items-center gap-2 text-sm font-semibold text-ink">
                <svg lucideBellRing size="16" class="text-primary" aria-hidden="true"></svg>
                احفظ رابط المتابعة الخاص بك
              </p>
              <p class="mt-1 text-xs text-ink-muted">منه تعرف كل جديد وتقبل العرض وتستلم ملفاتك.</p>
              <div
                class="mt-3 flex items-center gap-2 rounded-xl border bg-surface-raised px-3 py-2"
              >
                <span class="min-w-0 flex-1 truncate text-sm text-ink-muted" dir="ltr">{{
                  trackingUrl()
                }}</span>
                <ro-copy-button [value]="trackingUrl()" label="نسخ" />
              </div>
              <a
                class="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-success hover:underline"
                [href]="saveToWhatsapp()"
                target="_blank"
                rel="noopener"
              >
                <svg lucideMessageCircle size="16" aria-hidden="true"></svg> أرسل الرابط لنفسك على
                واتساب
              </a>
            </div>

            @if (uploadWarning()) {
              <ro-alert kind="warning">{{ uploadWarning() }}</ro-alert>
            }

            <ol class="grid w-full gap-3 text-start sm:grid-cols-3">
              @for (n of next; track n.title; let i = $index) {
                <li class="rounded-2xl border p-3">
                  <span class="text-xs font-semibold text-primary">الخطوة {{ i + 1 }}</span>
                  <p class="mt-1 text-sm font-semibold text-ink">{{ n.title }}</p>
                  <p class="mt-0.5 text-xs text-ink-muted">{{ n.text }}</p>
                </li>
              }
            </ol>

            <a roButton size="lg" [routerLink]="['/t', done.trackingToken]"
              >افتح صفحة متابعة طلبي</a
            >
          </div>
        </ro-card>
      } @else {
        <header class="mx-auto max-w-2xl text-center">
          <h1 class="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            اطلب خدمتك في دقيقتين
          </h1>
          <p class="mt-3 text-ink-muted">ثلاث خطوات بسيطة، ونرد عليك بعرض السعر.</p>
          <ul class="mt-5 flex flex-wrap justify-center gap-2">
            @for (p of promises; track p.text) {
              <li
                class="inline-flex items-center gap-1.5 rounded-full border bg-surface-raised px-3 py-1.5 text-sm text-ink shadow-soft"
              >
                <svg [lucideIcon]="p.icon" size="16" class="text-success" aria-hidden="true"></svg>
                {{ p.text }}
              </li>
            }
          </ul>
        </header>

        @if (services.loading() && !services.data()) {
          <div class="mt-10"><ro-loading /></div>
        } @else if (services.error()) {
          <div class="mt-10">
            <ro-load-error [message]="services.error()!" (retry)="services.reload()" />
          </div>
        } @else {
          <div class="mt-10 grid items-start gap-8 lg:grid-cols-3">
            <form
              class="flex flex-col gap-6 lg:col-span-2"
              [formGroup]="form"
              (ngSubmit)="submit()"
              novalidate
            >
              <!-- 1. service -->
              <ro-card>
                <h2 class="flex items-center gap-3 text-lg font-semibold text-ink">
                  <span
                    class="grid size-7 place-items-center rounded-full bg-primary text-sm text-on-primary"
                    >1</span
                  >
                  ما الخدمة التي تحتاجها؟
                </h2>
                @for (group of groups(); track group.category) {
                  <p class="mt-5 mb-2 flex items-center gap-2 text-sm font-medium text-ink-muted">
                    <svg [lucideIcon]="group.icon" size="16" aria-hidden="true"></svg>
                    {{ group.title }}
                  </p>
                  <div class="grid gap-2 sm:grid-cols-2">
                    @for (s of group.services; track s.id) {
                      <label
                        class="flex cursor-pointer gap-3 rounded-xl border bg-surface-raised p-3 transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-brand-50 has-[:checked]:ring-2 has-[:checked]:ring-primary/15 dark:has-[:checked]:bg-brand-900"
                      >
                        <input
                          type="radio"
                          [attr.aria-label]="s.nameAr"
                          class="mt-1 size-4 shrink-0 accent-primary"
                          formControlName="serviceId"
                          [value]="s.id"
                        />
                        <span>
                          <span class="block text-sm font-semibold text-ink">{{ s.nameAr }}</span>
                          <span class="mt-0.5 block text-xs leading-relaxed text-ink-muted">{{
                            s.descriptionAr
                          }}</span>
                        </span>
                      </label>
                    }
                  </div>
                }
                @if (form.controls.serviceId.touched && form.controls.serviceId.invalid) {
                  <p class="mt-3 text-sm text-danger" role="alert">اختر الخدمة المطلوبة</p>
                }
              </ro-card>

              <!-- 2. contact -->
              <ro-card>
                <h2 class="flex items-center gap-3 text-lg font-semibold text-ink">
                  <span
                    class="grid size-7 place-items-center rounded-full bg-primary text-sm text-on-primary"
                    >2</span
                  >
                  كيف نتواصل معك؟
                </h2>
                <div class="mt-5 grid gap-5 sm:grid-cols-2">
                  <ro-form-field label="الاسم" [control]="form.controls.clientName" required>
                    <input
                      roInput
                      formControlName="clientName"
                      autocomplete="name"
                      placeholder="اسمك كما تحب أن نناديك"
                    />
                  </ro-form-field>
                  <ro-form-field
                    label="رقم الواتساب"
                    hint="نرسل لك عرض السعر عليه"
                    [control]="form.controls.clientPhone"
                    required
                  >
                    <input
                      roInput
                      type="tel"
                      formControlName="clientPhone"
                      autocomplete="tel"
                      dir="ltr"
                      placeholder="+974 5555 1234"
                    />
                  </ro-form-field>
                </div>
              </ro-card>

              <!-- 3. details -->
              <ro-card>
                <h2 class="flex items-center gap-3 text-lg font-semibold text-ink">
                  <span
                    class="grid size-7 place-items-center rounded-full bg-primary text-sm text-on-primary"
                    >3</span
                  >
                  ما المطلوب بالضبط؟
                </h2>
                <div class="mt-5 flex flex-col gap-5">
                  <ro-form-field
                    label="تفاصيل الطلب"
                    hint="كلما وضّحت أكثر كان السعر أدق"
                    [control]="form.controls.details"
                    required
                  >
                    <textarea
                      roInput
                      rows="5"
                      formControlName="details"
                      placeholder="مثال: تحليل استبيان من 30 عبارة على 250 مشاركًا ببرنامج SPSS، مع جداول وتفسير للفصل الرابع. الجامعة: جامعة قطر."
                    ></textarea>
                  </ro-form-field>
                  <div>
                    <p class="mb-2 text-sm font-medium text-ink">
                      الملفات <span class="text-ink-subtle">(اختياري)</span>
                    </p>
                    <ro-file-drop [(files)]="files" />
                  </div>

                  <details class="group rounded-xl border">
                    <summary
                      class="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-ink"
                    >
                      تفاصيل إضافية (اختياري): البريد، الدولة، موعد التسليم
                      <svg
                        lucideChevronDown
                        size="18"
                        class="text-ink-subtle transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      ></svg>
                    </summary>
                    <div class="grid gap-5 border-t p-4 sm:grid-cols-2">
                      <ro-form-field
                        label="البريد الإلكتروني"
                        [control]="form.controls.clientEmail"
                      >
                        <input
                          roInput
                          type="email"
                          formControlName="clientEmail"
                          autocomplete="email"
                          dir="ltr"
                        />
                      </ro-form-field>
                      <ro-form-field label="الدولة" [control]="form.controls.country">
                        <input roInput formControlName="country" autocomplete="country-name" />
                      </ro-form-field>
                      <ro-form-field
                        label="موعد التسليم المطلوب"
                        class="sm:col-span-2"
                        [control]="form.controls.deadline"
                      >
                        <ro-date-picker
                          formControlName="deadline"
                          [min]="today"
                          placeholder="متى تحتاج العمل؟"
                        />
                      </ro-form-field>
                    </div>
                  </details>
                </div>
              </ro-card>

              @if (error()) {
                <ro-alert kind="danger">{{ error() }}</ro-alert>
              }
              <div class="flex flex-col items-center gap-2">
                <button
                  roButton
                  type="submit"
                  size="lg"
                  class="w-full sm:w-auto sm:min-w-72"
                  [loading]="submitting()"
                >
                  أرسل الطلب واستلم عرض السعر
                </button>
                <p class="text-xs text-ink-subtle">الإرسال مجاني ولا يلزمك بشيء.</p>
              </div>
            </form>

            <!-- reassurance -->
            <aside class="flex flex-col gap-4 lg:sticky lg:top-24">
              <ro-card>
                <h2 class="font-semibold text-ink">ماذا يحدث بعد الإرسال؟</h2>
                <ol class="mt-4 flex flex-col gap-4">
                  @for (n of next; track n.title; let i = $index) {
                    <li class="flex gap-3">
                      <span
                        class="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-primary dark:bg-brand-900"
                        >{{ i + 1 }}</span
                      >
                      <div>
                        <p class="text-sm font-semibold text-ink">{{ n.title }}</p>
                        <p class="text-xs leading-relaxed text-ink-muted">{{ n.text }}</p>
                      </div>
                    </li>
                  }
                </ol>
              </ro-card>
              @if (whatsapp(); as link) {
                <a
                  [href]="link"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center gap-3 rounded-2xl border bg-surface-raised p-4 transition-colors hover:border-success"
                >
                  <span
                    class="grid size-10 place-items-center rounded-xl bg-success-soft text-success"
                  >
                    <svg lucideMessageCircle size="20" aria-hidden="true"></svg>
                  </span>
                  <span>
                    <span class="block text-sm font-semibold text-ink">مستعجل أو عندك سؤال؟</span>
                    <span class="block text-xs text-ink-muted">كلّمنا مباشرة على واتساب</span>
                  </span>
                </a>
              }
            </aside>
          </div>
        }
      }
    </div>
  `,
})
export class IntakePage {
  private readonly api = inject(PublicOrdersApi);
  private readonly office = inject(OfficeStore);
  private readonly router = inject(Router);

  protected readonly promises = PROMISES;
  protected readonly next = NEXT;
  protected readonly today = localIso(new Date());
  protected readonly services = createLoader(() => this.api.services());
  protected readonly groups = computed(() => groupServices(this.services.data() ?? []));
  protected readonly whatsapp = computed(() =>
    this.office.whatsappLink('مرحبًا، أريد الاستفسار عن خدمة قبل إرسال الطلب'),
  );

  /** Query params from tools/landing: preselect a service by code and prefill the details. */
  readonly service = input<string>();
  readonly details = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    serviceId: ['', Validators.required],
    clientName: ['', [Validators.required, Validators.maxLength(150)]],
    clientPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9 ]{8,20}$/)]],
    clientEmail: ['', [Validators.email, Validators.maxLength(190)]],
    country: ['', Validators.maxLength(60)],
    details: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
    deadline: [null as string | null],
  });
  protected readonly files = signal<File[]>([]);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly created = signal<CreatedOrder | null>(null);
  protected readonly uploadWarning = signal<string | null>(null);
  protected readonly trackingUrl = computed(
    () => `${location.origin}/t/${this.created()?.trackingToken ?? ''}`,
  );
  protected readonly saveToWhatsapp = computed(
    () =>
      `https://wa.me/?text=${encodeURIComponent(`رابط متابعة طلبي ${this.created()?.reference ?? ''}: ${this.trackingUrl()}`)}`,
  );

  constructor() {
    this.services.reload();
    this.office.load();
    effect(() => {
      const code = this.service();
      const match = this.services.data()?.find((s) => s.code === code);
      if (match && !this.form.controls.serviceId.value)
        this.form.controls.serviceId.setValue(match.id);
    });
    effect(() => {
      const text = this.details();
      if (text && !this.form.controls.details.value)
        this.form.controls.details.setValue(text.slice(0, 4000));
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      document
        .querySelector('[aria-invalid="true"], [role="alert"]')
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);
    this.api
      .create({
        ...v,
        clientEmail: v.clientEmail || null,
        country: v.country || null,
        deadline: v.deadline || null,
      })
      .pipe(
        switchMap((order) => {
          this.created.set(order);
          // the form is done: drop ?service=&details= so a refresh does not refill it
          void this.router.navigate([], { queryParams: {}, replaceUrl: true });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return this.files().length ? this.api.upload(order.trackingToken, this.files()) : of([]);
        }),
      )
      .subscribe({
        next: () => this.submitting.set(false),
        error: (e: unknown) => {
          this.submitting.set(false);
          if (this.created()) {
            this.uploadWarning.set(
              'تم إرسال الطلب لكن تعذّر رفع بعض الملفات. يمكنك رفعها من صفحة المتابعة.',
            );
          } else {
            this.error.set(errorMessage(e));
          }
        },
      });
  }
}
