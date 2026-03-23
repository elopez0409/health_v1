import { DailyReadinessInputs } from './types';
import { supabase } from './supabase';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function maybeWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function generateMockHistoryForReadiness(days: number): DailyReadinessInputs[] {
  const now = new Date();
  const result: DailyReadinessInputs[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const weekend = maybeWeekend(date);

    const sleepDurationHours = weekend ? randomBetween(7.2, 8.8) : randomBetween(6.2, 8.0);
    const sleepQualityScore = clamp((sleepDurationHours / 8) * 78 + randomBetween(5, 20), 40, 97);
    const activityLoad = weekend ? randomBetween(35, 65) : randomBetween(45, 85);
    const hrvMs = clamp(50 + (sleepQualityScore - 70) * 0.35 - (activityLoad - 55) * 0.15 + randomBetween(-8, 8), 20, 85);
    const restingHr = clamp(56 - (hrvMs - 50) * 0.2 + randomBetween(-3, 3), 45, 72);
    const hydrationPct = clamp(randomBetween(45, 100), 0, 100);
    const nutritionAdherence = clamp(randomBetween(52, 98), 0, 100);
    const steps = weekend ? randomBetween(4500, 12000) : randomBetween(5500, 15000);
    const activeCalories = weekend ? randomBetween(240, 620) : randomBetween(300, 820);

    result.push({
      sleepQualityScore,
      sleepDurationHours,
      hrvMs,
      restingHr,
      activityLoad,
      hydrationPct,
      nutritionAdherence,
      steps,
      activeCalories,
    });
  }

  return result;
}

export async function seedMockDataForUser(userId: string): Promise<{ error: Error | null }> {
  const history = generateMockHistoryForReadiness(30);
  const now = new Date();

  const rows = history.flatMap((day, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (29 - index));
    const iso = date.toISOString().slice(0, 10);

    return [
      { user_id: userId, date: iso, category: 'sleep', metric_name: 'sleep_quality_score', value: day.sleepQualityScore, unit: 'score' },
      { user_id: userId, date: iso, category: 'sleep', metric_name: 'sleep_duration_hours', value: day.sleepDurationHours, unit: 'hours' },
      { user_id: userId, date: iso, category: 'recovery', metric_name: 'hrv_ms', value: day.hrvMs, unit: 'ms' },
      { user_id: userId, date: iso, category: 'recovery', metric_name: 'resting_hr', value: day.restingHr, unit: 'bpm' },
      { user_id: userId, date: iso, category: 'activity', metric_name: 'activity_load', value: day.activityLoad, unit: 'score' },
      { user_id: userId, date: iso, category: 'activity', metric_name: 'steps', value: day.steps, unit: 'steps' },
      { user_id: userId, date: iso, category: 'activity', metric_name: 'active_calories', value: day.activeCalories, unit: 'kcal' },
      { user_id: userId, date: iso, category: 'hydration', metric_name: 'hydration_pct', value: day.hydrationPct, unit: '%' },
      { user_id: userId, date: iso, category: 'nutrition', metric_name: 'nutrition_adherence', value: day.nutritionAdherence, unit: '%' },
    ];
  });

  const { error } = await supabase.from('normalized_metrics').insert(rows);
  return { error: (error as Error | null) ?? null };
}
