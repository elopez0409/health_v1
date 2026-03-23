import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { APP_COLORS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSend = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Unable to send reset email', error.message);
      return;
    }

    Alert.alert('Email sent', 'If the account exists, a reset link was sent.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>Enter your email and we will send a reset link.</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={APP_COLORS.mutedText}
        value={email}
        onChangeText={setEmail}
      />
      <Pressable style={styles.button} onPress={onSend} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Sending...' : 'Send reset link'}</Text>
      </Pressable>
      <Link href="/(auth)/sign-in" style={styles.link}>Back to sign in</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: { fontSize: 30, fontWeight: '700', color: APP_COLORS.text },
  subtitle: { fontSize: 15, color: APP_COLORS.mutedText },
  input: {
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 12,
    padding: 14,
    color: APP_COLORS.text,
    backgroundColor: APP_COLORS.surface,
  },
  button: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  link: { color: APP_COLORS.primary, textAlign: 'center', marginTop: 6 },
});
