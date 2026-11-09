import { Component, computed, signal } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { DataKind, Design, Goal, Groups, Outcome, adviseTest } from './tool-calcs';
import { ToolCta } from './tool-cta';
import { ToolPage } from './tool-page';

interface Choice<V> {
  readonly value: V;
  readonly label: string;
  readonly hint?: string;
}

const GOALS: Choice<Goal>[] = [
  { value: 'compare', label: 'مقارنة مجموعات', hint: 'مثل: هل يختلف الرضا بين الذكور والإناث؟' },
  { value: 'relate', label: 'علاقة بين متغيرين', hint: 'مثل: هل يرتبط الدخل بالرضا الوظيفي؟' },
  { value: 'predict', label: 'أثر / تنبؤ', hint: 'مثل: ما أثر القيادة على الأداء؟' },
];
const GROUPS: Choice<Groups>[] = [
  { value: 'two', label: 'مجموعتان' },
  { value: 'many', label: '3 مجموعات أو أكثر' },
];
const DESIGNS: Choice<Design>[] = [
  { value: 'independent', label: 'أشخاص مختلفون في كل مجموعة' },
  { value: 'paired', label: 'نفس الأشخاص قبل/بعد أو أكثر من قياس' },
];
const DATA: Choice<DataKind>[] = [
  { value: 'normal', label: 'رقمية وتتبع التوزيع الطبيعي' },
  { value: 'ordinal', label: 'ترتيبية أو لا تتبع التوزيع الطبيعي' },
  { value: 'categorical', label: 'فئات (نعم/لا، أنواع)' },
];
const OUTCOMES: Choice<Outcome>[] = [
  { value: 'continuous', label: 'المتغير التابع رقمي' },
  { value: 'binary', label: 'المتغير التابع نعم/لا' },
  { value: 'latent', label: 'نموذج بمتغيرات كامنة (محاور بعدة عبارات)' },
];

/** Step-by-step questions that end with the recommended test. */
@Component({
  selector: 'ro-stat-test-page',
  imports: [ToolPage, ToolCta, LucideCheck],
  template: `
    <ro-tool-page
      title="أي اختبار إحصائي أستخدم؟"
      intro="أجب عن أسئلة قصيرة عن دراستك، ونرشح لك الاختبار المناسب وسبب اختياره."
    >
      <div inputs class="flex flex-col gap-6">
        <fieldset class="flex flex-col gap-2">
          <legend class="mb-2 font-semibold text-ink">1. ما هدف التحليل؟</legend>
          @for (c of goals; track c.value) {
            <button type="button" [class]="option(goal() === c.value)" (click)="pickGoal(c.value)">
              <span class="font-medium">{{ c.label }}</span>
              @if (c.hint) {
                <span class="block text-xs text-ink-subtle">{{ c.hint }}</span>
              }
            </button>
          }
        </fieldset>

        @if (goal() === 'compare') {
          <fieldset class="flex flex-col gap-2">
            <legend class="mb-2 font-semibold text-ink">2. كم مجموعة تقارن؟</legend>
            @for (c of groupsList; track c.value) {
              <button
                type="button"
                [class]="option(groups() === c.value)"
                (click)="groups.set(c.value)"
              >
                {{ c.label }}
              </button>
            }
          </fieldset>
          <fieldset class="flex flex-col gap-2">
            <legend class="mb-2 font-semibold text-ink">3. من في المجموعات؟</legend>
            @for (c of designs; track c.value) {
              <button
                type="button"
                [class]="option(design() === c.value)"
                (click)="design.set(c.value)"
              >
                {{ c.label }}
              </button>
            }
          </fieldset>
        }

        @if (goal() === 'compare' || goal() === 'relate') {
          <fieldset class="flex flex-col gap-2">
            <legend class="mb-2 font-semibold text-ink">
              {{ goal() === 'compare' ? '4' : '2' }}. ما نوع البيانات؟
            </legend>
            @for (c of dataKinds; track c.value) {
              <button
                type="button"
                [class]="option(data() === c.value)"
                (click)="data.set(c.value)"
              >
                {{ c.label }}
              </button>
            }
          </fieldset>
        }

        @if (goal() === 'predict') {
          <fieldset class="flex flex-col gap-2">
            <legend class="mb-2 font-semibold text-ink">2. ما شكل النموذج؟</legend>
            @for (c of outcomes; track c.value) {
              <button
                type="button"
                [class]="option(outcome() === c.value)"
                (click)="outcome.set(c.value)"
              >
                {{ c.label }}
              </button>
            }
          </fieldset>
        }
      </div>

      <ng-container result>
        @if (advice(); as a) {
          <div class="rounded-2xl border bg-surface-raised p-6 shadow-sm">
            <p class="flex items-center gap-2 text-sm text-success">
              <svg lucideCheck size="16" aria-hidden="true"></svg> الاختبار المناسب
            </p>
            <p class="mt-2 text-2xl font-bold text-ink" dir="ltr">{{ a.test }}</p>
            <p class="mt-3 text-sm leading-relaxed text-ink-muted">{{ a.why }}</p>
            <p class="mt-3 text-sm text-ink">
              البرنامج: <strong>{{ a.software }}</strong>
            </p>
          </div>
          <ro-tool-cta
            service="STAT_ANALYSIS"
            [summary]="summary()"
            title="نطبّقه لك على بياناتك"
          />
        } @else {
          <p class="rounded-2xl bg-surface-sunken p-6 text-center text-sm text-ink-muted">
            أجب عن الأسئلة لتظهر التوصية.
          </p>
        }
      </ng-container>
    </ro-tool-page>
  `,
})
export class StatTestPage {
  protected readonly goals = GOALS;
  protected readonly groupsList = GROUPS;
  protected readonly designs = DESIGNS;
  protected readonly dataKinds = DATA;
  protected readonly outcomes = OUTCOMES;

  protected readonly goal = signal<Goal | null>(null);
  protected readonly groups = signal<Groups | null>(null);
  protected readonly design = signal<Design | null>(null);
  protected readonly data = signal<DataKind | null>(null);
  protected readonly outcome = signal<Outcome | null>(null);

  protected readonly advice = computed(() => {
    const goal = this.goal();
    return goal
      ? adviseTest({
          goal,
          groups: this.groups() ?? undefined,
          design: this.design() ?? undefined,
          data: this.data() ?? undefined,
          outcome: this.outcome() ?? undefined,
        })
      : null;
  });

  protected readonly summary = computed(() => {
    const a = this.advice();
    return a ? `الأداة رشحت اختبار ${a.test} (${a.software}). أحتاج تطبيقه على بيانات دراستي.` : '';
  });

  protected pickGoal(goal: Goal): void {
    this.goal.set(goal);
    this.groups.set(null);
    this.design.set(null);
    this.data.set(null);
    this.outcome.set(null);
  }

  protected option(selected: boolean): string {
    return (
      'rounded-xl border px-4 py-3 text-start text-sm text-ink transition-colors hover:border-primary ' +
      (selected
        ? 'border-primary bg-brand-50 ring-2 ring-primary/20 dark:bg-brand-900'
        : 'bg-surface-raised')
    );
  }
}
