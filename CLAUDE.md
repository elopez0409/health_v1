# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npm start          # Expo dev server (QR code for Expo Go)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser

# No lint or test commands are configured yet
```

## Environment Setup

Copy `.env.example` to `.env` and fill in:
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

Database: run `supabase/migrations/001_initial_schema.sql` then `supabase/seed.sql` against your Supabase project. For local development, disable "Confirm email" in Supabase Dashboard (Authentication → Providers → Email) so sign-up returns a session immediately.

## Architecture

**HealthHub** is a React Native health analytics app (Expo Router) with an AI chat assistant powered by Claude.

### Key layers

| Layer | Location | Purpose |
|-------|----------|---------|
| Screens | `app/(auth)/`, `app/(app)/(tabs)/` | File-based routing via Expo Router |
| Components | `components/` | Reusable UI (MetricCard, TrendChart, ChatMessage, etc.) |
| Hooks | `hooks/` | Business logic + Supabase queries (useAuth, useFeedback, useMetrics, useReadiness) |
| Core logic | `lib/` | Readiness engine, Supabase client, types, constants, mock data |
| Backend | `supabase/functions/health-chat/` | Deno edge function — Claude-powered AI chat |

### Navigation structure

- `app/(auth)/` — sign-in, sign-up, onboarding, reset-password
- `app/(app)/(tabs)/` — 5 tabs: Home, Insights, Goals, Chat, Profile
- Root layout (`app/_layout.tsx`) wraps everything in auth + query providers

### State management

- **Zustand** for global client state
- **TanStack React Query** for server state / Supabase data fetching
- **Supabase Auth** manages sessions (persisted via AsyncStorage + Expo SecureStore)

### Readiness Engine (`lib/readiness-engine.ts`)

Computes a 0-100 daily readiness score from 7 weighted factors:

| Factor | Weight |
|--------|--------|
| Sleep Quality | 25% |
| HRV | 20% |
| Resting Heart Rate | 15% |
| Activity Load | 15% |
| Sleep Duration | 10% |
| Hydration | 7.5% |
| Nutrition Adherence | 7.5% |

HRV and RHR are compared to 14-day personal baselines. The engine also surfaces the top 3 "drivers" with natural-language explanations.

### AI Chat (`supabase/functions/health-chat/index.ts`)

Deno edge function that runs an agentic Claude Sonnet 4.6 loop:
- System prompt injects user context (name, readiness score, 14-day averages, active goals)
- Claude calls tools to fetch data: `query_readiness_history`, `query_metric_detail`, `query_feedback_history`, `query_goals`
- Returns `{ reply: string }` to the client

### Database (Supabase / PostgreSQL)

All tables have RLS enabled with `user_id` ownership. Key tables: `profiles`, `normalized_metrics`, `readiness_results`, `user_feedback`, `goals`, `connected_sources`, `dashboard_preferences`.

### Path alias

`@/*` resolves to the project root (configured in `tsconfig.json`).
