export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  CREDIT: 'credit',
  BUSINESS: 'business'
};

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
  ATM_FEE: 'atm_fee',
  INTEREST: 'interest'
};

export const mockAccounts = [
  {
    id: 'acc_001',
    accountNumber: '****1234',
    fullAccountNumber: '1234567890123456',
    accountType: ACCOUNT_TYPES.CHECKING,
    accountName: 'Primary Checking',
    balance: 2450.75,
    availableBalance: 2450.75,
    currency: 'USD',
    isActive: true,
    isPrimary: true,
    createdAt: '2023-01-15T10:30:00Z',
    lastActivity: '2024-12-15T14:22:00Z'
  },
  {
    id: 'acc_002',
    accountNumber: '****5678',
    fullAccountNumber: '5678901234567890',
    accountType: ACCOUNT_TYPES.SAVINGS,
    accountName: 'Emergency Savings',
    balance: 15750.00,
    availableBalance: 15750.00,
    currency: 'USD',
    isActive: true,
    isPrimary: false,
    createdAt: '2023-01-15T10:30:00Z',
    lastActivity: '2024-12-10T09:15:00Z'
  },
  {
    id: 'acc_003',
    accountNumber: '****9012',
    fullAccountNumber: '9012345678901234',
    accountType: ACCOUNT_TYPES.CREDIT,
    accountName: 'Rewards Credit Card',
    balance: -850.25,
    creditLimit: 5000.00,
    availableBalance: 4149.75,
    currency: 'USD',
    isActive: true,
    isPrimary: false,
    createdAt: '2023-03-20T16:45:00Z',
    lastActivity: '2024-12-14T18:30:00Z'
  },
  {
    id: 'acc_004',
    accountNumber: '****3456',
    fullAccountNumber: '3456789012345678',
    accountType: ACCOUNT_TYPES.BUSINESS,
    accountName: 'Small Business Account',
    balance: 8920.50,
    availableBalance: 8920.50,
    currency: 'USD',
    isActive: true,
    isPrimary: false,
    createdAt: '2023-06-10T11:20:00Z',
    lastActivity: '2024-12-13T13:45:00Z'
  }
];

export const mockTransactions = [
  {
    id: 'txn_001',
    accountId: 'acc_001',
    type: TRANSACTION_TYPES.DEPOSIT,
    amount: 1200.00,
    description: 'Direct Deposit - Salary',
    date: '2024-12-15T14:22:00Z',
    balance: 2450.75,
    location: 'Online Banking',
    reference: 'DD123456789'
  },
  {
    id: 'txn_002',
    accountId: 'acc_001',
    type: TRANSACTION_TYPES.WITHDRAWAL,
    amount: -50.00,
    description: 'ATM Withdrawal',
    date: '2024-12-14T16:30:00Z',
    balance: 1250.75,
    location: 'ATM - Main Street',
    reference: 'ATM789012345'
  },
  {
    id: 'txn_003',
    accountId: 'acc_001',
    type: TRANSACTION_TYPES.ATM_FEE,
    amount: -2.50,
    description: 'ATM Fee',
    date: '2024-12-14T16:30:00Z',
    balance: 1300.75,
    location: 'ATM - Main Street',
    reference: 'FEE789012345'
  },
  {
    id: 'txn_004',
    accountId: 'acc_002',
    type: TRANSACTION_TYPES.INTEREST,
    amount: 25.00,
    description: 'Monthly Interest',
    date: '2024-12-01T00:00:00Z',
    balance: 15750.00,
    location: 'System Generated',
    reference: 'INT202412'
  },
  {
    id: 'txn_005',
    accountId: 'acc_003',
    type: TRANSACTION_TYPES.PAYMENT,
    amount: -125.50,
    description: 'Online Purchase - Amazon',
    date: '2024-12-13T10:15:00Z',
    balance: -850.25,
    location: 'Online',
    reference: 'AMZ987654321'
  }
];

export const mockATMLocations = [
  {
    id: 'atm_001',
    name: 'Main Branch ATM',
    address: '123 Main Street, Downtown',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    isActive: true,
    hasDepositFunction: true,
    networkType: 'In-Network',
    fee: 0.00,
    distance: 0.2 // miles
  },
  {
    id: 'atm_002',
    name: 'Shopping Mall ATM',
    address: '456 Commerce Ave, Mall Plaza',
    coordinates: {
      latitude: 40.7589,
      longitude: -73.9851
    },
    isActive: true,
    hasDepositFunction: false,
    networkType: 'In-Network',
    fee: 0.00,
    distance: 1.5
  },
  {
    id: 'atm_003',
    name: 'Gas Station ATM',
    address: '789 Highway Blvd, Gas Station',
    coordinates: {
      latitude: 40.6892,
      longitude: -74.0445
    },
    isActive: true,
    hasDepositFunction: false,
    networkType: 'Out-Network',
    fee: 2.50,
    distance: 0.8
  }
];

export const mockScheduledTransactions = [
  {
    id: 'sched_001',
    accountId: 'acc_001',
    type: TRANSACTION_TYPES.TRANSFER,
    amount: 500.00,
    description: 'Monthly Savings Transfer',
    toAccountId: 'acc_002',
    frequency: 'monthly',
    nextDate: '2025-01-01T09:00:00Z',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'sched_002',
    accountId: 'acc_001',
    type: TRANSACTION_TYPES.PAYMENT,
    amount: 250.00,
    description: 'Rent Payment',
    payee: 'Property Management Co.',
    frequency: 'monthly',
    nextDate: '2025-01-01T08:00:00Z',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z'
  }
];

// Helper functions
export const getAccountById = (accountId) => {
  return mockAccounts.find(account => account.id === accountId);
};

export const getTransactionsByAccountId = (accountId) => {
  return mockTransactions.filter(transaction => transaction.accountId === accountId);
};

export const getAccountsByType = (accountType) => {
  return mockAccounts.filter(account => account.accountType === accountType);
};

export const getPrimaryAccount = () => {
  return mockAccounts.find(account => account.isPrimary);
};

export const calculateTotalBalance = () => {
  return mockAccounts.reduce((total, account) => {
    if (account.accountType === ACCOUNT_TYPES.CREDIT) {
      return total + account.availableBalance;
    }
    return total + account.balance;
  }, 0);
};

export const formatAccountNumber = (fullAccountNumber, showLast = 4) => {
  if (!fullAccountNumber) return '';
  const lastDigits = fullAccountNumber.slice(-showLast);
  return `****${lastDigits}`;
};

export const getAccountTypeDisplay = (accountType) => {
  switch (accountType) {
    case ACCOUNT_TYPES.CHECKING:
      return 'Checking Account';
    case ACCOUNT_TYPES.SAVINGS:
      return 'Savings Account';
    case ACCOUNT_TYPES.CREDIT:
      return 'Credit Card';
    case ACCOUNT_TYPES.BUSINESS:
      return 'Business Account';
    default:
      return 'Account';
  }
};