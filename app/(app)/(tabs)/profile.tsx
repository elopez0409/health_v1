import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { APP_COLORS, SUPPORTED_PROVIDERS } from '@/lib/constants';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>{profile?.display_name ?? 'HealthHub User'}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacy settings</Text>
        <View style={styles.row}><Text style={styles.label}>Cloud backup</Text><Switch value={cloudBackupEnabled} onValueChange={setCloudBackupEnabled} /></View>
        <View style={styles.row}><Text style={styles.label}>Push notifications</Text><Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} /></View>
        <Pressable style={styles.outlineButton} onPress={() => Alert.alert('Data export', 'Export request started (stub).')}>
          <Text style={styles.outlineText}>Export data</Text>
        </Pressable>
        <Pressable style={styles.outlineButton} onPress={() => Alert.alert('Delete data', 'Delete flow will be connected to backend function.') }>
          <Text style={styles.outlineText}>Delete all data</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Connected devices</Text>
        {SUPPORTED_PROVIDERS.map((provider) => (
          <View key={provider} style={styles.deviceItem}>
            <Text style={styles.label}>{provider}</Text>
            <Text style={styles.syncTag}>Synced</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: 16, gap: 12 },
  title: { color: APP_COLORS.text, fontSize: 30, fontWeight: '700' },
  subtitle: { color: APP_COLORS.mutedText, marginBottom: 4 },
  card: {
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: APP_COLORS.surface,
    gap: 10,
  },
  cardTitle: { color: APP_COLORS.text, fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: APP_COLORS.text },
  outlineButton: {
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  outlineText: { color: APP_COLORS.text, fontWeight: '600' },
  deviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  syncTag: { color: '#22C55E', fontWeight: '700' },
  signOutButton: { backgroundColor: '#991B1B', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  signOutText: { color: '#fff', fontWeight: '700' },
});
