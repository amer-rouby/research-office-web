import { Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideTrash2 } from '@lucide/angular';
import type { OrderDetail, PaymentRequest, PaymentView, Quote } from '@core/api/api-types';
import { FormField } from '@shared/forms/form-field';
import { Input } from '@shared/forms/input';
import { DatePipe, MoneyPipe } from '@shared/pipes/format.pipes';
import { Balance } from '@shared/ui/balance';
import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';

type Method = PaymentRequest['method'];

export const PAYMENT_METHOD_LABEL: Record<Method, string> = {
  BANK_TRANSFER: 'تحويل بنكي',
  CASH: 'نقدًا',
  PAYPAL: 'PayPal',
  WISE: 'Wise',
  WALLET: 'محفظة إلكترونية',
  OTHER: 'أخرى',
};

/** Quote, paid/remaining, received payments and a form to record a new one. */
@Component({
  selector: 'ro-payments-card',
  imports: [
    ReactiveFormsModule,
    Card,
    Button,
    FormField,
    Input,
    Balance,
    DatePipe,
    MoneyPipe,
    LucideTrash2,
  ],
  template: `
    <ro-card title="السعر والمدفوعات">
      <div class="flex flex-col gap-4">
        <div>
          <p class="text-2xl font-bold text-ink">{{ quote() | roMoney }}</p>
          @if (quote().note) {
            <p class="mt-1 text-sm text-ink-muted">{{ quote().note }}</p>
          }
        </div>
        <ro-balance [quote]="quote()" [paid]="order().paidTotal" />

        @if (order().payments.length) {
          <ul class="flex flex-col divide-y text-sm">
            @for (p of order().payments; track p.id) {
              <li class="flex items-center gap-2 py-2">
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-ink">{{ money(p) | roMoney }}</p>
                  <p class="text-xs text-ink-subtle">
                    {{ methodLabel[p.method] }} · {{ p.paidOn | roDate }}
                    @if (p.note) {
                      · {{ p.note }}
                    }
                  </p>
                </div>
                <button
                  type="button"
                  class="grid size-8 place-items-center rounded-lg text-ink-subtle hover:bg-danger-soft hover:text-danger"
                  aria-label="حذف الدفعة"
                  (click)="confirmRemove(p)"
                >
                  <svg lucideTrash2 size="16" aria-hidden="true"></svg>
                </button>
              </li>
            }
          </ul>
        }

        <form
          class="grid grid-cols-2 gap-3 border-t pt-4"
          [formGroup]="form"
          (ngSubmit)="submit()"
          novalidate
        >
          <ro-form-field label="المبلغ" [control]="form.controls.amount" required>
            <input
              roInput
              type="number"
              min="0.01"
              step="0.01"
              formControlName="amount"
              dir="ltr"
            />
          </ro-form-field>
          <ro-form-field label="التاريخ" [control]="form.controls.paidOn" required>
            <input roInput type="date" formControlName="paidOn" dir="ltr" />
          </ro-form-field>
          <ro-form-field
            label="الطريقة"
            class="col-span-2"
            [control]="form.controls.method"
            required
          >
            <select roInput formControlName="method">
              @for (m of methods; track m) {
                <option [value]="m">{{ methodLabel[m] }}</option>
              }
            </select>
          </ro-form-field>
          <ro-form-field label="ملاحظة" class="col-span-2" [control]="form.controls.note">
            <input roInput formControlName="note" placeholder="مثل: الدفعة المقدمة" />
          </ro-form-field>
          <div class="col-span-2">
            <button roButton type="submit" variant="secondary" block [loading]="busy()">
              تسجيل دفعة
            </button>
          </div>
        </form>
      </div>
    </ro-card>
  `,
})
export class PaymentsCard {
  readonly order = input.required<OrderDetail>();
  readonly quote = input.required<Quote>();
  readonly busy = input(false);
  readonly add = output<PaymentRequest>();
  readonly remove = output<PaymentView>();

  protected readonly methodLabel = PAYMENT_METHOD_LABEL;
  protected readonly methods = Object.keys(PAYMENT_METHOD_LABEL) as Method[];
  protected readonly form = inject(NonNullableFormBuilder).group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paidOn: [new Date().toISOString().slice(0, 10), Validators.required],
    method: ['BANK_TRANSFER' as Method, Validators.required],
    note: ['', Validators.maxLength(500)],
  });

  protected money(p: PaymentView) {
    return { price: p.amount, currency: p.currency };
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.add.emit({ ...v, note: v.note || null });
    this.form.patchValue({ amount: 0, note: '' });
    this.form.markAsUntouched();
  }

  protected confirmRemove(p: PaymentView): void {
    if (confirm('حذف هذه الدفعة؟ استخدمه فقط لتصحيح خطأ في التسجيل.')) this.remove.emit(p);
  }
}
