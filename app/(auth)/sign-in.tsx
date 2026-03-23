import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { APP_COLORS } from '@/lib/constants';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    setIsSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Sign in failed', error.message);
      return;
    }

    router.replace('/(app)/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HealthHub</Text>
      <Text style={styles.subtitle}>Sign in to see your readiness today.</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={APP_COLORS.mutedText}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={APP_COLORS.mutedText}
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={onSubmit} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Signing in...' : 'Sign in'}</Text>
      </Pressable>
      <Link href="/(auth)/reset-password" style={styles.link}>Forgot password?</Link>
      <Link href="/(auth)/sign-up" style={styles.link}>Need an account? Sign up</Link>
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
  title: { fontSize: 34, fontWeight: '700', color: APP_COLORS.text },
  subtitle: { fontSize: 16, color: APP_COLORS.mutedText, marginBottom: 8 },
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
