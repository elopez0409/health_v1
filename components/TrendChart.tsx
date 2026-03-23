import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { APP_COLORS } from '@/lib/constants';

type Props = {
  title: string;
  data: number[];
  overlay?: number[];
};

export default function TrendChart({ title, data, overlay = [] }: Props) {
  const width = Dimensions.get('window').width - 52;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={{
          labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
          datasets: [
            { data },
            ...(overlay.length ? [{ data: overlay.map((item) => item * 10), color: () => '#60A5FA' }] : []),
          ],
          legend: overlay.length ? ['Readiness', 'Feeling x10'] : ['Readiness'],
        }}
        width={Math.max(260, width)}
        height={220}
        withInnerLines={false}
        withOuterLines={false}
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: APP_COLORS.surface,
          backgroundGradientFrom: APP_COLORS.surface,
          backgroundGradientTo: APP_COLORS.surface,
          decimalPlaces: 0,
          color: () => APP_COLORS.primary,
          labelColor: () => APP_COLORS.mutedText,
          propsForDots: { r: '4', strokeWidth: '1', stroke: '#fff' },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 14,
    padding: 12,
  },
  title: { color: APP_COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  chart: { borderRadius: 12 },
});
