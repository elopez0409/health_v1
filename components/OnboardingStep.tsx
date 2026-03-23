import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = PropsWithChildren<{
  title: string;
  description: string;
}>;

export default function OnboardingStep({ title, description, children }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 14,
    backgroundColor: '#0F172A',
    padding: 14,
    gap: 8,
  },
  title: { color: '#F9FAFB', fontSize: 18, fontWeight: '700' },
  description: { color: '#9CA3AF', fontSize: 14, lineHeight: 20 },
});
