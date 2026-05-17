import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { Language } from '@/lib/settings-store';
import { ProfileVector } from '@/components/ui/vector-images';

const APP_VERSION = '1.0.0';
const DEVELOPER_NAME = 'Dhiraj Pandit';
const DEVELOPER_EMAIL = 'panditdhiraj296@gmail.com';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, setTheme, colorScheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const isDark = colorScheme === 'dark';

  const palette = {
    screen: isDark ? '#0f172a' : '#f3f6fc',
    card: isDark ? '#111827' : '#ffffff',
    cardSoft: isDark ? '#0f172a' : '#eef4ff',
    border: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(30,64,175,0.14)',
    text: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#475569',
    accent: '#38bdf8',
    accentSoft: isDark ? 'rgba(56,189,248,0.2)' : 'rgba(14,165,233,0.14)',
  };

  const translations = {
    en: {
      profile: 'Profile',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      about: 'About',
      signOut: 'Sign Out',
      system: 'System',
      darkMode: 'Dark',
      lightMode: 'Light',
      aboutApp: 'Offline-first ledger app for managing customer transactions locally and syncing with the cloud.',
      confirm: 'Are you sure?',
      signOutMsg: 'Do you want to sign out?',
      cancel: 'Cancel',
      yes: 'Yes',
    },
    ne: {
      profile: 'प्रोफाइल',
      settings: 'सेटिङ्गहरू',
      language: 'भाषा',
      theme: 'विषयवस्तु',
      about: 'बारेमा',
      signOut: 'साइन आउट',
      system: 'प्रणाली',
      darkMode: 'गहिरो',
      lightMode: 'हल्को',
      aboutApp: 'ग्राहक लेनदेन स्थानीय रूपमा व्यवस्थापन गर्न र क्लाउडसँग सिंक गर्न अफलाइन-पहिलो लेजर एप।',
      confirm: 'के तपाई निश्चित हुनुहुन्छ?',
      signOutMsg: 'के तपाई साइन आउट गर्न चाहनुहुन्छ?',
      cancel: 'रद्द गर्नुहोस्',
      yes: 'हो',
    },
  };

  const t = translations[language];

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      await setTheme(newTheme);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  const handleLanguageChange = async (lang: Language) => {
    try {
      await setLanguage(lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(t.confirm, t.signOutMsg, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.signOut,
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.screen }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.headerCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: palette.accentSoft, borderColor: isDark ? 'rgba(56,189,248,0.4)' : 'rgba(14,165,233,0.28)' }]}>
            <ProfileVector size={34} color={palette.accent} secondaryColor={isDark ? '#bae6fd' : '#dbeafe'} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.userName, { color: palette.text }]}>{user?.name || 'User'}</Text>
            <Text style={[styles.userEmail, { color: palette.textMuted }]}>{user?.email || 'Not signed in'}</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>{t.settings}</Text>

          {/* Language Setting */}
          <View style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: palette.text }]}>{t.language}</Text>
              <Text style={[styles.settingValue, { color: palette.textMuted }] }>
                {language === 'en' ? 'English' : 'नेपाली'}
              </Text>
            </View>
            <View style={styles.languageButtonGroup}>
              <Pressable
                onPress={() => handleLanguageChange('en')}
                style={[
                  styles.langButton,
                  { backgroundColor: palette.cardSoft, borderColor: palette.border },
                  language === 'en' && styles.langButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.langButtonText,
                    language === 'en' && styles.langButtonTextActive,
                  ]}
                >
                  EN
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleLanguageChange('ne')}
                style={[
                  styles.langButton,
                  { backgroundColor: palette.cardSoft, borderColor: palette.border },
                  language === 'ne' && styles.langButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.langButtonText,
                    language === 'ne' && styles.langButtonTextActive,
                  ]}
                >
                  NE
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Theme Setting */}
          <View style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: palette.text }]}>{t.theme}</Text>
              <Text style={[styles.settingValue, { color: palette.textMuted }]}>
                {theme === 'system' ? t.system : theme === 'dark' ? t.darkMode : t.lightMode}
              </Text>
            </View>
            <View style={styles.themeButtonGroup}>
              <Pressable
                onPress={() => handleThemeChange('light')}
                style={[
                  styles.themeButton,
                  { backgroundColor: palette.cardSoft, borderColor: palette.border },
                  theme === 'light' && styles.themeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    theme === 'light' && styles.themeButtonTextActive,
                  ]}
                >
                  {t.lightMode}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleThemeChange('dark')}
                style={[
                  styles.themeButton,
                  { backgroundColor: palette.cardSoft, borderColor: palette.border },
                  theme === 'dark' && styles.themeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    theme === 'dark' && styles.themeButtonTextActive,
                  ]}
                >
                  {t.darkMode}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleThemeChange('system')}
                style={[
                  styles.themeButton,
                  { backgroundColor: palette.cardSoft, borderColor: palette.border },
                  theme === 'system' && styles.themeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    theme === 'system' && styles.themeButtonTextActive,
                  ]}
                >
                  {t.system}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>{t.about}</Text>

          <View style={[styles.aboutCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.aboutText, { color: palette.textMuted }]}>{t.aboutApp}</Text>
          </View>

          {/* Features List */}
          <View style={[styles.featuresCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.featuresTitle, { color: palette.text }]}>Features</Text>
            <View style={styles.featuresList}>
              <Text style={[styles.featureItem, { color: palette.textMuted }]}>• Offline-first architecture</Text>
              <Text style={[styles.featureItem, { color: palette.textMuted }]}>• Automatic cloud sync</Text>
              <Text style={[styles.featureItem, { color: palette.textMuted }]}>• Multi-device support</Text>
              <Text style={[styles.featureItem, { color: palette.textMuted }]}>• Transaction history</Text>
              <Text style={[styles.featureItem, { color: palette.textMuted }]}>• Balance calculations</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        {user && (
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed,
            ]}
          >
            <Text style={styles.signOutButtonText}>{t.signOut}</Text>
          </Pressable>
        )}

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: palette.border }]}>
          <Text style={[styles.footerText, { color: palette.textMuted }]}>Version {APP_VERSION}</Text>
          <Text style={[styles.footerText, { color: palette.textMuted }]}>By {DEVELOPER_NAME}</Text>
          <Text style={[styles.footerEmail, { color: palette.textMuted }]}>{DEVELOPER_EMAIL}</Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  loadingText: {
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 20,
  },
  headerCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56,189,248,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(56,189,248,0.4)',
  },
  avatarText: {
    color: '#38bdf8',
    fontSize: 24,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  settingCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  settingLeft: {
    flex: 1,
  },
  settingLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  settingValue: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  languageButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  langButtonActive: {
    backgroundColor: 'rgba(56,189,248,0.2)',
    borderColor: 'rgba(56,189,248,0.4)',
  },
  langButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  langButtonTextActive: {
    color: '#38bdf8',
  },
  themeButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonActive: {
    backgroundColor: 'rgba(56,189,248,0.2)',
    borderColor: 'rgba(56,189,248,0.4)',
  },
  themeButtonText: {
    fontSize: 18,
  },
  themeButtonTextActive: {
    opacity: 1,
  },
  aboutCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  aboutText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  developerInfo: {
    alignItems: 'flex-end',
  },
  infoSubtext: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  featuresCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  featuresTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  signOutButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.3)',
    marginTop: 8,
  },
  signOutButtonPressed: {
    opacity: 0.8,
  },
  signOutButtonText: {
    color: '#fca5a5',
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.12)',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  footerEmail: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
});
