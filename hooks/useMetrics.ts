import { useMemo } from 'react';

import { useReadiness } from './useReadiness';

export function useMetrics() {
  const { latestMetrics } = useReadiness();

  const metricCards = useMemo(() => {
    return [
      {
        title: 'Sleep',
        value: `${latestMetrics.sleepDurationHours.toFixed(1)}h`,
        subtitle: `Quality ${Math.round(latestMetrics.sleepQualityScore)}`,
        status: latestMetrics.sleepQualityScore > 78 ? 'good' : latestMetrics.sleepQualityScore > 62 ? 'watch' : 'low',
      },
      {
        title: 'Recovery',
        value: `${Math.round(latestMetrics.hrvMs)} ms`,
        subtitle: `RHR ${Math.round(latestMetrics.restingHr)} bpm`,
        status: latestMetrics.hrvMs > 45 ? 'good' : latestMetrics.hrvMs > 35 ? 'watch' : 'low',
      },
      {
        title: 'Activity',
        value: `${Math.round(latestMetrics.steps)}`,
        subtitle: `${Math.round(latestMetrics.activeCalories)} active cal`,
        status: latestMetrics.activityLoad > 70 ? 'watch' : 'good',
      },
      {
        title: 'Hydration',
        value: `${Math.round(latestMetrics.hydrationPct)}%`,
        subtitle: 'Bottle target completion',
        status: latestMetrics.hydrationPct > 75 ? 'good' : latestMetrics.hydrationPct > 55 ? 'watch' : 'low',
      },
      {
        title: 'Nutrition',
        value: `${Math.round(latestMetrics.nutritionAdherence)}%`,
        subtitle: 'Calories + macro adherence',
        status: latestMetrics.nutritionAdherence > 75 ? 'good' : latestMetrics.nutritionAdherence > 60 ? 'watch' : 'low',
      },
    ] as const;
  }, [latestMetrics]);

  return { metricCards };
}
