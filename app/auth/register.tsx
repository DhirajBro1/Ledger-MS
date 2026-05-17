import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.29:5000';

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(API_BASE_URL, name, email, password, confirmPassword);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
            Hello, {name.trim() || 'there'}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.tabIconDefault,
                color: colors.text,
                backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f8fafc',
              },
            ]}
            placeholder="Name"
            placeholderTextColor={colors.tabIconDefault}
            value={name}
            onChangeText={setName}
            editable={!loading}
            autoCapitalize="words"
          />

          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.tabIconDefault,
                color: colors.text,
                backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f8fafc',
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.tabIconDefault}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.tabIconDefault,
                color: colors.text,
                backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f8fafc',
              },
            ]}
            placeholder="Password"
            placeholderTextColor={colors.tabIconDefault}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            secureTextEntry
          />

          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.tabIconDefault,
                color: colors.text,
                backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f8fafc',
              },
            ]}
            placeholder="Confirm Password"
            placeholderTextColor={colors.tabIconDefault}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{ color: colors.tabIconDefault }}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              disabled={loading}
            >
              <Text style={[styles.link, { color: colors.tint }]}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  link: {
    fontWeight: '600',
  },
});
