/**
 * Pure calculations behind the free tools (unit-tested; no Angular).
 */

// ---------------- sample size (Cochran, finite population correction) ----------------

export const Z_SCORES = { 90: 1.645, 95: 1.96, 99: 2.576 } as const;
export type Confidence = keyof typeof Z_SCORES;

export interface SampleSizeInput {
  /** Total population; null/0 = very large (unknown). */
  readonly population: number | null;
  readonly confidence: Confidence;
  /** Margin of error in percent, e.g. 5. */
  readonly marginPercent: number;
  /** Expected proportion in percent; 50 is the safest (largest sample). */
  readonly proportionPercent: number;
  /** Expected response rate in percent, to know how many people to invite. */
  readonly responseRatePercent: number;
}

export interface SampleSizeResult {
  readonly sample: number;
  readonly toInvite: number;
}

export function sampleSize(i: SampleSizeInput): SampleSizeResult {
  const z = Z_SCORES[i.confidence];
  const e = i.marginPercent / 100;
  const p = i.proportionPercent / 100;
  const n0 = (z * z * p * (1 - p)) / (e * e);
  const n = i.population && i.population > 0 ? n0 / (1 + (n0 - 1) / i.population) : n0;
  const sample = Math.ceil(n);
  const rate = Math.min(Math.max(i.responseRatePercent, 1), 100) / 100;
  return { sample, toInvite: Math.ceil(sample / rate) };
}

// ---------------- which statistical test ----------------

export type Goal = 'compare' | 'relate' | 'predict';
export type Groups = 'two' | 'many';
export type Design = 'independent' | 'paired';
export type DataKind = 'normal' | 'ordinal' | 'categorical';
export type Outcome = 'continuous' | 'binary' | 'latent';

export interface TestQuestion {
  readonly goal: Goal;
  readonly groups?: Groups;
  readonly design?: Design;
  readonly data?: DataKind;
  readonly outcome?: Outcome;
}

export interface TestAdvice {
  readonly test: string;
  readonly why: string;
  readonly software: string;
}

const COMPARE: Record<Groups, Record<Design, Record<DataKind, string>>> = {
  two: {
    independent: {
      normal: 'Independent Samples t-test',
      ordinal: 'Mann-Whitney U',
      categorical: 'Chi-square',
    },
    paired: {
      normal: 'Paired Samples t-test',
      ordinal: 'Wilcoxon Signed-Rank',
      categorical: 'McNemar',
    },
  },
  many: {
    independent: { normal: 'One-way ANOVA', ordinal: 'Kruskal-Wallis', categorical: 'Chi-square' },
    paired: { normal: 'Repeated Measures ANOVA', ordinal: 'Friedman', categorical: "Cochran's Q" },
  },
};

const RELATE: Record<DataKind, string> = {
  normal: 'Pearson Correlation',
  ordinal: 'Spearman Correlation',
  categorical: "Chi-square Test of Independence + Cramér's V",
};

const PREDICT: Record<Outcome, TestAdvice> = {
  continuous: {
    test: 'Multiple Linear Regression',
    why: 'لقياس أثر عدة متغيرات مستقلة على متغير تابع رقمي.',
    software: 'SPSS',
  },
  binary: {
    test: 'Binary Logistic Regression',
    why: 'لأن المتغير التابع له قيمتان فقط (نعم/لا).',
    software: 'SPSS',
  },
  latent: {
    test: 'Structural Equation Modeling (SEM)',
    why: 'لأن نموذجك فيه متغيرات كامنة تقاس بعدة عبارات وعلاقات متعددة.',
    software: 'AMOS أو SmartPLS',
  },
};

const DATA_WHY: Record<DataKind, string> = {
  normal: 'البيانات رقمية وتتبع التوزيع الطبيعي، فالاختبار المعلمي هو الأقوى.',
  ordinal: 'البيانات ترتيبية أو لا تتبع التوزيع الطبيعي، فالاختبار اللامعلمي هو الأنسب.',
  categorical: 'البيانات فئات (تكرارات)، فنقارن النسب لا المتوسطات.',
};

/** Returns null until the needed answers are given. */
export function adviseTest(q: TestQuestion): TestAdvice | null {
  if (q.goal === 'predict') {
    return q.outcome ? PREDICT[q.outcome] : null;
  }
  if (!q.data) return null;
  if (q.goal === 'relate') {
    return { test: RELATE[q.data], why: DATA_WHY[q.data], software: 'SPSS' };
  }
  if (!q.groups || !q.design) return null;
  return { test: COMPARE[q.groups][q.design][q.data], why: DATA_WHY[q.data], software: 'SPSS' };
}

// ---------------- break-even ----------------

export interface BreakEvenInput {
  readonly fixedMonthly: number;
  readonly pricePerUnit: number;
  readonly variablePerUnit: number;
  readonly expectedUnitsMonthly: number;
  readonly initialInvestment: number;
}

export interface BreakEvenResult {
  /** null when each sale loses money (price ≤ variable cost). */
  readonly units: number | null;
  readonly revenue: number | null;
  readonly monthlyProfit: number;
  /** Months to recover the investment; null when the expected profit is not positive. */
  readonly paybackMonths: number | null;
}

export function breakEven(i: BreakEvenInput): BreakEvenResult {
  const margin = i.pricePerUnit - i.variablePerUnit;
  const units = margin > 0 ? Math.ceil(i.fixedMonthly / margin) : null;
  const monthlyProfit = i.expectedUnitsMonthly * margin - i.fixedMonthly;
  return {
    units,
    revenue: units === null ? null : units * i.pricePerUnit,
    monthlyProfit,
    paybackMonths:
      monthlyProfit > 0 ? Math.ceil((i.initialInvestment / monthlyProfit) * 10) / 10 : null,
  };
}
