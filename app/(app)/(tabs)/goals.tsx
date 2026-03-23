import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { APP_COLORS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

type GoalItem = {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
};

export default function GoalsScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('100');
  const [unit, setUnit] = useState('%');
  const [goals, setGoals] = useState<GoalItem[]>([
    { id: '1', title: 'Endurance', target: 100, current: 68, unit: '%' },
    { id: '2', title: 'Sleep Consistency', target: 100, current: 52, unit: '%' },
  ]);

  const completed = useMemo(() => goals.filter((goal) => goal.current >= goal.target).length, [goals]);

  const addGoal = async () => {
    const next: GoalItem = {
      id: `${Date.now()}`,
      title: title || 'Custom Goal',
      target: Number(target) || 100,
      current: 0,
      unit,
    };

    if (user) {
      await supabase.from('goals').insert({
        user_id: user.id,
        title: next.title,
        description: 'Custom user goal',
        category: 'performance',
        target_value: next.target,
        current_value: 0,
        unit: next.unit,
        status: 'active',
      });
    }

    setGoals((prev) => [...prev, next]);
    setTitle('');
    setTarget('100');
    setUnit('%');
  };

  const incrementGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, current: Math.min(goal.target, goal.current + Math.ceil(goal.target * 0.1)) } : goal
      )
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Goals</Text>
      <Text style={styles.subtitle}>{completed} of {goals.length} goals completed</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create goal</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Goal title" placeholderTextColor={APP_COLORS.mutedText} style={styles.input} />
        <View style={styles.row}>
          <TextInput value={target} onChangeText={setTarget} keyboardType="numeric" placeholder="Target" placeholderTextColor={APP_COLORS.mutedText} style={[styles.input, styles.half]} />
          <TextInput value={unit} onChangeText={setUnit} placeholder="Unit" placeholderTextColor={APP_COLORS.mutedText} style={[styles.input, styles.half]} />
        </View>
        <Pressable style={styles.button} onPress={addGoal}>
          <Text style={styles.buttonText}>Add goal</Text>
        </Pressable>
      </View>

      {goals.map((goal) => {
        const pct = Math.round((goal.current / goal.target) * 100);
        return (
          <View key={goal.id} style={styles.goalCard}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.metric}>{goal.current}/{goal.target} {goal.unit} ({pct}%)</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(100, pct)}%` }]} />
            </View>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                incrementGoal(goal.id);
                Alert.alert('Progress updated', `${goal.title} moved forward.`);
              }}
            >
              <Text style={styles.secondaryButtonText}>Log progress</Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  title: { color: APP_COLORS.text, fontSize: 30, fontWeight: '700' },
  subtitle: { color: APP_COLORS.mutedText },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    padding: 12,
    gap: 8,
  },
  cardTitle: { color: APP_COLORS.text, fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    backgroundColor: '#0B1328',
    color: APP_COLORS.text,
    borderRadius: 10,
    padding: 10,
  },
  half: { flex: 1 },
  button: { backgroundColor: APP_COLORS.primary, padding: 10, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  goalCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    padding: 12,
    gap: 8,
  },
  goalTitle: { color: APP_COLORS.text, fontSize: 17, fontWeight: '700' },
  metric: { color: APP_COLORS.mutedText },
  progressTrack: { height: 8, backgroundColor: '#1F2937', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: APP_COLORS.primary },
  secondaryButton: { alignItems: 'center', paddingVertical: 8, borderWidth: 1, borderColor: APP_COLORS.border, borderRadius: 10 },
  secondaryButtonText: { color: APP_COLORS.text, fontWeight: '600' },
});
