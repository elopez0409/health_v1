import { DailyReadinessInputs, DriverSummary, ReadinessOutput } from './types';

const DEFAULT_WEIGHTS: Record<string, number> = {
  sleepQuality: 0.25,
  sleepDuration: 0.1,
  hrv: 0.2,
  restingHr: 0.15,
  activityLoad: 0.15,
  hydration: 0.075,
  nutrition: 0.075,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const normalize = {
  sleepQuality: (value: number) => clamp(value, 0, 100),
  sleepDuration: (value: number) => clamp((value / 8) * 100, 0, 100),
  hrv: (value: number, baseline: number) => clamp(50 + ((value - baseline) / Math.max(1, baseline)) * 100, 0, 100),
  restingHr: (value: number, baseline: number) => clamp(50 + ((baseline - value) / Math.max(1, baseline)) * 100, 0, 100),
  activityLoad: (value: number) => clamp(100 - Math.abs(value - 55) * 1.4, 0, 100),
  hydration: (value: number) => clamp(value, 0, 100),
  nutrition: (value: number) => clamp(value, 0, 100),
};

const describeDriver = (name: string, score: number, direction: 'up' | 'down') => {
  if (name === 'HRV') {
    return direction === 'up' ? 'HRV is above your 14-day baseline.' : 'HRV dipped below your 14-day baseline.';
  }
  if (name === 'Resting HR') {
    return direction === 'up' ? 'Resting heart rate stayed below your baseline.' : 'Resting heart rate is elevated vs baseline.';
  }
  if (name === 'Sleep Quality') {
    return score > 75 ? 'Sleep quality was strong and consistent.' : 'Sleep quality is below your usual target.';
  }
  if (name === 'Activity Load') {
    return direction === 'up' ? 'Training load is in a productive range.' : 'Training load may be too high for full recovery.';
  }
  if (name === 'Hydration') {
    return direction === 'up' ? 'Hydration target is nearly complete.' : 'Hydration is below target for the day.';
  }
  return direction === 'up' ? 'Nutrition adherence supported recovery.' : 'Nutrition consistency is lower than ideal.';
};

export function calculateReadinessScore(
  today: DailyReadinessInputs,
  baselineWindow: DailyReadinessInputs[]
): ReadinessOutput {
  const baseline = baselineWindow.length
    ? baselineWindow.reduce(
        (acc, day) => {
          acc.hrv += day.hrvMs;
          acc.restingHr += day.restingHr;
          return acc;
        },
        { hrv: 0, restingHr: 0 }
      )
    : { hrv: today.hrvMs, restingHr: today.restingHr };

  const divisor = Math.max(1, baselineWindow.length);
  const hrvBaseline = baseline.hrv / divisor;
  const restingBaseline = baseline.restingHr / divisor;

  const factorScores = {
    'Sleep Quality': normalize.sleepQuality(today.sleepQualityScore),
    'Sleep Duration': normalize.sleepDuration(today.sleepDurationHours),
    HRV: normalize.hrv(today.hrvMs, hrvBaseline),
    'Resting HR': normalize.restingHr(today.restingHr, restingBaseline),
    'Activity Load': normalize.activityLoad(today.activityLoad),
    Hydration: normalize.hydration(today.hydrationPct),
    Nutrition: normalize.nutrition(today.nutritionAdherence),
  };

  const weighted = [
    ['Sleep Quality', factorScores['Sleep Quality'], DEFAULT_WEIGHTS.sleepQuality],
    ['Sleep Duration', factorScores['Sleep Duration'], DEFAULT_WEIGHTS.sleepDuration],
    ['HRV', factorScores.HRV, DEFAULT_WEIGHTS.hrv],
    ['Resting HR', factorScores['Resting HR'], DEFAULT_WEIGHTS.restingHr],
    ['Activity Load', factorScores['Activity Load'], DEFAULT_WEIGHTS.activityLoad],
    ['Hydration', factorScores.Hydration, DEFAULT_WEIGHTS.hydration],
    ['Nutrition', factorScores.Nutrition, DEFAULT_WEIGHTS.nutrition],
  ] as const;

  const score = Math.round(
    weighted.reduce((sum, [, normalizedValue, weight]) => sum + normalizedValue * weight, 0)
  );

  const drivers: DriverSummary[] = weighted
    .map(([name, normalizedValue, weight]) => {
      const impact = Number(((normalizedValue - 50) * weight).toFixed(2));
      const direction: 'up' | 'down' = impact >= 0 ? 'up' : 'down';
      return {
        name,
        value: Number(normalizedValue.toFixed(2)),
        impact,
        direction,
        explanation: describeDriver(name, normalizedValue, direction),
      };
    })
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3);

  const primary = drivers[0];

  return {
    score: clamp(score, 0, 100),
    modelVersion: 'v1.0.0',
    weightsUsed: DEFAULT_WEIGHTS,
    drivers,
    primaryInsight: primary
      ? `${primary.name} is the strongest ${primary.direction === 'up' ? 'positive' : 'negative'} driver today.`
      : 'Readiness is stable today.',
  };
}
