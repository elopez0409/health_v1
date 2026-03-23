import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS } from '@/lib/constants';

type Props = {
  title: string;
  progress: number;
};

export default function GoalProgressBar({ title, progress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.title}>{progress}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, progress))}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: APP_COLORS.text, fontWeight: '600' },
  track: { height: 8, borderRadius: 99, backgroundColor: '#1F2937', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: APP_COLORS.primary },
});
