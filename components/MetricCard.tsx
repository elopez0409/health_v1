import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS } from '@/lib/constants';

type Props = {
  title: string;
  value: string;
  subtitle: string;
  status: 'good' | 'watch' | 'low';
};

const statusColor: Record<Props['status'], string> = {
  good: '#22C55E',
  watch: '#F59E0B',
  low: '#EF4444',
};

export default function MetricCard({ title, value, subtitle, status }: Props) {
  return (
    <View style={[styles.card, { borderColor: statusColor[status] }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: APP_COLORS.surface,
    gap: 5,
  },
  title: { color: APP_COLORS.mutedText, fontWeight: '600' },
  value: { color: APP_COLORS.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: APP_COLORS.mutedText, fontSize: 12 },
});
