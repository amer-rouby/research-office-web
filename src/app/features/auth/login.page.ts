import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideChartColumn, LucideFileCheck, LucideShieldCheck } from '@lucide/angular';
import { ApiError } from '@core/api/problem-detail';
import { AuthService, ROLE_HOME } from '@core/auth/auth.service';
import { Brand } from '@layout/brand';
import { ThemeToggle } from '@layout/theme-toggle';
import { FormField } from '@shared/forms/form-field';
import { Input } from '@shared/forms/input';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';

@Component({
  selector: 'ro-login-page',
  imports: [
    ReactiveFormsModule,
    FormField,
    Input,
    Button,
    Alert,
    Brand,
    ThemeToggle,
    LucideChartColumn,
    LucideFileCheck,
    LucideShieldCheck,
  ],
  host: { class: 'grid min-h-dvh lg:grid-cols-2' },
  template: `
    <section class="flex flex-col px-6 py-8 sm:px-12">
      <div class="flex items-center justify-between">
        <ro-brand />
        <ro-theme-toggle />
      </div>

      <div class="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
        <h1 class="text-3xl font-bold tracking-tight text-ink">تسجيل الدخول</h1>
        <p class="mt-2 text-ink-muted">أهلًا بعودتك. ادخل لمتابعة الطلبات والمهام.</p>

        <form class="mt-8 flex flex-col gap-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (error()) {
            <ro-alert kind="danger">{{ error() }}</ro-alert>
          }
          <ro-form-field label="البريد الإلكتروني" [control]="form.controls.email" required>
            <input roInput type="email" formControlName="email" autocomplete="username" dir="ltr" />
          </ro-form-field>
          <ro-form-field label="كلمة المرور" [control]="form.controls.password" required>
            <input
              roInput
              type="password"
              formControlName="password"
              autocomplete="current-password"
              dir="ltr"
            />
          </ro-form-field>
          <button roButton type="submit" size="lg" block [loading]="submitting()">دخول</button>
        </form>
      </div>
    </section>

    <aside
      class="relative hidden overflow-hidden bg-brand-800 p-12 text-ink-inverse lg:flex lg:flex-col lg:justify-end dark:bg-brand-900"
    >
      <div
        class="absolute -top-32 -left-32 size-96 rounded-full bg-brand-600 opacity-40 blur-3xl"
        aria-hidden="true"
      ></div>
      <div
        class="absolute -right-24 bottom-24 size-80 rounded-full bg-accent-500 opacity-25 blur-3xl"
        aria-hidden="true"
      ></div>
      <div class="relative max-w-md">
        <p class="text-sm font-medium tracking-wide text-accent-300">منصة إدارة الخدمات البحثية</p>
        <h2 class="mt-3 text-4xl leading-tight font-bold text-white">
          كل طلب، من الاستلام حتى التسليم، في مكان واحد.
        </h2>
        <ul class="mt-10 flex flex-col gap-4 text-brand-100">
          <li class="flex items-center gap-3">
            <svg lucideChartColumn size="20" class="text-accent-300" aria-hidden="true"></svg>
            تحليل إحصائي ودراسات جدوى بمراجعة خبير
          </li>
          <li class="flex items-center gap-3">
            <svg lucideFileCheck size="20" class="text-accent-300" aria-hidden="true"></svg>
            متابعة كل مرحلة وتسليم الملفات بأمان
          </li>
          <li class="flex items-center gap-3">
            <svg lucideShieldCheck size="20" class="text-accent-300" aria-hidden="true"></svg>
            بيانات العملاء محمية ولا تُشارك
          </li>
        </ul>
      </div>
    </aside>
  `,
})
export class LoginPage {
  /** Bound from the `returnUrl` query param. */
  readonly returnUrl = input<string>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: ({ user }) => {
        const target = this.returnUrl()?.startsWith('/') ? this.returnUrl()! : ROLE_HOME[user.role];
        void this.router.navigateByUrl(target);
      },
      error: (e: unknown) => {
        this.submitting.set(false);
        this.error.set(
          e instanceof ApiError && e.problem.code === 'BAD_CREDENTIALS'
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
            : e instanceof ApiError
              ? e.message
              : 'حدث خطأ غير متوقع، حاول مرة أخرى.',
        );
      },
    });
  }
}
