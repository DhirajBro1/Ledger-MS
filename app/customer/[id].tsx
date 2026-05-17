import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import {
  Customer,
  Transaction,
  getLocalCustomers,
  normalizeTransactionRecord,
  updateLocalCustomer,
  syncLocalCustomersWithServer,
} from '@/lib/ledger-store';

export default function CustomerDetailsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { colorScheme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = colorScheme === 'dark';
  const palette = {
    screen: isDark ? '#0f172a' : '#f5f7fb',
    card: isDark ? '#111827' : '#ffffff',
    cardSoft: isDark ? '#0f172a' : '#eef4ff',
    border: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(30,64,175,0.14)',
    text: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    accent: '#38bdf8',
    positive: '#16a34a',
    negative: '#dc2626',
    tableHeader: isDark ? '#cbd5e1' : '#475569',
  };
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [debitAmount, setDebitAmount] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));

  const loadCustomer = useCallback(async () => {
    if (!id) {
      setCustomer(null);
      return;
    }

    const customers = await getLocalCustomers();
    const current = customers.find((item) => item.clientId === id) ?? null;
    setCustomer(current);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadCustomer();
    }, [loadCustomer])
  );

  const sortedTransactions = useMemo(() => {
    if (!customer) {
      return [];
    }

    return [...customer.transactions].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    );
  }, [customer]);

  const ledgerRows = useMemo(() => {
    let runningBalance = 0;

    return sortedTransactions.map((transaction, index) => {
      const normalizedTransaction = normalizeTransactionRecord(transaction);
      const credit = Number(normalizedTransaction.credit) || 0;
      const debit = Number(normalizedTransaction.debit) || 0;

      runningBalance += debit - credit;

      return {
        sn: index + 1,
        date: new Date(normalizedTransaction.date),
        description:
          normalizedTransaction.description?.trim() ||
          normalizedTransaction.note?.trim() ||
          (debit > 0 ? 'Debit entry' : 'Credit entry'),
        credit,
        debit,
        balance: runningBalance,
      };
    });
  }, [sortedTransactions]);

  const openModal = () => {
    setDescription('');
    setCreditAmount('');
    setDebitAmount('');
    setEntryDate(new Date().toISOString().slice(0, 10));
    setModalVisible(true);
  };

  const saveTransaction = async () => {
    if (!customer) {
      return;
    }

    const parsedCredit = Number(creditAmount);
    const parsedDebit = Number(debitAmount);

    if ((!parsedCredit || parsedCredit <= 0) && (!parsedDebit || parsedDebit <= 0)) {
      alert('Enter amount received or amount due');
      return;
    }

    const parsedDate = new Date(`${entryDate}T12:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      alert('Enter a valid date in YYYY-MM-DD format');
      return;
    }

    const transaction: Transaction = {
      date: parsedDate.toISOString(),
      description: description.trim() || 'Ledger entry',
      credit: parsedCredit > 0 ? parsedCredit : 0,
      debit: parsedDebit > 0 ? parsedDebit : 0,
    };

    const nextDue = (Number(customer.totalDue) || 0) + transaction.debit - transaction.credit;

    await updateLocalCustomer(customer.clientId, {
      totalDue: nextDue,
      transactions: [transaction, ...customer.transactions],
    });

    if (token) {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.29:5000';
        await syncLocalCustomersWithServer(apiUrl, token);
      } catch (error) {
        console.log('Auto-sync after transaction save failed:', error);
      }
    }

    setModalVisible(false);
    await loadCustomer();
  };

  const balance = Number(customer?.totalDue) || 0;
  const isCleared = balance <= 0;

  if (!customer) {
    return (
      <ThemedView style={[styles.screen, { backgroundColor: palette.screen }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.emptyTitle, { color: palette.text }]}>Customer not found</Text>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: palette.accent }]}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.screen, { backgroundColor: palette.screen }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.customerName, { color: palette.text }]}>{customer.name}</Text>
          <Text style={[styles.customerPhone, { color: palette.textMuted }]}>{customer.phoneNumber}</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: palette.textMuted }]}>Current Due</Text>
            <Text style={[styles.summaryValue, isCleared ? styles.green : styles.red]}>
              {isCleared ? 'Cleared' : `₨${balance.toFixed(2)}`}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Ledger Table</Text>
          <Text style={[styles.historyCount, { color: palette.textMuted }]}>{ledgerRows.length} entries</Text>
        </View>

        {ledgerRows.length === 0 ? (
          <View style={[styles.emptyHistoryCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.emptyHistoryText, { color: palette.textMuted }]}>No ledger entries yet.</Text>
          </View>
        ) : (
          <View style={[styles.ledgerWrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.ledgerHeaderRow, { borderBottomColor: palette.border }]}>
              <Text style={[styles.ledgerHeaderCell, styles.snCell, { color: palette.tableHeader }]}>SN</Text>
              <Text style={[styles.ledgerHeaderCell, styles.dateCell, { color: palette.tableHeader }]}>Date</Text>
              <Text style={[styles.ledgerHeaderCell, styles.descriptionCell, { color: palette.tableHeader }]}>Description</Text>
              <Text style={[styles.ledgerHeaderCell, styles.amountCell, { color: palette.tableHeader }]}>Received</Text>
              <Text style={[styles.ledgerHeaderCell, styles.amountCell, { color: palette.tableHeader }]}>Due</Text>
              <Text style={[styles.ledgerHeaderCell, styles.amountCell, { color: palette.tableHeader }]}>Balance</Text>
            </View>

            {ledgerRows.map((row) => (
              <View key={`${row.sn}-${row.date.toISOString()}`} style={[styles.ledgerRow, { borderBottomColor: palette.border }]}>
                <Text style={[styles.ledgerCell, styles.snCell, { color: palette.text }]}>{row.sn}</Text>
                <Text style={[styles.ledgerCell, styles.dateCell, { color: palette.text }]}>{row.date.toISOString().slice(0, 10)}</Text>
                <Text style={[styles.ledgerCell, styles.descriptionCell, { color: palette.text }]} numberOfLines={2}>
                  {row.description}
                </Text>
                <Text style={[styles.ledgerCell, styles.amountCell, row.credit > 0 ? styles.creditText : styles.mutedText, { color: row.credit > 0 ? palette.positive : palette.textMuted }]}>
                  {row.credit > 0 ? row.credit.toFixed(2) : '-'}
                </Text>
                <Text style={[styles.ledgerCell, styles.amountCell, row.debit > 0 ? styles.debitText : styles.mutedText, { color: row.debit > 0 ? palette.negative : palette.textMuted }]}>
                  {row.debit > 0 ? row.debit.toFixed(2) : '-'}
                </Text>
                <Text style={[styles.ledgerCell, styles.amountCell, styles.balanceText, { color: palette.text }]}>
                  {row.balance.toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={[styles.totalRow, { borderTopColor: palette.border }]}>
              <Text style={[styles.totalLabel, { color: palette.textMuted }]}>Total balance</Text>
              <Text style={[styles.totalValue, isCleared ? styles.green : styles.red]}>
                {isCleared ? 'Cleared' : `₨${balance.toFixed(2)}`}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actionBar}>
        <Pressable style={[styles.actionButton, styles.creditButton]} onPress={openModal}>
          <Text style={styles.actionButtonText}>Add Ledger Entry</Text>
        </Pressable>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>Add Ledger Entry</Text>
            <Text style={[styles.modalSubtitle, { color: palette.textMuted }] }>
              Record payment received or amount due.
            </Text>

            <TextInput
              value={entryDate}
              onChangeText={setEntryDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={palette.textMuted}
              style={[styles.modalInput, { backgroundColor: palette.cardSoft, color: palette.text, borderColor: palette.border }]}
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor={palette.textMuted}
              style={[styles.modalInput, { backgroundColor: palette.cardSoft, color: palette.text, borderColor: palette.border }]}
            />
            <TextInput
              value={creditAmount}
              onChangeText={setCreditAmount}
              placeholder="Amount Received (Payment)"
              placeholderTextColor={palette.textMuted}
              keyboardType="numeric"
              style={[styles.modalInput, { backgroundColor: palette.cardSoft, color: palette.text, borderColor: palette.border }]}
            />
            <TextInput
              value={debitAmount}
              onChangeText={setDebitAmount}
              placeholder="Amount Due (Goods/Services)"
              placeholderTextColor={palette.textMuted}
              keyboardType="numeric"
              style={[styles.modalInput, { backgroundColor: palette.cardSoft, color: palette.text, borderColor: palette.border }]}
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalActionButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalActionButton, styles.creditButton]} onPress={saveTransaction}>
                <Text style={styles.actionButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 130,
    gap: 12,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  customerName: {
    fontSize: 26,
    fontWeight: '800',
  },
  customerPhone: {
    marginTop: 6,
  },
  summaryRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  red: {
    color: '#dc2626',
  },
  green: {
    color: '#16a34a',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  historyCount: {
    fontSize: 13,
  },
  emptyHistoryCard: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
  },
  ledgerWrap: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    backgroundColor: 'rgba(148,163,184,0.06)',
  },
  ledgerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  ledgerHeaderCell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ledgerCell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  snCell: {
    width: 48,
    textAlign: 'center',
  },
  dateCell: {
    width: 98,
  },
  descriptionCell: {
    flex: 1.6,
  },
  amountCell: {
    width: 78,
    textAlign: 'right',
  },
  creditText: {
    fontWeight: '700',
  },
  debitText: {
    fontWeight: '700',
  },
  mutedText: {
    fontWeight: '600',
  },
  balanceText: {
    fontWeight: '800',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  actionBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },
  creditButton: {
    backgroundColor: '#ef4444',
  },
  paymentButton: {
    backgroundColor: '#22c55e',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 20,
  },
  modalInput: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  cancelButton: {
    backgroundColor: 'rgba(148,163,184,0.12)',
    borderWidth: 1,
  },
  cancelText: {
    fontWeight: '800',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
});