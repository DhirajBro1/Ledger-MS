import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  Customer,
  CustomerInput,
  getLocalCustomers,
  saveLocalCustomer,
  syncLocalCustomersWithServer,
} from '../../lib/ledger-store';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { LedgerBadgeVector } from '@/components/ui/vector-images';

export default function CustomersScreen() {
  const { token } = useAuth();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const palette = {
    screen: isDark ? '#0f172a' : '#f3f6fc',
    card: isDark ? '#111827' : '#ffffff',
    cardSoft: isDark ? '#0f172a' : '#eef4ff',
    border: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(30,64,175,0.14)',
    text: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#475569',
    accent: '#38bdf8',
    accentStrong: '#0ea5e9',
  };

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [apiUrl] = useState(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000');
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    const local = await getLocalCustomers();
    setCustomers(local);
  };

  const recentCustomers = useMemo(() => customers.slice(0, 4), [customers]);

  useEffect(() => {
    load();
  }, []);

  const addCustomer = async () => {
    if (!name) return;

    setIsSaving(true);

    const input: CustomerInput = {
      name,
      phoneNumber: phoneNumber.trim(),
    };

    try {
      await saveLocalCustomer(input);

      if (token) {
        try {
          await syncLocalCustomersWithServer(apiUrl, token);
        } catch (error) {
          console.log('Auto-sync after customer save failed:', error);
        }
      }

      setName('');
      setPhoneNumber('');
      await load();
    } finally {
      setIsSaving(false);
    }
  };

  // manual sync removed — syncing now runs silently in background

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.screen }] }>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Logo Header */}
          <View style={styles.logoHeader}>
            <View style={[styles.logoBadge, { backgroundColor: isDark ? 'rgba(56,189,248,0.15)' : 'rgba(14,165,233,0.1)', borderColor: isDark ? 'rgba(56,189,248,0.3)' : 'rgba(14,165,233,0.22)' }]}>
              <LedgerBadgeVector
                size={38}
                color={palette.accentStrong}
                secondaryColor={isDark ? '#e0f2fe' : '#dbeafe'}
              />
            </View>
            <View>
              <Text style={[styles.logoTitle, { color: palette.text }]}>Ledger</Text>
              <Text style={[styles.logoSubtitle, { color: palette.textMuted }]}>Manage customers & transactions</Text>
            </View>
          </View>

          <View style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.heroTopRow}>
              <View style={[styles.heroBadge, { backgroundColor: isDark ? 'rgba(56,189,248,0.12)' : 'rgba(14,165,233,0.14)', borderColor: isDark ? 'rgba(56,189,248,0.28)' : 'rgba(14,165,233,0.24)' }]}>
                <Text style={[styles.heroBadgeText, { color: palette.accent }]}>Add Customer</Text>
              </View>
            </View>

            <Text style={[styles.heroTitle, { color: palette.text }]}>Create a new ledger entry</Text>
            {/* <Text style={[styles.heroDescription, { color: palette.textMuted }] }>
              Save locally first, then sync to MongoDB automatically when the device is online.
            </Text> */}

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
                <Text style={[styles.statValue, { color: palette.text }]}>{customers.length}</Text>
                <Text style={[styles.statLabel, { color: palette.textMuted }]}>Customers</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
                <Text style={[styles.statValue, { color: palette.text }]}>{token ? 'On' : 'Off'}</Text>
                <Text style={[styles.statLabel, { color: palette.textMuted }]}>Cloud</Text>
              </View>
            </View>
          </View>

          <View style={[styles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Customer register</Text>
              <Text style={[styles.sectionHint, { color: palette.textMuted }]}>Add only the customer name here. Ledger entries are added later from the customer detail screen.</Text>
            </View>

            <View style={styles.inputStack}>
              <TextInput
                placeholder="Customer name"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={name}
                onChangeText={setName}
                style={[styles.input, { backgroundColor: palette.cardSoft, color: palette.text, borderColor: palette.border }]}
              />
              <TextInput
                placeholder="Phone number"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={[styles.input, { backgroundColor: palette.cardSoft, color: palette.text, borderColor: palette.border }]}
              />
            </View>

            <Pressable
              onPress={addCustomer}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                isSaving && styles.buttonDisabled,
              ]}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={[styles.primaryButtonText, { color: palette.text }]}>
                    Save customer
                  </Text>
                  <Text style={[styles.primaryButtonSubtext, { color: isDark ? 'rgba(255,255,255,0.82)' : palette.textMuted }]}> 
                    Register the customer now and add ledger rows later
                  </Text>
                </>
              )}
            </Pressable>

            {/* manual sync button removed; syncing happens silently in background */}

            {/* <Text style={[styles.helperText, { color: palette.textMuted }]}>The app stores this entry on the device immediately and syncs it to the signed-in account when online.</Text> */}
          </View>

          <View style={styles.listHeaderRow}>
            <View>
              <Text style={[styles.listTitle, { color: palette.text }]}>Recent customers</Text>
              <Text style={[styles.listSubtitle, { color: palette.textMuted }]}>Tap a customer later to manage the ledger table</Text>
            </View>
              <Pressable onPress={load} style={[styles.refreshChip, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Text style={[styles.refreshChipText, { color: palette.text }]}>Refresh</Text>
            </Pressable>
          </View>

          {recentCustomers.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Text style={[styles.emptyTitle, { color: palette.text }]}>Nothing saved yet</Text>
              <Text style={[styles.emptyText, { color: palette.textMuted }] }>
                Add your first customer and the record will appear here.
              </Text>
            </View>
          ) : (
            recentCustomers.map((customer) => {
              const isCleared = (Number(customer.totalDue) || 0) <= 0;

              return (
                <View key={customer.clientId} style={[styles.previewCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                  <View style={styles.previewTopRow}>
                    <View style={styles.previewTitleWrap}>
                      <Text style={[styles.previewName, { color: palette.text }]}>{customer.name}</Text>
                      {customer.phoneNumber ? (
                        <Text style={[styles.previewPhone, { color: palette.textMuted }]}>{customer.phoneNumber}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.previewMetaRow}>
                    <View style={[styles.metaPill, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
                      <Text style={[styles.metaLabel, { color: palette.textMuted }]}>Balance</Text>
                      <Text style={[styles.metaValue, isCleared ? styles.balanceGreen : styles.balanceRed]}>
                        {isCleared ? 'Cleared' : `₨${Number(customer.totalDue).toFixed(2)}`}
                      </Text>
                    </View>
                    <View style={[styles.metaPill, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
                      <Text style={[styles.metaLabel, { color: palette.textMuted }]}>Transactions</Text>
                      <Text style={[styles.metaValue, { color: palette.text }]}>{customer.transactions.length}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  flex: {
    flex: 1,
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
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.28)',
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  syncPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  syncPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroDescription: {
    marginTop: 8,
    lineHeight: 20,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  formCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHint: {
    color: '#94a3b8',
    fontSize: 13,
  },
  inputStack: {
    gap: 12,
  },
  input: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    fontSize: 16,
  },
  rowGap: {
    flexDirection: 'row',
    gap: 12,
  },
  amountCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  noteCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  fieldLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  amountInput: {
    fontSize: 26,
    fontWeight: '800',
    padding: 0,
  },
  noteInput: {
    minHeight: 34,
    padding: 0,
    textAlignVertical: 'top',
  },
  segmentWrap: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  segmentButtonActive: {
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderColor: 'rgba(56,189,248,0.36)',
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: '#7dd3fc',
  },
  segmentSubtext: {
    marginTop: 4,
    fontSize: 12,
  },
  segmentSubtextActive: {
    color: '#bae6fd',
  },
  primaryButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
  },
  primaryButtonSubtext: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  secondaryButton: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
  },
  secondaryButtonPressed: {
    backgroundColor: '#111827',
  },
  secondaryButtonText: {
    color: '#7dd3fc',
    fontSize: 15,
    fontWeight: '800',
  },
  helperText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  listSubtitle: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 13,
  },
  refreshChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  refreshChipText: {
    fontWeight: '700',
    fontSize: 12,
  },
  emptyState: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
    alignItems: 'center',
    marginTop: 2,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: '#cbd5e1',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  previewCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  previewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  previewTitleWrap: {
    flex: 1,
  },
  previewName: {
    fontSize: 17,
    fontWeight: '800',
  },
  previewPhone: {
    color: '#94a3b8',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pendingBadge: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderColor: 'rgba(248, 113, 113, 0.24)',
  },
  syncedBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderColor: 'rgba(74, 222, 128, 0.24)',
  },
  statusBadgeText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  previewMetaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaPill: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.12)',
  },
  metaLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metaValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
  },
  balanceRed: {
    color: '#f87171',
  },
  balanceGreen: {
    color: '#4ade80',
  },
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(56,189,248,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
  },
  logoText: {
    fontSize: 28,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  logoSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
});
