import { ScrollView, StyleSheet, Text, View } from 'react-native';

import TrendChart from '@/components/TrendChart';
import { useFeedback } from '@/hooks/useFeedback';
import { useReadiness } from '@/hooks/useReadiness';
import { APP_COLORS } from '@/lib/constants';

export default function InsightsScreen() {
  const { trend } = useReadiness();
  const { feedbackTrend } = useFeedback();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Insights</Text>
      <TrendChart title="Readiness and feeling" data={trend} overlay={feedbackTrend} />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Correlation hints</Text>
        <Text style={styles.text}>- Higher sleep efficiency tracks with higher readiness.</Text>
        <Text style={styles.text}>- Low hydration days often reduce your score by 4-8 points.</Text>
        <Text style={styles.text}>- High activity load can suppress recovery markers the next day.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: 16, gap: 12 },
  title: { color: APP_COLORS.text, fontSize: 28, fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: APP_COLORS.surface,
    gap: 8,
  },
  cardTitle: { color: APP_COLORS.text, fontSize: 16, fontWeight: '700' },
  text: { color: APP_COLORS.mutedText },
});
