import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const palette = {
    screen: isDark ? '#07111f' : '#f3f6fb',
    card: isDark ? '#0d1726' : '#ffffff',
    cardAlt: isDark ? '#111f31' : '#eef3fa',
    border: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#526075',
    accent: '#0ea5e9',
    accentStrong: '#0284c7',
    buttonText: '#ffffff',
    inputText: isDark ? '#f8fafc' : '#0f172a',
    inputBg: isDark ? '#0b1624' : '#f8fbff',
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.29:5000';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(API_BASE_URL, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screen }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.backgroundGlowTop} />
          <View style={styles.backgroundGlowBottom} />

          <View style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.badge, { backgroundColor: palette.cardAlt, borderColor: palette.border }]}>
              <Text style={[styles.badgeText, { color: palette.accentStrong }]}>Secure business access</Text>
            </View>
            <Text style={[styles.title, { color: palette.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: palette.muted }]}>Sign in to Ledger to manage customer balances, payments, and due amounts with a clean business dashboard.</Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            <Text style={[styles.sectionLabel, { color: palette.muted }]}>Account</Text>
            <Text style={[styles.fieldLabel, { color: palette.text }]}>Email address</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: palette.border,
                  color: palette.inputText,
                  backgroundColor: palette.inputBg,
                },
              ]}
              placeholder="name@company.com"
              placeholderTextColor={palette.muted}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <Text style={[styles.fieldLabel, { color: palette.text }]}>Password</Text>
            <View style={styles.passwordFieldWrap}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    borderColor: palette.border,
                    color: palette.inputText,
                    backgroundColor: palette.inputBg,
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={palette.muted}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
              />
              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                style={styles.eyeButton}
                hitSlop={10}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={palette.muted}
                />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: palette.accent },
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={palette.buttonText} />
              ) : (
                <Text style={[styles.buttonText, { color: palette.buttonText }]}>Sign in</Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: palette.muted }]}>No account yet?</Text>
              <Pressable onPress={() => router.push('/auth/register')} disabled={loading}>
                <Text style={[styles.link, { color: palette.accentStrong }]}>Create one</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(14,165,233,0.12)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: 40,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(14,165,233,0.08)',
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordFieldWrap: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.75,
  },
});
