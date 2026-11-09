import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField } from '@shared/forms/form-field';
import { Input } from '@shared/forms/input';
import { formatMoney } from '@shared/pipes/format.pipes';
import { breakEven } from './tool-calcs';
import { ToolCta } from './tool-cta';
import { ToolPage } from './tool-page';

const CURRENCIES = ['QAR', 'SAR', 'AED', 'KWD', 'OMR', 'BHD', 'USD', 'EGP'];

@Component({
  selector: 'ro-break-even-page',
  imports: [FormsModule, FormField, Input, ToolPage, ToolCta],
  template: `
    <ro-tool-page
      title="حاسبة نقطة التعادل"
      intro="اعرف كم وحدة تحتاج أن تبيع شهريًا لتغطي تكاليفك، ومتى تسترد رأس المال. أول خطوة في أي دراسة جدوى."
    >
      <div inputs class="grid gap-5 sm:grid-cols-2">
        <ro-form-field label="العملة">
          <select roInput [(ngModel)]="currency">
            @for (c of currencies; track c) {
              <option [value]="c">{{ c }}</option>
            }
          </select>
        </ro-form-field>
        <ro-form-field label="رأس المال المبدئي" hint="تجهيزات، ديكور، رخص...">
          <input roInput type="number" min="0" [(ngModel)]="investment" dir="ltr" />
        </ro-form-field>
        <ro-form-field label="التكاليف الثابتة شهريًا" hint="إيجار، رواتب، اشتراكات">
          <input roInput type="number" min="0" [(ngModel)]="fixed" dir="ltr" />
        </ro-form-field>
        <ro-form-field label="سعر بيع الوحدة">
          <input roInput type="number" min="0" step="0.01" [(ngModel)]="price" dir="ltr" />
        </ro-form-field>
        <ro-form-field label="التكلفة المتغيرة للوحدة" hint="خامات وتغليف لكل وحدة">
          <input roInput type="number" min="0" step="0.01" [(ngModel)]="variable" dir="ltr" />
        </ro-form-field>
        <ro-form-field label="المبيعات المتوقعة شهريًا (وحدة)">
          <input roInput type="number" min="0" [(ngModel)]="expected" dir="ltr" />
        </ro-form-field>
      </div>

      <ng-container result>
        <div class="rounded-2xl border bg-surface-raised p-6 shadow-soft">
          @if (result().units !== null) {
            <p class="text-sm text-ink-muted">نقطة التعادل الشهرية</p>
            <p class="mt-1 text-4xl font-bold text-primary">
              {{ result().units }} <span class="text-lg">وحدة</span>
            </p>
            <p class="text-sm text-ink-muted">إيراد {{ money(result().revenue!) }}</p>
            <dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-xl bg-surface-sunken p-3">
                <dt class="text-ink-subtle">الربح الشهري المتوقع</dt>
                <dd
                  class="mt-1 font-semibold"
                  [class]="result().monthlyProfit >= 0 ? 'text-success' : 'text-danger'"
                >
                  {{ money(result().monthlyProfit) }}
                </dd>
              </div>
              <div class="rounded-xl bg-surface-sunken p-3">
                <dt class="text-ink-subtle">استرداد رأس المال</dt>
                <dd class="mt-1 font-semibold text-ink">
                  {{
                    result().paybackMonths !== null
                      ? result().paybackMonths + ' شهر'
                      : 'لا يُسترد بهذه الأرقام'
                  }}
                </dd>
              </div>
            </dl>
          } @else {
            <p class="text-sm text-danger">
              سعر البيع أقل من أو يساوي تكلفة الوحدة، فكل عملية بيع خاسرة. راجع التسعير.
            </p>
          }
        </div>
        <ro-tool-cta
          service="FEASIBILITY"
          [summary]="summary()"
          title="تحتاج دراسة جدوى كاملة؟"
          text="دراسة سوقية وفنية ومالية مناسبة لجهات التمويل والترخيص، بسعر مناسب."
        />
      </ng-container>
    </ro-tool-page>
  `,
})
export class BreakEvenPage {
  protected readonly currencies = CURRENCIES;
  protected readonly currency = signal('QAR');
  protected readonly investment = signal(100000);
  protected readonly fixed = signal(20000);
  protected readonly price = signal(25);
  protected readonly variable = signal(10);
  protected readonly expected = signal(2000);

  protected readonly result = computed(() =>
    breakEven({
      fixedMonthly: Number(this.fixed()) || 0,
      pricePerUnit: Number(this.price()) || 0,
      variablePerUnit: Number(this.variable()) || 0,
      expectedUnitsMonthly: Number(this.expected()) || 0,
      initialInvestment: Number(this.investment()) || 0,
    }),
  );

  protected readonly summary = computed(() => {
    const r = this.result();
    return (
      `مشروع برأس مال ${this.money(Number(this.investment()) || 0)} وتكاليف ثابتة ${this.money(Number(this.fixed()) || 0)} شهريًا` +
      (r.units !== null ? `، نقطة التعادل ${r.units} وحدة شهريًا` : '') +
      '. أحتاج دراسة جدوى كاملة.'
    );
  });

  protected money(value: number): string {
    return formatMoney({ price: value, currency: this.currency() });
  }
}
