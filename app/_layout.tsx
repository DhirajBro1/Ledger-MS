import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, ThemeProvider as AppThemeProvider } from '@/lib/theme-context';
import { LanguageProvider } from '@/lib/language-context';
import { AuthProvider, useAuth } from '@/lib/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { colorScheme, isLoading: themeLoading } = useTheme();
  const { token, user, isLoading: authLoading } = useAuth();
  const screenBackground = colorScheme === 'dark' ? '#0f172a' : '#f3f6fc';

  const isLoading = authLoading || themeLoading;
  const isAuthenticated = Boolean(token && user);

  const screens = !isAuthenticated ? [
    <Stack.Screen key="auth" name="auth" options={{ headerShown: false }} />,
  ] : [
    <Stack.Screen key="tabs" name="(tabs)" options={{ headerShown: false }} />,
    <Stack.Screen key="customer" name="customer/[id]" options={{ title: 'Customer Details' }} />,
    <Stack.Screen key="modal" name="modal" options={{ presentation: 'modal', title: 'Modal' }} />,
  ];

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: screenBackground }}>
        <Stack>
          {screens}
        </Stack>
      </SafeAreaView>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <RootLayoutContent />
          </AuthProvider>
        </LanguageProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
