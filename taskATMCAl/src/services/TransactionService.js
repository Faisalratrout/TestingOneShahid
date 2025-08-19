import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import NotificationService from './NotificationService';

class TransactionService {
  constructor() {
    this.storageKey = '@atm_app:transactions';
    this.accountsKey = '@atm_app:accounts';
  }

  // Transaction management
  async getAllTransactions() {
    try {
      const transactionsData = await AsyncStorage.getItem(this.storageKey);
      const transactions = transactionsData ? JSON.parse(transactionsData) : [];
      return {
        success: true,
        data: transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve transactions',
        data: []
      };
    }
  }

  async getTransactionById(transactionId) {
    try {
      const result = await this.getAllTransactions();
      if (!result.success) return result;

      const transaction = result.data.find(t => t.id === transactionId);
      return {
        success: true,
        data: transaction || null
      };
    } catch (error) {
      return {
        success: false,
        error: 'Transaction not found'
      };
    }
  }

  async getTransactionsByAccount(accountId) {
    try {
      const result = await this.getAllTransactions();
      if (!result.success) return result;

      const accountTransactions = result.data.filter(t => 
        t.accountId === accountId || t.toAccountId === accountId || t.fromAccountId === accountId
      );

      return {
        success: true,
        data: accountTransactions
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve account transactions',
        data: []
      };
    }
  }

