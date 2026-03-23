export const APP_COLORS = {
  background: '#040B1D',
  surface: '#0B1328',
  border: '#1F2937',
  text: '#F9FAFB',
  mutedText: '#9CA3AF',
  primary: '#4F46E5',
};

export const SUPPORTED_PROVIDERS = ['Apple Health', 'Oura', 'Strava', 'Garmin', 'Whoop', 'Fitbit'];

export const DEFAULT_DASHBOARD_PREFS = {
  cardOrder: ['readiness', 'sleep', 'recovery', 'activity', 'hydration', 'nutrition'],
  pinnedCharts: ['readiness_7d', 'hrv_7d', 'sleep_7d'],
  favoriteMetrics: ['readiness', 'hrv', 'resting_hr', 'sleep_quality', 'steps'],
};

export const DEFAULT_GOAL_TEMPLATES = [
  { title: 'Endurance', description: 'Improve aerobic capacity', category: 'performance', target_value: 100, current_value: 0, unit: '%' },
  { title: 'Strength', description: 'Increase training consistency', category: 'performance', target_value: 100, current_value: 0, unit: '%' },
  { title: 'Sleep Quality', description: 'Increase sleep score and consistency', category: 'recovery', target_value: 100, current_value: 0, unit: '%' },
  { title: 'Recovery', description: 'Improve recovery readiness', category: 'recovery', target_value: 100, current_value: 0, unit: '%' },
  { title: 'Body Composition', description: 'Improve body composition trend', category: 'body', target_value: 100, current_value: 0, unit: '%' },
  { title: 'Longevity', description: 'Improve health span consistency', category: 'wellness', target_value: 100, current_value: 0, unit: '%' },
] as const;
