import { Transaction } from './ledger-store';

/**
 * Calculate the net balance from a transaction array.
 * Debit increases the balance due, credit reduces it.
 * @param transactions - Array of transactions
 * @returns Net balance (positive = money owed, negative = overpaid)
 */
export const calculateNetBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((balance, tx) => {
    const legacyAmount = Number(tx.amount) || 0;
    const credit = Number(tx.credit ?? 0) || (tx.type === 'Payment' ? legacyAmount : 0);
    const debit = Number(tx.debit ?? 0) || (tx.type === 'Credit' ? legacyAmount : 0);
    return balance + debit - credit;
  }, 0);
};

/**
 * Sort transactions by date, newest first.
 * @param transactions - Array of transactions
 * @returns Sorted array
 */
export const sortTransactionsByDateDesc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
  );
};

/**
 * Format a transaction for display with proper prefix and formatting.
 * @param transaction - Transaction to format
 * @returns Formatted string like "C ₨500" or "D ₨300"
 */
export const formatTransactionAmount = (transaction: Transaction): string => {
  const legacyAmount = Number(transaction.amount) || 0;
  const credit = Number(transaction.credit ?? 0) || (transaction.type === 'Payment' ? legacyAmount : 0);
  const debit = Number(transaction.debit ?? 0) || (transaction.type === 'Credit' ? legacyAmount : 0);

  if (credit > 0 && debit > 0) {
    return `C ₨${credit.toFixed(2)} / D ₨${debit.toFixed(2)}`;
  }

  if (credit > 0) {
    return `C ₨${credit.toFixed(2)}`;
  }

  if (debit > 0) {
    return `D ₨${debit.toFixed(2)}`;
  }

  return '₨0.00';
};
