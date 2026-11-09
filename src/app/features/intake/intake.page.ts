import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideCircleCheck, LucideDynamicIcon } from '@lucide/angular';
import { switchMap, of } from 'rxjs';
import type { CreatedOrder } from '@core/api/api-types';
import { createLoader, errorMessage } from '@core/data/loader';
import { PublicOrdersApi } from '@core/orders/public-orders.api';
import { groupServices } from '@core/orders/service-groups';
import { FormField } from '@shared/forms/form-field';
import { Input } from '@shared/forms/input';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';
import { CopyButton } from '@shared/ui/copy-button';
import { FileDrop } from '@shared/ui/file-drop';
import { LoadError, Loading } from '@shared/ui/state-views';

@Component({
  selector: 'ro-intake-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FormField,
    Input,
    Button,
    Alert,
    Card,
    CopyButton,
    FileDrop,
    Loading,
    LoadError,
    LucideDynamicIcon,
    LucideCircleCheck,
  ],
  template: `
    <div class="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
      @if (created(); as done) {
        <ro-card>
          <div class="flex flex-col items-center gap-4 py-6 text-center">
            <span class="grid size-16 place-items-center rounded-full bg-success-soft text-success">
              <svg lucideCircleCheck size="32" aria-hidden="true"></svg>
            </span>
            <h1 class="text-2xl font-bold text-ink">تم استلام طلبك</h1>
            <p class="max-w-md text-ink-muted">
              رقم طلبك <strong class="text-ink" dir="ltr">{{ done.reference }}</strong
              >. سنراجع التفاصيل ونرسل لك عرض السعر. احفظ رابط المتابعة لتعرف كل جديد.
            </p>
            <div
              class="flex w-full max-w-lg flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-sunken px-4 py-3"
            >
              <span class="truncate text-sm text-ink-muted" dir="ltr">{{ trackingUrl() }}</span>
              <ro-copy-button [value]="trackingUrl()" label="نسخ الرابط" />
            </div>
            @if (uploadWarning()) {
              <ro-alert kind="warning">{{ uploadWarning() }}</ro-alert>
            }
            <a roButton size="lg" [routerLink]="['/t', done.trackingToken]">متابعة الطلب</a>
          </div>
        </ro-card>
      } @else {
        <header class="text-center">
          <p class="text-sm font-medium text-accent-700 dark:text-accent-300">
            عرض سعر خلال 24 ساعة
          </p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">اطلب خدمتك</h1>
          <p class="mx-auto mt-3 max-w-xl text-ink-muted">
            اختر الخدمة واكتب التفاصيل وأرفق ملفاتك. نراجع طلبك ونرسل لك السعر والمدة، ولا تدفع
            شيئًا قبل موافقتك.
          </p>
        </header>

        @if (services.loading()) {
          <ro-loading />
        } @else if (services.error()) {
          <ro-load-error [message]="services.error()!" (retry)="services.reload()" />
        } @else {
          <form class="flex flex-col gap-8" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <section class="flex flex-col gap-5" aria-labelledby="svc-title">
              <h2 id="svc-title" class="text-lg font-semibold text-ink">1. اختر الخدمة</h2>
              @for (group of groups(); track group.category) {
                <div class="flex flex-col gap-3">
                  <p class="flex items-center gap-2 text-sm font-medium text-ink-muted">
                    <svg [lucideIcon]="group.icon" size="18" aria-hidden="true"></svg>
                    {{ group.title }}
                  </p>
                  <div class="grid gap-3 sm:grid-cols-2">
                    @for (s of group.services; track s.id) {
                      <label
                        class="cursor-pointer rounded-2xl border bg-surface-raised p-4 transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-brand-50 has-[:checked]:ring-2 has-[:checked]:ring-primary/20 dark:has-[:checked]:bg-brand-900"
                      >
                        <input
                          type="radio"
                          class="sr-only"
                          formControlName="serviceId"
                          [value]="s.id"
                        />
                        <span class="block font-semibold text-ink">{{ s.nameAr }}</span>
                        <span class="mt-1 block text-sm leading-relaxed text-ink-muted">{{
                          s.descriptionAr
                        }}</span>
                      </label>
                    }
                  </div>
                </div>
              }
              @if (form.controls.serviceId.touched && form.controls.serviceId.invalid) {
                <p class="text-sm text-danger" role="alert">اختر الخدمة المطلوبة</p>
              }
            </section>

            <ro-card>
              <div class="flex flex-col gap-5">
                <h2 class="text-lg font-semibold text-ink">2. بياناتك وتفاصيل الطلب</h2>
                <div class="grid gap-5 sm:grid-cols-2">
                  <ro-form-field label="الاسم" [control]="form.controls.clientName" required>
                    <input roInput formControlName="clientName" autocomplete="name" />
                  </ro-form-field>
                  <ro-form-field
                    label="رقم الواتساب"
                    hint="مع كود الدولة، مثل +974"
                    [control]="form.controls.clientPhone"
                    required
                  >
                    <input
                      roInput
                      type="tel"
                      formControlName="clientPhone"
                      autocomplete="tel"
                      dir="ltr"
                    />
                  </ro-form-field>
                  <ro-form-field
                    label="البريد الإلكتروني (اختياري)"
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
                  <ro-form-field label="الدولة (اختياري)" [control]="form.controls.country">
                    <input roInput formControlName="country" autocomplete="country-name" />
                  </ro-form-field>
                </div>
                <ro-form-field
                  label="تفاصيل الطلب"
                  hint="الجامعة أو الجهة، حجم العمل، البرنامج المطلوب، وأي ملاحظات"
                  [control]="form.controls.details"
                  required
                >
                  <textarea roInput rows="5" formControlName="details"></textarea>
                </ro-form-field>
                <ro-form-field
                  label="موعد التسليم المطلوب (اختياري)"
                  [control]="form.controls.deadline"
                >
                  <input roInput type="date" formControlName="deadline" [min]="today" dir="ltr" />
                </ro-form-field>
              </div>
            </ro-card>

            <ro-card>
              <div class="flex flex-col gap-4">
                <h2 class="text-lg font-semibold text-ink">3. الملفات (اختياري)</h2>
                <ro-file-drop [(files)]="files" />
              </div>
            </ro-card>

            @if (error()) {
              <ro-alert kind="danger">{{ error() }}</ro-alert>
            }
            <div class="flex flex-col items-center gap-3">
              <button
                roButton
                type="submit"
                size="lg"
                class="w-full sm:w-auto sm:min-w-64"
                [loading]="submitting()"
              >
                إرسال الطلب
              </button>
              <p class="text-xs text-ink-subtle">بياناتك وملفاتك سرية ولا تُشارك مع أي جهة.</p>
            </div>
          </form>
        }
      }
    </div>
  `,
})
export class IntakePage {
  private readonly api = inject(PublicOrdersApi);

  protected readonly today = new Date().toISOString().slice(0, 10);
  protected readonly services = createLoader(() => this.api.services());
  protected readonly groups = computed(() => groupServices(this.services.data() ?? []));

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
    deadline: [''],
  });
  protected readonly files = signal<File[]>([]);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly created = signal<CreatedOrder | null>(null);
  protected readonly uploadWarning = signal<string | null>(null);
  protected readonly trackingUrl = computed(
    () => `${location.origin}/t/${this.created()?.trackingToken ?? ''}`,
  );

  constructor() {
    this.services.reload();
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
