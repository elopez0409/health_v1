import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import OnboardingStep from '@/components/OnboardingStep';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_DASHBOARD_PREFS, DEFAULT_GOAL_TEMPLATES } from '@/lib/constants';
import { seedMockDataForUser } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';

const providers = ['Apple Health', 'Oura', 'Strava', 'Garmin', 'Whoop', 'Fitbit'];
const providerDbMap: Record<string, 'apple_health' | 'oura' | 'strava' | 'garmin' | 'whoop' | 'fitbit'> = {
  'Apple Health': 'apple_health',
  Oura: 'oura',
  Strava: 'strava',
  Garmin: 'garmin',
  Whoop: 'whoop',
  Fitbit: 'fitbit',
};

export default function OnboardingScreen() {
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(true);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Endurance']);
  const [connected, setConnected] = useState<string[]>(['Apple Health', 'Oura']);
  const [bottleSizeOz, setBottleSizeOz] = useState(24);
  const [isSaving, setIsSaving] = useState(false);

  const steps = useMemo(() => ['Welcome', 'Privacy', 'Goals', 'Devices', 'Hydration'], []);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((item) => item !== goal) : [...prev, goal]));
  };

  const toggleProvider = (provider: string) => {
    setConnected((prev) => (prev.includes(provider) ? prev.filter((item) => item !== provider) : [...prev, provider]));
  };

  const finishOnboarding = async () => {
    if (!user) {
      Alert.alert('Missing session', 'Please sign in again.');
      return;
    }

    setIsSaving(true);

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      onboarding_completed: true,
      hydration_bottle_oz: bottleSizeOz,
      privacy_settings: {
        cloudBackupEnabled,
        exportAllowed: true,
        localFeedbackStoragePreferred: true,
      },
    });
    if (profileError) {
      setIsSaving(false);
      Alert.alert('Could not save profile', profileError.message);
      return;
    }

    const goalsPayload = selectedGoals.map((title) => ({
      user_id: user.id,
      title,
      description: `Template goal: ${title}`,
      category: 'performance',
      target_value: 100,
      current_value: 0,
      unit: '%',
      status: 'active',
    }));

    if (goalsPayload.length) {
      const { error: goalError } = await supabase.from('goals').insert(goalsPayload);
      if (goalError) {
        setIsSaving(false);
        Alert.alert('Could not save goals', goalError.message);
        return;
      }
    }

    const sourcePayload = connected.map((provider) => ({
      user_id: user.id,
      provider: providerDbMap[provider],
      sync_status: 'synced',
    }));

    if (sourcePayload.length) {
      const { error: sourceError } = await supabase.from('connected_sources').insert(sourcePayload);
      if (sourceError) {
        setIsSaving(false);
        Alert.alert('Could not save device connections', sourceError.message);
        return;
      }
    }

    const { error: prefError } = await supabase.from('dashboard_preferences').upsert({
      user_id: user.id,
      card_order: DEFAULT_DASHBOARD_PREFS.cardOrder,
      pinned_charts: DEFAULT_DASHBOARD_PREFS.pinnedCharts,
      favorite_metrics: DEFAULT_DASHBOARD_PREFS.favoriteMetrics,
    });

    if (prefError) {
      setIsSaving(false);
      Alert.alert('Could not save dashboard preferences', prefError.message);
      return;
    }

    const { error: seedError } = await seedMockDataForUser(user.id);
    if (seedError) {
      setIsSaving(false);
      Alert.alert('Could not seed sample metrics', seedError.message);
      return;
    }

    await completeOnboarding();
    setIsSaving(false);
    router.replace('/(app)/(tabs)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Set up HealthHub</Text>
      <Text style={styles.subtitle}>Step {step + 1} of {steps.length}: {steps[step]}</Text>

      {step === 0 && (
        <OnboardingStep
          title="One readiness score from all your devices"
          description="HealthHub combines multi-source metrics, then explains what is driving your readiness each day."
        />
      )}

      {step === 1 && (
        <OnboardingStep
          title="Privacy controls"
          description="Sensitive feedback stays local-first where possible. You can export or delete anytime."
        >
          <Pressable style={[styles.option, cloudBackupEnabled && styles.optionSelected]} onPress={() => setCloudBackupEnabled((prev) => !prev)}>
            <Text style={styles.optionText}>Cloud backup {cloudBackupEnabled ? 'enabled' : 'disabled'}</Text>
          </Pressable>
        </OnboardingStep>
      )}

      {step === 2 && (
        <OnboardingStep title="Select your primary goals" description="Pick what you want to improve first.">
          {DEFAULT_GOAL_TEMPLATES.map((goal) => {
            const selected = selectedGoals.includes(goal.title);
            return (
              <Pressable key={goal.title} style={[styles.option, selected && styles.optionSelected]} onPress={() => toggleGoal(goal.title)}>
                <Text style={styles.optionText}>{goal.title}</Text>
              </Pressable>
            );
          })}
        </OnboardingStep>
      )}

      {step === 3 && (
        <OnboardingStep title="Connect your sources" description="Use mock connections now, replace with OAuth integrations later.">
          {providers.map((provider) => {
            const selected = connected.includes(provider);
            return (
              <Pressable key={provider} style={[styles.option, selected && styles.optionSelected]} onPress={() => toggleProvider(provider)}>
                <Text style={styles.optionText}>{provider}</Text>
              </Pressable>
            );
          })}
        </OnboardingStep>
      )}

      {step === 4 && (
        <OnboardingStep title="Hydration setup" description="Select your bottle size to enable one-tap hydration logging.">
          {[16, 20, 24, 32].map((size) => (
            <Pressable key={size} style={[styles.option, bottleSizeOz === size && styles.optionSelected]} onPress={() => setBottleSizeOz(size)}>
              <Text style={styles.optionText}>{size} oz bottle</Text>
            </Pressable>
          ))}
        </OnboardingStep>
      )}

      <View style={styles.actions}>
        <Pressable style={[styles.buttonSecondary, step === 0 && styles.buttonDisabled]} disabled={step === 0} onPress={() => setStep((prev) => prev - 1)}>
          <Text style={styles.secondaryText}>Back</Text>
        </Pressable>

        {step < steps.length - 1 ? (
          <Pressable style={styles.buttonPrimary} onPress={() => setStep((prev) => prev + 1)}>
            <Text style={styles.primaryText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.buttonPrimary} onPress={finishOnboarding} disabled={isSaving}>
            <Text style={styles.primaryText}>{isSaving ? 'Saving...' : 'Finish setup'}</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#081127' },
  content: { padding: 20, gap: 14 },
  title: { fontSize: 30, fontWeight: '700', color: '#F9FAFB' },
  subtitle: { fontSize: 15, color: '#9CA3AF' },
  option: {
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    backgroundColor: '#0F172A',
  },
  optionSelected: { borderColor: '#4F46E5', backgroundColor: '#111D4F' },
  optionText: { color: '#F9FAFB', fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  buttonPrimary: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  buttonSecondary: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondaryText: { color: '#D1D5DB', fontWeight: '700' },
});
