import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField } from '@shared/forms/form-field';
import { Input } from '@shared/forms/input';
import { Confidence, sampleSize } from './tool-calcs';
import { ToolCta } from './tool-cta';
import { ToolPage } from './tool-page';

@Component({
  selector: 'ro-sample-size-page',
  imports: [FormsModule, FormField, Input, ToolPage, ToolCta],
  template: `
    <ro-tool-page
      title="حاسبة حجم العينة"
      intro="احسب عدد المشاركين المطلوب لاستبيانك بمعادلة كوكران مع تصحيح المجتمع المحدود، وهي الطريقة المعتمدة في أغلب الرسائل العلمية."
    >
      <div inputs class="grid gap-5 sm:grid-cols-2">
        <ro-form-field
          label="حجم المجتمع"
          hint="اتركه فارغًا إذا كان كبيرًا جدًا أو غير معروف"
          class="sm:col-span-2"
        >
          <input
            roInput
            type="number"
            min="1"
            [(ngModel)]="population"
            dir="ltr"
            placeholder="مثال: 1200"
          />
        </ro-form-field>
        <ro-form-field label="مستوى الثقة">
          <select roInput [(ngModel)]="confidence">
            <option [ngValue]="90">90%</option>
            <option [ngValue]="95">95% (الأكثر استخدامًا)</option>
            <option [ngValue]="99">99%</option>
          </select>
        </ro-form-field>
        <ro-form-field label="هامش الخطأ (%)">
          <input roInput type="number" min="1" max="20" step="0.5" [(ngModel)]="margin" dir="ltr" />
        </ro-form-field>
        <ro-form-field label="النسبة المتوقعة (%)" hint="50% تعطي أكبر عينة وأكثرها أمانًا">
          <input roInput type="number" min="1" max="99" [(ngModel)]="proportion" dir="ltr" />
        </ro-form-field>
        <ro-form-field label="نسبة الاستجابة المتوقعة (%)" hint="لتعرف كم شخصًا ترسل له الاستبيان">
          <input roInput type="number" min="1" max="100" [(ngModel)]="responseRate" dir="ltr" />
        </ro-form-field>
      </div>

      <ng-container result>
        @if (result(); as r) {
          <div class="rounded-2xl border bg-surface-raised p-6 text-center shadow-sm">
            <p class="text-sm text-ink-muted">حجم العينة المطلوب</p>
            <p class="mt-1 text-5xl font-bold text-primary">{{ r.sample }}</p>
            <p class="mt-1 text-sm text-ink-muted">مشاركًا</p>
            @if (r.toInvite > r.sample) {
              <p class="mt-4 rounded-xl bg-surface-sunken px-3 py-2 text-sm text-ink">
                أرسل الاستبيان إلى <strong>{{ r.toInvite }}</strong> شخصًا على الأقل
              </p>
            }
          </div>
          <ro-tool-cta
            service="STAT_ANALYSIS"
            [summary]="summary()"
            title="جمعت البيانات؟"
            text="نحلل استبيانك بـ SPSS أو AMOS أو SmartPLS مع جداول جاهزة وتفسير للنتائج."
          />
        } @else {
          <p class="rounded-2xl bg-surface-sunken p-6 text-center text-sm text-ink-muted">
            أدخل قيمًا صحيحة لرؤية النتيجة.
          </p>
        }
      </ng-container>
    </ro-tool-page>
  `,
})
export class SampleSizePage {
  protected readonly population = signal<number | null>(null);
  protected readonly confidence = signal<Confidence>(95);
  protected readonly margin = signal(5);
  protected readonly proportion = signal(50);
  protected readonly responseRate = signal(100);

  protected readonly result = computed(() => {
    const margin = Number(this.margin());
    const p = Number(this.proportion());
    const rate = Number(this.responseRate());
    if (!(margin > 0 && margin <= 20 && p > 0 && p < 100 && rate > 0 && rate <= 100)) return null;
    return sampleSize({
      population: Number(this.population()) || null,
      confidence: this.confidence(),
      marginPercent: margin,
      proportionPercent: p,
      responseRatePercent: rate,
    });
  });

  protected readonly summary = computed(() => {
    const r = this.result();
    const n = Number(this.population()) || 'غير محدد';
    return r
      ? `حسبت حجم العينة: ${r.sample} مشاركًا (المجتمع ${n}، ثقة ${this.confidence()}%، هامش خطأ ${this.margin()}%). أحتاج تحليلًا إحصائيًا للبيانات.`
      : '';
  });
}
