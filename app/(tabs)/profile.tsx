import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { ProfileVector } from '@/components/ui/vector-images';

const APP_VERSION = '1.0.0';
const DEVELOPER_NAME = 'Dhiraj Pandit';
const DEVELOPER_EMAIL = 'panditdhiraj296@gmail.com';

export default function ProfileScreen() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const { theme, setTheme, colorScheme } = useTheme();
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
    accentStrong: '#0ea5e9',
  };

  const fonts = {
    heading: Platform.select({
      ios: 'Avenir Next',
      android: 'sans-serif-medium',
      default: 'sans-serif-medium',
    }),
    body: Platform.select({
      ios: 'Avenir Next',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  } as const;

  const translations = {
    en: {
      settings: 'Settings',
      theme: 'Theme',
      about: 'About',
      signOut: 'Sign Out',
      system: 'System',
      darkMode: 'Dark',
      lightMode: 'Light',
      aboutApp: 'Ledger MS is a Offline-first ledger app developed by Dhiraj Pandit to help business person for managing customer transactions with the facility of cloud syncing.',
      confirm: 'Are you sure?',
      signOutMsg: 'Do you want to sign out?',
      cancel: 'Cancel',
      yes: 'Yes',
    }
  };

  const t = translations.en;

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      await setTheme(newTheme);
    } catch (error) {
      console.error('Failed to change theme:', error);
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
            router.replace('/auth/login');
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
        <View style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <View style={styles.heroTopLine} />
          <View style={styles.heroHeaderRow}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: palette.accentSoft, borderColor: isDark ? 'rgba(56,189,248,0.4)' : 'rgba(14,165,233,0.28)' }]}> 
              <ProfileVector size={34} color={palette.accent} secondaryColor={isDark ? '#bae6fd' : '#dbeafe'} />
            </View>
            <View style={styles.headerInfo}>
              <View style={[styles.badge, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}> 
                <Text style={[styles.badgeText, { color: palette.accentStrong }]}>Business profile</Text>
              </View>
              <Text style={[styles.userName, { color: palette.text, fontFamily: fonts.heading }]}>{user?.name || 'User'}</Text>
              <Text style={[styles.userEmail, { color: palette.textMuted, fontFamily: fonts.body }]}>{user?.email || 'Not signed in'}</Text>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <View style={[styles.heroMetaChip, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}> 
              <Text style={[styles.heroMetaLabel, { color: palette.textMuted, fontFamily: fonts.body }]}>Status</Text>
              <Text style={[styles.heroMetaValue, { color: palette.text, fontFamily: fonts.heading }]}>Active</Text>
            </View>
            <View style={[styles.heroMetaChip, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}> 
              <Text style={[styles.heroMetaLabel, { color: palette.textMuted, fontFamily: fonts.body }]}>Theme</Text>
              <Text style={[styles.heroMetaValue, { color: palette.text, fontFamily: fonts.heading }]}>{theme === 'system' ? t.system : theme === 'dark' ? t.darkMode : t.lightMode}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text, fontFamily: fonts.heading }]}>{t.settings}</Text>

          {/* Theme Setting */}
          <View style={[styles.settingCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: palette.text, fontFamily: fonts.heading }]}>{t.theme}</Text>
              <Text style={[styles.settingValue, { color: palette.textMuted, fontFamily: fonts.body }]}> 
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
                    { color: theme === 'light' ? palette.text : palette.textMuted, fontFamily: fonts.heading },
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
                    { color: theme === 'dark' ? palette.text : palette.textMuted, fontFamily: fonts.heading },
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
                    { color: theme === 'system' ? palette.text : palette.textMuted, fontFamily: fonts.heading },
                    theme === 'system' && styles.themeButtonTextActive,
                  ]}
                >
                  {t.system}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text, fontFamily: fonts.heading }]}>{t.about}</Text>

          <View style={[styles.aboutCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.aboutText, { color: palette.textMuted, fontFamily: fonts.body }]}>{t.aboutApp}</Text>
          </View>

          <View style={[styles.featuresCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.featuresTitle, { color: palette.text, fontFamily: fonts.heading }]}>Features</Text>
            <View style={styles.featuresList}>
              <Text style={[styles.featureItem, { color: palette.textMuted, fontFamily: fonts.body }]}>• Offline-first architecture</Text>
              <Text style={[styles.featureItem, { color: palette.textMuted, fontFamily: fonts.body }]}>• Automatic cloud sync</Text>
              <Text style={[styles.featureItem, { color: palette.textMuted, fontFamily: fonts.body }]}>• Multi-device support</Text>
              <Text style={[styles.featureItem, { color: palette.textMuted, fontFamily: fonts.body }]}>• Transaction history</Text>
              <Text style={[styles.featureItem, { color: palette.textMuted, fontFamily: fonts.body }]}>• Balance calculations</Text>
            </View>
          </View>
        </View>

        {token && (
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed,
            ]}
          >
            <Text style={[styles.signOutButtonText, { fontFamily: fonts.heading }]}>{t.signOut}</Text>
          </Pressable>
        )}

        <View style={[styles.footer, { borderTopColor: palette.border }]}>
          <Text style={[styles.footerText, { color: palette.textMuted, fontFamily: fonts.body }]}>Version {APP_VERSION}</Text>
          <Text style={[styles.footerText, { color: palette.textMuted, fontFamily: fonts.body }]}>By {DEVELOPER_NAME}</Text>
          <Text style={[styles.footerEmail, { color: palette.textMuted, fontFamily: fonts.body }]}>{DEVELOPER_EMAIL}</Text>
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
  heroCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroTopLine: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#38bdf8',
    opacity: 0.9,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
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
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroMetaChip: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroMetaLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroMetaValue: {
    fontSize: 15,
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingCard: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  settingLeft: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  settingValue: {
    fontSize: 12,
    marginTop: 4,
  },
  themeButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonActive: {
    backgroundColor: 'rgba(56,189,248,0.2)',
    borderColor: 'rgba(56,189,248,0.4)',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  themeButtonTextActive: {
    opacity: 1,
  },
  aboutCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
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
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    fontSize: 13,
    lineHeight: 19,
  },
  signOutButton: {
    backgroundColor: '#b91c1c',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.35)',
    marginTop: 8,
  },
  signOutButtonPressed: {
    opacity: 0.8,
  },
  signOutButtonText: {
    color: '#fff1f2',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
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
    fontSize: 12,
    fontWeight: '600',
  },
  footerEmail: {
    fontSize: 11,
    marginTop: 4,
  },
});
