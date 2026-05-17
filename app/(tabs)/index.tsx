import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  Customer,
  getLocalCustomers,
  syncLocalCustomersWithServer,
} from '@/lib/ledger-store';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

export default function HomeScreen() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');
  const [isFetching, setIsFetching] = useState(false);

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

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.29:5000';;

  const loadCustomers = useCallback(async () => {
    const localCustomers = await getLocalCustomers();
    setCustomers(localCustomers);
  }, []);

  const refreshCustomers = useCallback(async () => {
    if (!token) {
      await loadCustomers();
      return;
    }

    setIsFetching(true);
    try {
      await syncLocalCustomersWithServer(API_BASE_URL, token);
      await loadCustomers();
    } catch (error: any) {
      console.log('Background sync failed:', error.message);
      await loadCustomers();
    } finally {
      setIsFetching(false);
    }
  }, [API_BASE_URL, loadCustomers, token]);

  const handleLogout = useCallback(async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/auth/login');
          } catch (error) {
            console.log('Logout error:', error);
          }
        },
      },
    ]);
  }, [logout, router]);

  useFocusEffect(
    useCallback(() => {
      refreshCustomers();
    }, [refreshCustomers])
  );

  const totalBalanceDue = useMemo(
    () => customers.reduce((sum, customer) => sum + (Number(customer.totalDue) || 0), 0),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(search) ||
        customer.phoneNumber.toLowerCase().includes(search)
      );
    });
  }, [customers, query]);

  return (
    <ThemedView style={[styles.screen, { backgroundColor: palette.screen }]}>
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.clientId}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <View>
                <Text style={[styles.greeting, { color: palette.text }]}>Hello, {user?.name ?? user?.email}</Text>
                <Text style={[styles.subtitle, { color: palette.textMuted }]}>Welcome back</Text>
              </View>
              <Pressable onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Sign Out</Text>
              </Pressable>
            </View>

            <View style={[styles.headerCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Text style={[styles.headerLabel, { color: palette.textMuted }]}>Balance Due</Text>
              <Text style={[styles.headerValue, { color: palette.text }]}>₹{totalBalanceDue.toFixed(2)}</Text>
              <Text style={[styles.headerSubtext, { color: palette.textMuted }]}>
                {customers.length} customer{customers.length === 1 ? '' : 's'} stored locally
              </Text>
            </View>

            <View style={styles.searchWrap}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search customers"
                placeholderTextColor={palette.textMuted}
                style={[styles.searchInput, { backgroundColor: isDark ? '#1e293b' : '#eef4ff', color: palette.text, borderColor: palette.border }]}
              />
            </View>

            <View style={styles.sectionRow}>
              <ThemedText type="subtitle">Customers</ThemedText>
              <Pressable 
                onPress={refreshCustomers} 
                style={[styles.refreshButton, { backgroundColor: palette.cardSoft, borderColor: palette.border }, isFetching && styles.refreshButtonDisabled]}
                disabled={isFetching}
              >
                {isFetching ? (
                  <ActivityIndicator size="small" color={palette.accent} />
                ) : (
                  <Text style={[styles.refreshText, { color: palette.text }]}>Fetch Cloud</Text>
                )}
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>No customers found</Text>
            <Text style={[styles.emptyText, { color: palette.textMuted }]}>
              Add a new customer to start tracking dues and transactions.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const balance = Number(item.totalDue) || 0;
          const isCleared = balance <= 0;

          return (
            <Link href={`/customer/${item.clientId}`} asChild>
              <Pressable style={[styles.customerCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <View style={styles.customerRow}>
                  <View style={styles.customerNameWrap}>
                    <Text style={[styles.customerName, { color: palette.text }]}>{item.name}</Text>
                    <Text style={[styles.customerPhone, { color: palette.textMuted }]}>{item.phoneNumber}</Text>
                  </View>

                  <Text
                    style={[
                      styles.balanceAmount,
                      isCleared ? styles.balanceGreen : styles.balanceRed,
                    ]}>
                    {isCleared ? 'Cleared' : `Due ₹${balance.toFixed(2)}`}
                  </Text>
                </View>
              </Pressable>
            </Link>
          );
        }}
      />

      <Link href="/customers" asChild>
        <Pressable style={[styles.fab, { backgroundColor: palette.accent }]}>
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>Add New Customer</Text>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  headerCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  headerLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  headerValue: {
    fontSize: 34,
    fontWeight: '800',
  },
  headerSubtext: {
    marginTop: 6,
  },
  searchWrap: {
    marginTop: 4,
  },
  searchInput: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  refreshButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshText: {
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  customerCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  customerNameWrap: {
    flex: 1,
  },
  customerName: {
    fontSize: 17,
    fontWeight: '700',
  },
  customerPhone: {
    marginTop: 4,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  balanceRed: {
    color: '#f87171',
  },
  balanceGreen: {
    color: '#4ade80',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: -1,
    color: '#0f172a',
  },
  fabText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 14,
  },
});
