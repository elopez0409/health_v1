# HealthHub MVP Core

React Native (Expo Router) implementation of the HealthHub MVP core using Supabase.

## Features implemented

- Supabase auth (sign in, sign up, reset password)
- Onboarding flow (privacy, goals, mock devices, hydration setup)
- Dashboard with readiness score, top drivers, metric cards, trend chart
- Daily 1-10 feedback loop with streak and trend overlay
- Goals tab for template/custom goals and progress updates
- Profile tab with privacy controls, connected devices, export/delete stubs
- Readiness engine v1 with configurable weights and driver explanations
- Mock data generator for 30 days of realistic health metrics
- Supabase schema + RLS migration under `supabase/migrations`

## Setup

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

4. Start the app

```bash
npm run ios
# or
npm run android
# or
npm run web
```

## Supabase

- Apply `supabase/migrations/001_initial_schema.sql`
- Optionally run `supabase/seed.sql` after creating a test user
- **Development:** Disable "Confirm email" in Supabase Dashboard (Authentication → Providers → Email) so sign-up returns a session immediately and onboarding works without email verification
