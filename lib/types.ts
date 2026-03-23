export type MetricCategory = 'sleep' | 'recovery' | 'activity' | 'cardio' | 'body' | 'hydration' | 'nutrition';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
  privacy_settings: Record<string, unknown>;
  hydration_bottle_oz: number;
  created_at: string;
};

export type DailyReadinessInputs = {
  sleepQualityScore: number;
  sleepDurationHours: number;
  hrvMs: number;
  restingHr: number;
  activityLoad: number;
  hydrationPct: number;
  nutritionAdherence: number;
  steps: number;
  activeCalories: number;
};

export type DriverSummary = {
  name: string;
  value: number;
  impact: number;
  direction: 'up' | 'down';
  explanation: string;
};

export type ReadinessOutput = {
  score: number;
  primaryInsight: string;
  modelVersion: string;
  weightsUsed: Record<string, number>;
  drivers: DriverSummary[];
};
