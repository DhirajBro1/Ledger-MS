import AsyncStorage from '@react-native-async-storage/async-storage';

export type Transaction = {
  date: string;
  description: string;
  credit: number;
  debit: number;
  amount?: number;
  note?: string;
  type?: 'Credit' | 'Payment';
};

export type Customer = {
  clientId: string;
  name: string;
  phoneNumber: string;
  totalDue: number;
  transactions: Transaction[];
  updatedAt: string;
  pendingSync: boolean;
};

export type CustomerInput = {
  clientId?: string;
  name: string;
  phoneNumber: string;
  totalDue?: number;
  transactions?: Transaction[];
};

const CUSTOMERS_KEY = 'ledger.customers.v1';
const SYNC_QUEUE_KEY = 'ledger.syncQueue.v1';

const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  const value = await AsyncStorage.getItem(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const writeJson = async <T>(key: string, value: T) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const generateClientId = () => {
  return `cust_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getLocalCustomers = async (): Promise<Customer[]> => {
  return readJson<Customer[]>(CUSTOMERS_KEY, []);
};

export const saveLocalCustomer = async (input: CustomerInput): Promise<Customer> => {
  const customers = await getLocalCustomers();
  const clientId = input.clientId ?? generateClientId();
  const now = new Date().toISOString();

  const nextCustomer: Customer = {
    clientId,
    name: input.name,
    phoneNumber: input.phoneNumber,
    totalDue: input.totalDue ?? 0,
    transactions: input.transactions ?? [],
    updatedAt: now,
    pendingSync: true,
  };

  const existingIndex = customers.findIndex((customer) => customer.clientId === clientId);

  if (existingIndex >= 0) {
    customers[existingIndex] = nextCustomer;
  } else {
    customers.unshift(nextCustomer);
  }

  await writeJson(CUSTOMERS_KEY, customers);
  await queueCustomerForSync(nextCustomer);

  return nextCustomer;
};

export const updateLocalCustomer = async (
  clientId: string,
  updates: Partial<Omit<Customer, 'clientId' | 'updatedAt' | 'pendingSync'>>
): Promise<Customer | null> => {
  const customers = await getLocalCustomers();
  const index = customers.findIndex((customer) => customer.clientId === clientId);

  if (index < 0) {
    return null;
  }

  const nextCustomer: Customer = {
    ...customers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    pendingSync: true,
  };

  customers[index] = nextCustomer;
  await writeJson(CUSTOMERS_KEY, customers);
  await queueCustomerForSync(nextCustomer);

  return nextCustomer;
};

export const replaceLocalCustomers = async (customers: Customer[]) => {
  await writeJson(CUSTOMERS_KEY, customers);
};

export const queueCustomerForSync = async (customer: Customer) => {
  const queue = await readJson<Customer[]>(SYNC_QUEUE_KEY, []);
  const nextQueue = queue.filter((item) => item.clientId !== customer.clientId);
  nextQueue.unshift(customer);
  await writeJson(SYNC_QUEUE_KEY, nextQueue);
};

export const getPendingSyncCustomers = async (): Promise<Customer[]> => {
  return readJson<Customer[]>(SYNC_QUEUE_KEY, []);
};

export const clearPendingSyncCustomer = async (clientId: string) => {
  const queue = await getPendingSyncCustomers();
  const nextQueue = queue.filter((customer) => customer.clientId !== clientId);
  await writeJson(SYNC_QUEUE_KEY, nextQueue);
};

export const markCustomerSynced = async (clientId: string) => {
  const customers = await getLocalCustomers();
  const nextCustomers = customers.map((customer) =>
    customer.clientId === clientId ? { ...customer, pendingSync: false } : customer
  );

  await writeJson(CUSTOMERS_KEY, nextCustomers);
  await clearPendingSyncCustomer(clientId);
};

export const syncPendingCustomers = async (apiBaseUrl: string, token: string) => {
  const queue = await getPendingSyncCustomers();
  const synced: string[] = [];

  for (const customer of queue) {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clientId: customer.clientId,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        transactions: customer.transactions,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed for ${customer.clientId}`);
    }

    synced.push(customer.clientId);
  }

  for (const clientId of synced) {
    await markCustomerSynced(clientId);
  }

  return synced.length;
};

export const fetchCustomersFromServer = async (apiBaseUrl: string, token: string): Promise<Customer[]> => {
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/customers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customers from server');
  }

  const customers = await response.json();
  
  // Add pendingSync: false to server customers
  const customersWithSyncStatus = customers.map((customer: any) => ({
    ...customer,
    pendingSync: false,
  }));

  // Replace local customers with server data
  await replaceLocalCustomers(customersWithSyncStatus);
  return customersWithSyncStatus;
};

export const syncLocalCustomersWithServer = async (apiBaseUrl: string, token: string) => {
  const syncedCount = await syncPendingCustomers(apiBaseUrl, token);
  await fetchCustomersFromServer(apiBaseUrl, token);
  return syncedCount;
};