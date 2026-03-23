-- Seed defaults for local development after creating a test user.
-- Replace :user_id with a real UUID before running.

insert into profiles (id, display_name, onboarding_completed, hydration_bottle_oz, privacy_settings)
values (
  :user_id,
  'HealthHub Demo',
  true,
  24,
  '{"cloudBackupEnabled": true, "exportAllowed": true, "localFeedbackStoragePreferred": true}'::jsonb
)
on conflict (id) do nothing;

insert into dashboard_preferences (user_id, card_order, pinned_charts, favorite_metrics)
values (
  :user_id,
  '["readiness", "sleep", "recovery", "activity", "hydration", "nutrition"]'::jsonb,
  '["readiness_7d", "hrv_7d", "sleep_7d"]'::jsonb,
  '["readiness", "hrv", "resting_hr", "sleep_quality", "steps"]'::jsonb
)
on conflict (user_id) do nothing;
