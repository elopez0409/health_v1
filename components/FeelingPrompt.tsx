import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS } from '@/lib/constants';

type Props = {
  onSubmit: (score: number) => Promise<void>;
  streakDays: number;
};

export default function FeelingPrompt({ onSubmit, streakDays }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>How do you feel today?</Text>
      <Text style={styles.subtitle}>Your feedback streak: {streakDays} days</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <Pressable
            key={score}
            style={[styles.bubble, selected === score && styles.bubbleSelected]}
            onPress={() => setSelected(score)}
          >
            <Text style={styles.bubbleText}>{score}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={[styles.button, selected == null && styles.buttonDisabled]}
        onPress={() => selected && onSubmit(selected)}
        disabled={selected == null}
      >
        <Text style={styles.buttonText}>Save feeling</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  title: { color: APP_COLORS.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: APP_COLORS.mutedText },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bubble: {
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 999,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1328',
  },
  bubbleSelected: { borderColor: APP_COLORS.primary, backgroundColor: '#1C2A65' },
  bubbleText: { color: APP_COLORS.text, fontWeight: '700', fontSize: 12 },
  button: { backgroundColor: APP_COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
