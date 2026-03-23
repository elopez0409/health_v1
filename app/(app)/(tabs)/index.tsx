import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import FeelingPrompt from '@/components/FeelingPrompt';
import GoalProgressBar from '@/components/GoalProgressBar';
import MetricCard from '@/components/MetricCard';
import ReadinessCircle from '@/components/ReadinessCircle';
import TrendChart from '@/components/TrendChart';
import { useAuth } from '@/hooks/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import { useMetrics } from '@/hooks/useMetrics';
import { useReadiness } from '@/hooks/useReadiness';
import { APP_COLORS } from '@/lib/constants';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { readiness, topDrivers, trend } = useReadiness();
  const { metricCards } = useMetrics();
  const { submitFeeling, streakDays, feedbackTrend } = useFeedback();

  const topGoals = useMemo(
    () => [
      { title: 'Endurance', progress: 68 },
      { title: 'Sleep Consistency', progress: 52 },
      { title: 'Recovery', progress: 41 },
    ],
    []
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Good morning, {profile?.display_name ?? 'Athlete'}</Text>
      <ReadinessCircle score={readiness.score} insight={readiness.primaryInsight} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top drivers</Text>
        {topDrivers.map((driver) => (
          <Text key={driver.name} style={styles.driverText}>
            {driver.direction === 'up' ? '▲' : '▼'} {driver.name}: {driver.explanation}
          </Text>
        ))}
      </View>

      <FeelingPrompt onSubmit={submitFeeling} streakDays={streakDays} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goal progress</Text>
        {topGoals.map((goal) => (
          <GoalProgressBar key={goal.title} title={goal.title} progress={goal.progress} />
        ))}
      </View>

      <View style={styles.rowWrap}>
        {metricCards.map((card) => (
          <MetricCard key={card.title} title={card.title} value={card.value} subtitle={card.subtitle} status={card.status} />
        ))}
      </View>

      <TrendChart title="7-day readiness trend" data={trend} overlay={feedbackTrend} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: 18, gap: 16, paddingBottom: 40 },
  greeting: { color: APP_COLORS.text, fontSize: 24, fontWeight: '700' },
  section: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 14,
    borderColor: APP_COLORS.border,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  sectionTitle: { color: APP_COLORS.text, fontSize: 18, fontWeight: '700' },
  driverText: { color: APP_COLORS.mutedText, fontSize: 14 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
