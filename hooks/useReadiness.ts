import { useMemo } from 'react';

import { generateMockHistoryForReadiness } from '@/lib/mock-data';
import { calculateReadinessScore } from '@/lib/readiness-engine';

export function useReadiness() {
  const history = useMemo(() => generateMockHistoryForReadiness(30), []);

  const latestMetrics = useMemo(() => history[history.length - 1], [history]);
  const baseline = useMemo(() => history.slice(-15, -1), [history]);

  const readiness = useMemo(() => calculateReadinessScore(latestMetrics, baseline), [latestMetrics, baseline]);

  const trend = useMemo(
    () => history.slice(-7).map((day) => calculateReadinessScore(day, baseline).score),
    [history, baseline]
  );

  return {
    readiness,
    topDrivers: readiness.drivers,
    latestMetrics,
    trend,
  };
}