  async createTransaction(transactionData) {
    try {
      // Validate required fields
      if (!transactionData.type) {
        throw new Error('Transaction type is required');
      }
      if (!transactionData.accountId) {
        throw new Error('Account ID is required');
      }
      if (transactionData.amount === undefined || transactionData.amount < 0) {
        throw new Error('Valid amount is required');
      }

      const result = await this.getAllTransactions();
      const transactions = result.success ? result.data : [];

      const newTransaction = {
        id: Date.now().toString(),
        type: transactionData.type,
        amount: parseFloat(transactionData.amount),
        balance: parseFloat(transactionData.balance || 0),
        accountId: transactionData.accountId,
        toAccountId: transactionData.toAccountId || null,
        fromAccountId: transactionData.fromAccountId || null,
        timestamp: transactionData.timestamp || new Date().toISOString(),
        location: transactionData.location || 'ATM Terminal',
        description: transactionData.description || '',
        status: transactionData.status || 'completed',
        receiptNumber: transactionData.receiptNumber || `ATM${Date.now()}`,
        fee: parseFloat(transactionData.fee || 0),
        exchangeRate: transactionData.exchangeRate || null,
        category: transactionData.category || this.categorizeTransaction(transactionData.type),
        metadata: transactionData.metadata || {}
      };

      transactions.push(newTransaction);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(transactions));

      // Send transaction notification
      await NotificationService.sendTransactionAlert({
        title: this.getTransactionTitle(newTransaction.type),
        message: this.getTransactionMessage(newTransaction),
        transaction: newTransaction
      });

      return {
        success: true,
        data: newTransaction
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to create transaction'
      };
    }
  }

  async updateTransaction(transactionId, updates) {
    try {
      const result = await this.getAllTransactions();
      if (!result.success) return result;

      const transactions = result.data;
      const transactionIndex = transactions.findIndex(t => t.id === transactionId);

      if (transactionIndex === -1) {
        throw new Error('Transaction not found');
      }

      const updatedTransaction = {
        ...transactions[transactionIndex],
        ...updates,
        id: transactionId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      transactions[transactionIndex] = updatedTransaction;
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(transactions));

      return {
        success: true,
        data: updatedTransaction
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update transaction'
      };
    }
  }

  async deleteTransaction(transactionId) {
    try {
      const result = await this.getAllTransactions();
      if (!result.success) return result;

      const transactions = result.data;
      const transactionIndex = transactions.findIndex(t => t.id === transactionId);

      if (transactionIndex === -1) {
        throw new Error('Transaction not found');
      }

      const deletedTransaction = transactions[transactionIndex];
      transactions.splice(transactionIndex, 1);

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(transactions));

      return {
        success: true,
        data: deletedTransaction
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete transaction'
      };
    }
  }

  // Transaction filtering and search
  async searchTransactions(query, filters = {}) {
    try {
      const result = await this.getAllTransactions();
      if (!result.success) return result;

      let transactions = result.data;

      // Apply account filter
      if (filters.accountId) {
        transactions = transactions.filter(t => 
          t.accountId === filters.accountId || 
          t.toAccountId === filters.accountId || 
          t.fromAccountId === filters.accountId
        );
      }

      // Apply type filter
      if (filters.type && filters.type !== 'all') {
        transactions = transactions.filter(t => t.type === filters.type);
      }

      // Apply date range filter
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        transactions = transactions.filter(t => {
          const transactionDate = new Date(t.timestamp);
          return transactionDate >= start && transactionDate <= end;
        });
      }

      // Apply amount range filter
      if (filters.minAmount !== undefined) {
        transactions = transactions.filter(t => t.amount >= filters.minAmount);
      }
      if (filters.maxAmount !== undefined) {
        transactions = transactions.filter(t => t.amount <= filters.maxAmount);
      }

      // Apply status filter
      if (filters.status) {
        transactions = transactions.filter(t => t.status === filters.status);
      }

      // Apply text search
      if (query?.trim()) {
        const searchTerm = query.toLowerCase();
        transactions = transactions.filter(t =>
          t.description.toLowerCase().includes(searchTerm) ||
          t.location.toLowerCase().includes(searchTerm) ||
          t.receiptNumber.toLowerCase().includes(searchTerm)
        );
      }

      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search transactions',
        data: []
      };
    }
  }

  // Transaction statistics
  async getTransactionStatistics(accountId = null, timeframe = 'month') {
    try {
      const result = accountId ? 
        await this.getTransactionsByAccount(accountId) : 
        await this.getAllTransactions();
      
      if (!result.success) return result;

      const transactions = result.data;
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const filteredTransactions = transactions.filter(t => 
        new Date(t.timestamp) >= startDate
      );

      const statistics = {
        total: filteredTransactions.length,
        totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
        averageAmount: filteredTransactions.length > 0 ? 
          filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length : 0,
        byType: {},
        byStatus: {},
        byMonth: {},
        largestTransaction: null,
        smallestTransaction: null,
        timeframe
      };

      // Group by type
      filteredTransactions.forEach(transaction => {
        statistics.byType[transaction.type] = {
          count: (statistics.byType[transaction.type]?.count || 0) + 1,
          total: (statistics.byType[transaction.type]?.total || 0) + transaction.amount
        };

        statistics.byStatus[transaction.status] = 
          (statistics.byStatus[transaction.status] || 0) + 1;

        const month = new Date(transaction.timestamp).toISOString().slice(0, 7);
        statistics.byMonth[month] = {
          count: (statistics.byMonth[month]?.count || 0) + 1,
          total: (statistics.byMonth[month]?.total || 0) + transaction.amount
        };
      });

      // Find largest and smallest transactions
      if (filteredTransactions.length > 0) {
        statistics.largestTransaction = filteredTransactions.reduce((max, t) => 
          t.amount > max.amount ? t : max
        );
        statistics.smallestTransaction = filteredTransactions.reduce((min, t) => 
          t.amount < min.amount ? t : min
        );
      }

      return {
        success: true,
        data: statistics
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate transaction statistics'
      };
    }
  }

  // Helper methods
  categorizeTransaction(type) {
    const categories = {
      'withdrawal': 'cash',
      'deposit': 'cash',
      'transfer_in': 'transfer',
      'transfer_out': 'transfer',
      'balance_inquiry': 'inquiry',
      'payment': 'payment',
      'fee': 'fee'
    };
    return categories[type] || 'other';
  }

  getTransactionTitle(type) {
    const titles = {
      'withdrawal': 'Cash Withdrawal',
      'deposit': 'Cash Deposit',
      'transfer_in': 'Funds Received',
      'transfer_out': 'Funds Transferred',
      'balance_inquiry': 'Balance Inquiry',
      'payment': 'Payment Made',
      'fee': 'Fee Charged'
    };
    return titles[type] || 'Transaction';
  }

  getTransactionMessage(transaction) {
    const messages = {
      'withdrawal': `$${transaction.amount} withdrawn from your account`,
      'deposit': `$${transaction.amount} deposited to your account`,
      'transfer_in': `$${transaction.amount} received in your account`,
      'transfer_out': `$${transaction.amount} transferred from your account`,
      'balance_inquiry': 'Balance inquiry completed',
      'payment': `Payment of $${transaction.amount} processed`,
      'fee': `Fee of $${transaction.amount} charged`
    };
    return messages[transaction.type] || `Transaction of $${transaction.amount} processed`;
  }

  // Export/Import
  async exportTransactions(accountId = null) {
    try {
      const result = accountId ? 
        await this.getTransactionsByAccount(accountId) : 
        await this.getAllTransactions();

      if (!result.success) return result;

      return {
        success: true,
        data: {
          transactions: result.data,
          accountId,
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to export transactions'
      };
    }
  }

  async importTransactions(importData) {
    try {
      if (!importData.transactions || !Array.isArray(importData.transactions)) {
        throw new Error('Invalid import data format');
      }

      // Backup current data
      const backupResult = await this.exportTransactions();
      if (backupResult.success) {
        await AsyncStorage.setItem(
          `@atm_app:transactions_backup_${Date.now()}`,
          JSON.stringify(backupResult.data)
        );
      }

      // Import transactions
      const currentResult = await this.getAllTransactions();
      const currentTransactions = currentResult.success ? currentResult.data : [];
      
      // Merge transactions (avoid duplicates by ID)
      const existingIds = new Set(currentTransactions.map(t => t.id));
      const newTransactions = importData.transactions.filter(t => !existingIds.has(t.id));
      
      const allTransactions = [...currentTransactions, ...newTransactions];
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(allTransactions));

      return {
        success: true,
        data: {
          transactionsImported: newTransactions.length,
          duplicatesSkipped: importData.transactions.length - newTransactions.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to import transactions'
      };
    }
  }

  // Utility methods
  async getRecentTransactions(limit = 10, accountId = null) {
    try {
      const result = accountId ? 
        await this.getTransactionsByAccount(accountId) : 
        await this.getAllTransactions();

      if (!result.success) return result;

      return {
        success: true,
        data: result.data.slice(0, limit)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve recent transactions',
        data: []
      };
    }
  }

  async getPendingTransactions(accountId = null) {
    return await this.searchTransactions('', { 
      accountId, 
      status: 'pending' 
    });
  }

  async getFailedTransactions(accountId = null) {
    return await this.searchTransactions('', { 
      accountId, 
      status: 'failed' 
    });
  }
}

export default new TransactionService();