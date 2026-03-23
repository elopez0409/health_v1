import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS } from '@/lib/constants';

type Props = {
  score: number;
  insight: string;
};

const scoreToColor = (score: number) => {
  if (score >= 75) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
};

export default function ReadinessCircle({ score, insight }: Props) {
  const color = scoreToColor(score);

  return (
    <View style={styles.card}>
      <View style={[styles.circle, { borderColor: color }]}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>Readiness</Text>
      </View>
      <Text style={styles.insight}>{insight}</Text>
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
    alignItems: 'center',
    gap: 10,
  },
  circle: {
    height: 150,
    width: 150,
    borderRadius: 999,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1328',
  },
  score: { color: APP_COLORS.text, fontSize: 44, fontWeight: '800' },
  label: { color: APP_COLORS.mutedText, fontSize: 13, fontWeight: '600' },
  insight: { color: APP_COLORS.text, textAlign: 'center', fontSize: 15 },
});
