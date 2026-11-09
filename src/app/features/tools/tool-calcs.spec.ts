import { adviseTest, breakEven, sampleSize } from './tool-calcs';

describe('sampleSize', () => {
  it('gives the classic 385 for a large population at 95% / ±5%', () => {
    expect(
      sampleSize({
        population: null,
        confidence: 95,
        marginPercent: 5,
        proportionPercent: 50,
        responseRatePercent: 100,
      }).sample,
    ).toBe(385);
  });

  it('applies the finite population correction (N=1000 → 278) and the response rate', () => {
    const r = sampleSize({
      population: 1000,
      confidence: 95,
      marginPercent: 5,
      proportionPercent: 50,
      responseRatePercent: 50,
    });
    expect(r.sample).toBe(278);
    expect(r.toInvite).toBe(556);
  });
});

describe('adviseTest', () => {
  it('compares two independent normal groups with a t-test', () => {
    expect(
      adviseTest({ goal: 'compare', groups: 'two', design: 'independent', data: 'normal' })?.test,
    ).toBe('Independent Samples t-test');
  });

  it('uses Kruskal-Wallis for 3+ independent non-normal groups', () => {
    expect(
      adviseTest({ goal: 'compare', groups: 'many', design: 'independent', data: 'ordinal' })?.test,
    ).toBe('Kruskal-Wallis');
  });

  it('recommends SEM for latent constructs and waits for missing answers', () => {
    expect(adviseTest({ goal: 'predict', outcome: 'latent' })?.software).toContain('SmartPLS');
    expect(adviseTest({ goal: 'compare', data: 'normal' })).toBeNull();
  });
});

describe('breakEven', () => {
  it('computes units, revenue and payback', () => {
    const r = breakEven({
      fixedMonthly: 20000,
      pricePerUnit: 25,
      variablePerUnit: 10,
      expectedUnitsMonthly: 2000,
      initialInvestment: 100000,
    });
    expect(r.units).toBe(1334);
    expect(r.revenue).toBe(33350);
    expect(r.monthlyProfit).toBe(10000);
    expect(r.paybackMonths).toBe(10);
  });

  it('reports no break-even when price does not cover variable cost', () => {
    const r = breakEven({
      fixedMonthly: 1000,
      pricePerUnit: 10,
      variablePerUnit: 12,
      expectedUnitsMonthly: 100,
      initialInvestment: 0,
    });
    expect(r.units).toBeNull();
    expect(r.paybackMonths).toBeNull();
  });
});
