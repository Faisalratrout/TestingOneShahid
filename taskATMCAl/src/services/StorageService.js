import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

class StorageService {
  constructor() {
    this.storageKeys = {
      USER_DATA: '@atm_app:user_data',
      ACCOUNTS: '@atm_app:accounts',
      TRANSACTIONS: '@atm_app:transactions',
      EVENTS: '@atm_app:events',
      ATM_SETTINGS: '@atm_app:atm_settings',
      CALENDAR_SETTINGS: '@atm_app:calendar_settings',
      NOTIFICATION_SETTINGS: '@atm_app:notification_settings',
      APP_STATE: '@atm_app:app_state',
      CACHE: '@atm_app:cache',
      SECURITY_SETTINGS: '@atm_app:security_settings',
      BIOMETRIC_ENABLED: '@atm_app:biometric_enabled',
      LAST_SYNC: '@atm_app:last_sync',
      SESSION_DATA: '@atm_app:session_data',
      BACKUP_DATA: '@atm_app:backup_data',
    };

    this.cacheExpiry = {
      SHORT: 5 * 60 * 1000, // 5 minutes
      MEDIUM: 30 * 60 * 1000, // 30 minutes
      LONG: 24 * 60 * 60 * 1000, // 24 hours
    };

    this.isInitialized = false;
    this.storageSize = 0;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check storage availability
      await this.checkStorageAvailability();
      
      // Calculate storage size
      await this.calculateStorageSize();
      
      // Clean expired cache
      await this.cleanExpiredCache();
      
      this.isInitialized = true;
      
      return {
        success: true,
        message: 'StorageService initialized successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to initialize StorageService: ${error.message}`
      };
    }
  }

  // Generic storage operations
  async setItem(key, value, options = {}) {
    try {
      const { secure = false, expiry = null } = options;
      
      const dataToStore = {
        data: value,
        timestamp: Date.now(),
        expiry: expiry ? Date.now() + expiry : null,
        version: '1.0.0'
      };

      const serializedData = JSON.stringify(dataToStore);

      if (secure && Platform.OS !== 'web') {
        await SecureStore.setItemAsync(key, serializedData);
      } else {
        await AsyncStorage.setItem(key, serializedData);
      }

      return {
        success: true,
        key,
        size: new Blob([serializedData]).size
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to store item ${key}: ${error.message}`
      };
    }
  }

  async getItem(key, options = {}) {
    try {
      const { secure = false, defaultValue = null } = options;
      
      let serializedData;
      
      if (secure && Platform.OS !== 'web') {
        serializedData = await SecureStore.getItemAsync(key);
      } else {
        serializedData = await AsyncStorage.getItem(key);
      }

      if (!serializedData) {
        return {
          success: true,
          data: defaultValue,
          cached: false
        };
      }

      const parsedData = JSON.parse(serializedData);

      // Check if data has expired
      if (parsedData.expiry && Date.now() > parsedData.expiry) {
        await this.removeItem(key, { secure });
        return {
          success: true,
          data: defaultValue,
          expired: true
        };
      }

      return {
        success: true,
        data: parsedData.data,
        timestamp: parsedData.timestamp,
        cached: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve item ${key}: ${error.message}`,
        data: options.defaultValue || null
      };
    }
  }

  async removeItem(key, options = {}) {
    try {
      const { secure = false } = options;

      if (secure && Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }

      return {
        success: true,
        key
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to remove item ${key}: ${error.message}`
      };
    }
  }

  async clearAll(options = {}) {
    try {
      const { includeSecure = false } = options;

      // Clear AsyncStorage
      await AsyncStorage.clear();

      // Clear SecureStore if requested and available
      if (includeSecure && Platform.OS !== 'web') {
        const keys = Object.values(this.storageKeys);
        for (const key of keys) {
          try {
            await SecureStore.deleteItemAsync(key);
          } catch (error) {
            // Key might not exist in SecureStore, continue
            console.warn(`Key ${key} not found in SecureStore`);
          }
        }
      }

      return {
        success: true,
        message: 'All storage cleared successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to clear storage: ${error.message}`
      };
    }
  }

  // User data operations
  async saveUser(userData) {
    return await this.setItem(this.storageKeys.USER_DATA, userData, { secure: true });
  }

  async getUser() {
    return await this.getItem(this.storageKeys.USER_DATA, { secure: true });
  }

  async clearUser() {
    return await this.removeItem(this.storageKeys.USER_DATA, { secure: true });
  }

  // Account operations
  async saveAccounts(accounts) {
    return await this.setItem(this.storageKeys.ACCOUNTS, accounts, { secure: true });
  }

  async getAccounts() {
    const result = await this.getItem(this.storageKeys.ACCOUNTS, { 
      secure: true, 
      defaultValue: [] 
    });
    return {
      ...result,
      data: Array.isArray(result.data) ? result.data : []
    };
  }

  async addAccount(account) {
    try {
      const accountsResult = await this.getAccounts();
      if (!accountsResult.success) return accountsResult;

      const accounts = accountsResult.data;
      const updatedAccounts = [...accounts, account];
      
      return await this.saveAccounts(updatedAccounts);
    } catch (error) {
      return {
        success: false,
        error: `Failed to add account: ${error.message}`
      };
    }
  }

  async updateAccount(accountId, updates) {
    try {
      const accountsResult = await this.getAccounts();
      if (!accountsResult.success) return accountsResult;

      const accounts = accountsResult.data;
      const accountIndex = accounts.findIndex(acc => acc.id === accountId);
      
      if (accountIndex === -1) {
        throw new Error('Account not found');
      }

      accounts[accountIndex] = { ...accounts[accountIndex], ...updates };
      
      return await this.saveAccounts(accounts);
    } catch (error) {
      return {
        success: false,
        error: `Failed to update account: ${error.message}`
      };
    }
  }

  async deleteAccount(accountId) {
    try {
      const accountsResult = await this.getAccounts();
      if (!accountsResult.success) return accountsResult;

      const accounts = accountsResult.data;
      const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
      
      return await this.saveAccounts(updatedAccounts);
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete account: ${error.message}`
      };
    }
  }

  // Transaction operations
  async saveTransactions(transactions) {
    return await this.setItem(this.storageKeys.TRANSACTIONS, transactions);
  }

  async getTransactions() {
    const result = await this.getItem(this.storageKeys.TRANSACTIONS, { 
      defaultValue: [] 
    });
    return {
      ...result,
      data: Array.isArray(result.data) ? result.data : []
    };
  }

  async addTransaction(transaction) {
    try {
      const transactionsResult = await this.getTransactions();
      if (!transactionsResult.success) return transactionsResult;

      const transactions = transactionsResult.data;
      const updatedTransactions = [transaction, ...transactions]; // Add to beginning
      
      return await this.saveTransactions(updatedTransactions);
    } catch (error) {
      return {
        success: false,
        error: `Failed to add transaction: ${error.message}`
      };
    }
  }

  // Event operations
  async saveEvents(events) {
    return await this.setItem(this.storageKeys.EVENTS, events);
  }

  async getEvents() {
    const result = await this.getItem(this.storageKeys.EVENTS, { 
      defaultValue: [] 
    });
    return {
      ...result,
      data: Array.isArray(result.data) ? result.data : []
    };
  }

  async addEvent(event) {
    try {
      const eventsResult = await this.getEvents();
      if (!eventsResult.success) return eventsResult;

      const events = eventsResult.data;
      const updatedEvents = [...events, event];
      
      return await this.saveEvents(updatedEvents);
    } catch (error) {
      return {
        success: false,
        error: `Failed to add event: ${error.message}`
      };
    }
  }

  async updateEvent(eventId, updates) {
    try {
      const eventsResult = await this.getEvents();
      if (!eventsResult.success) return eventsResult;

      const events = eventsResult.data;
      const eventIndex = events.findIndex(event => event.id === eventId);
      
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }

      events[eventIndex] = { ...events[eventIndex], ...updates };
      
      return await this.saveEvents(events);
    } catch (error) {
      return {
        success: false,
        error: `Failed to update event: ${error.message}`
      };
    }
  }

  async deleteEvent(eventId) {
    try {
      const eventsResult = await this.getEvents();
      if (!eventsResult.success) return eventsResult;

      const events = eventsResult.data;
      const updatedEvents = events.filter(event => event.id !== eventId);
      
      return await this.saveEvents(updatedEvents);
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete event: ${error.message}`
      };
    }
  }

  // Settings operations
  async saveATMSettings(settings) {
    return await this.setItem(this.storageKeys.ATM_SETTINGS, settings);
  }

  async getATMSettings() {
    const defaultSettings = {
      currency: 'USD',
      language: 'en',
      autoPrintReceipt: true,
      showQuickAmounts: true,
      quickAmounts: [20, 40, 60, 100, 200],
      dailyWithdrawalLimit: 1000,
      singleTransactionLimit: 500,
      requirePINForTransactions: true,
      enableLocationServices: true,
      defaultAccountId: null,
    };

    const result = await this.getItem(this.storageKeys.ATM_SETTINGS, {
      defaultValue: defaultSettings
    });

    return {
      ...result,
      data: { ...defaultSettings, ...result.data }
    };
  }

  async updateATMSettings(updates) {
    try {
      const settingsResult = await this.getATMSettings();
      if (!settingsResult.success) return settingsResult;

      const updatedSettings = { ...settingsResult.data, ...updates };
      
      return await this.saveATMSettings(updatedSettings);
    } catch (error) {
      return {
        success: false,
        error: `Failed to update ATM settings: ${error.message}`
      };
    }
  }

  async saveCalendarSettings(settings) {
    return await this.setItem(this.storageKeys.CALENDAR_SETTINGS, settings);
  }

  async getCalendarSettings() {
    const defaultSettings = {
      weekStartsOn: 1, // Monday
      timeFormat: '12h',
      showWeekNumbers: false,
      defaultView: 'month',
      defaultReminder: 15, // minutes
      eventColors: {
        work: '#3B82F6',
        personal: '#10B981',
        health: '#F59E0B',
        finance: '#EF4444',
        social: '#8B5CF6',
        travel: '#06B6D4',
        education: '#84CC16',
        other: '#6B7280',
      },
    };

    const result = await this.getItem(this.storageKeys.CALENDAR_SETTINGS, {
      defaultValue: defaultSettings
    });

    return {
      ...result,
      data: { ...defaultSettings, ...result.data }
    };
  }

  async updateCalendarSettings(updates) {
    try {
      const settingsResult = await this.getCalendarSettings();
      if (!settingsResult.success) return settingsResult;

      const updatedSettings = { ...settingsResult.data, ...updates };
      
      return await this.saveCalendarSettings(updatedSettings);
    } catch (error) {
      return {
        success: false,
        error: `Failed to update calendar settings: ${error.message}`
      };
    }
  }

  async saveNotificationSettings(settings) {
    return await this.setItem(this.storageKeys.NOTIFICATION_SETTINGS, settings);
  }

  async getNotificationSettings() {
    const defaultSettings = {
      pushEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      transactionAlerts: true,
      lowBalanceAlerts: true,
      eventReminders: true,
      securityAlerts: true,
      dailySummary: false,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    };

    const result = await this.getItem(this.storageKeys.NOTIFICATION_SETTINGS, {
      defaultValue: defaultSettings
    });

    return {
      ...result,
      data: { ...defaultSettings, ...result.data }
    };
  }

  async updateNotificationSettings(updates) {
    try {
      const settingsResult = await this.getNotificationSettings();
      if (!settingsResult.success) return settingsResult;

      const updatedSettings = { ...settingsResult.data, ...updates };
      
      return await this.saveNotificationSettings(updatedSettings);
    } catch (error) {
      return {
        success: false,
        error: `Failed to update notification settings: ${error.message}`
      };
    }
  }

  // Cache management
  async setCacheItem(key, value, expiry = this.cacheExpiry.MEDIUM) {
    const cacheKey = `${this.storageKeys.CACHE}:${key}`;
    return await this.setItem(cacheKey, value, { expiry });
  }

  async getCacheItem(key, defaultValue = null) {
    const cacheKey = `${this.storageKeys.CACHE}:${key}`;
    return await this.getItem(cacheKey, { defaultValue });
  }

  async removeCacheItem(key) {
    const cacheKey = `${this.storageKeys.CACHE}:${key}`;
    return await this.removeItem(cacheKey);
  }

  async cleanExpiredCache() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.includes(this.storageKeys.CACHE));
      
      let cleanedCount = 0;
      
      for (const key of cacheKeys) {
        const result = await this.getItem(key);
        if (result.expired) {
          cleanedCount++;
        }
      }

      return {
        success: true,
        cleanedCount,
        message: `Cleaned ${cleanedCount} expired cache items`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to clean expired cache: ${error.message}`
      };
    }
  }

  // Storage analytics
  async getStorageInfo() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      const itemSizes = {};
      const categories = {
        user: 0,
        accounts: 0,
        transactions: 0,
        events: 0,
        settings: 0,
        cache: 0,
        other: 0
      };

      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        const size = new Blob([value || '']).size;
        totalSize += size;
        itemSizes[key] = size;

        // Categorize storage
        if (key.includes('user')) categories.user += size;
        else if (key.includes('account')) categories.accounts += size;
        else if (key.includes('transaction')) categories.transactions += size;
        else if (key.includes('event')) categories.events += size;
        else if (key.includes('settings')) categories.settings += size;
        else if (key.includes('cache')) categories.cache += size;
        else categories.other += size;
      }

      this.storageSize = totalSize;

      return {
        success: true,
        data: {
          totalKeys: allKeys.length,
          totalSize,
          itemSizes,
          categories,
          keys: allKeys,
          formattedSize: this.formatBytes(totalSize)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get storage info: ${error.message}`
      };
    }
  }

  async optimizeStorage() {
    try {
      let optimizedCount = 0;
      let sizeSaved = 0;

      // Clean expired cache
      const cacheResult = await this.cleanExpiredCache();
      if (cacheResult.success) {
        optimizedCount += cacheResult.cleanedCount;
      }

      // Remove duplicate transactions (keep latest)
      const transactionsResult = await this.getTransactions();
      if (transactionsResult.success && transactionsResult.data.length > 0) {
        const transactions = transactionsResult.data;
        const uniqueTransactions = [];
        const seen = new Set();

        for (const transaction of transactions) {
          const key = `${transaction.accountId}_${transaction.amount}_${transaction.timestamp}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueTransactions.push(transaction);
          } else {
            optimizedCount++;
          }
        }

        if (uniqueTransactions.length !== transactions.length) {
          await this.saveTransactions(uniqueTransactions);
        }
      }

      // Compress old data (older than 1 year)
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      
      return {
        success: true,
        optimizedCount,
        sizeSaved,
        message: `Storage optimized: ${optimizedCount} items processed`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to optimize storage: ${error.message}`
      };
    }
  }

  // Backup and restore
  async createBackup() {
    try {
      const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {}
      };

      // Get all data
      const userResult = await this.getUser();
      if (userResult.success && userResult.data) {
        backup.data.user = userResult.data;
      }

      const accountsResult = await this.getAccounts();
      if (accountsResult.success) {
        backup.data.accounts = accountsResult.data;
      }

      const transactionsResult = await this.getTransactions();
      if (transactionsResult.success) {
        backup.data.transactions = transactionsResult.data;
      }

      const eventsResult = await this.getEvents();
      if (eventsResult.success) {
        backup.data.events = eventsResult.data;
      }

      const atmSettingsResult = await this.getATMSettings();
      if (atmSettingsResult.success) {
        backup.data.atmSettings = atmSettingsResult.data;
      }

      const calendarSettingsResult = await this.getCalendarSettings();
      if (calendarSettingsResult.success) {
        backup.data.calendarSettings = calendarSettingsResult.data;
      }

      const notificationSettingsResult = await this.getNotificationSettings();
      if (notificationSettingsResult.success) {
        backup.data.notificationSettings = notificationSettingsResult.data;
      }

      // Store backup
      const backupKey = `${this.storageKeys.BACKUP_DATA}_${Date.now()}`;
      await this.setItem(backupKey, backup);

      return {
        success: true,
        data: backup,
        backupKey,
        size: new Blob([JSON.stringify(backup)]).size
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create backup: ${error.message}`
      };
    }
  }

  async restoreBackup(backupData) {
    try {
      if (!backupData || !backupData.data) {
        throw new Error('Invalid backup data');
      }

      // Create current backup before restore
      const currentBackup = await this.createBackup();

      let restoredCount = 0;

      // Restore user data
      if (backupData.data.user) {
        const result = await this.saveUser(backupData.data.user);
        if (result.success) restoredCount++;
      }

      // Restore accounts
      if (backupData.data.accounts) {
        const result = await this.saveAccounts(backupData.data.accounts);
        if (result.success) restoredCount++;
      }

      // Restore transactions
      if (backupData.data.transactions) {
        const result = await this.saveTransactions(backupData.data.transactions);
        if (result.success) restoredCount++;
      }

      // Restore events
      if (backupData.data.events) {
        const result = await this.saveEvents(backupData.data.events);
        if (result.success) restoredCount++;
      }

      // Restore settings
      if (backupData.data.atmSettings) {
        const result = await this.saveATMSettings(backupData.data.atmSettings);
        if (result.success) restoredCount++;
      }

      if (backupData.data.calendarSettings) {
        const result = await this.saveCalendarSettings(backupData.data.calendarSettings);
        if (result.success) restoredCount++;
      }

      if (backupData.data.notificationSettings) {
        const result = await this.saveNotificationSettings(backupData.data.notificationSettings);
        if (result.success) restoredCount++;
      }

      return {
        success: true,
        restoredCount,
        currentBackup: currentBackup.data,
        message: `Restored ${restoredCount} data categories`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to restore backup: ${error.message}`
      };
    }
  }

  async exportData(format = 'json') {
    try {
      const backup = await this.createBackup();
      if (!backup.success) return backup;

      const exportData = {
        ...backup.data,
        exportFormat: format,
        exportedAt: new Date().toISOString()
      };

      if (format === 'json') {
        return {
          success: true,
          data: JSON.stringify(exportData, null, 2),
          filename: `atm_app_export_${Date.now()}.json`,
          mimeType: 'application/json'
        };
      }

      return {
        success: true,
        data: exportData,
        format
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to export data: ${error.message}`
      };
    }
  }

  // Utility methods
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  async checkStorageAvailability() {
    try {
      const testKey = '@atm_app:storage_test';
      const testValue = 'test';
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrievedValue = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      if (retrievedValue !== testValue) {
        throw new Error('Storage read/write test failed');
      }

      return {
        success: true,
        message: 'Storage is available and working'
      };
    } catch (error) {
      return {
        success: false,
        error: `Storage availability check failed: ${error.message}`
      };
    }
  }

  async calculateStorageSize() {
    const info = await this.getStorageInfo();
    if (info.success) {
      this.storageSize = info.data.totalSize;
    }
    return this.storageSize;
  }

  // Session management
  async saveSession(sessionData) {
    return await this.setItem(this.storageKeys.SESSION_DATA, sessionData, {
      secure: true,
      expiry: this.cacheExpiry.LONG
    });
  }

  async getSession() {
    return await this.getItem(this.storageKeys.SESSION_DATA, { secure: true });
  }

  async clearSession() {
    return await this.removeItem(this.storageKeys.SESSION_DATA, { secure: true });
  }

  async saveLastSync(syncData) {
    return await this.setItem(this.storageKeys.LAST_SYNC, {
      ...syncData,
      timestamp: Date.now()
    });
  }

  async getLastSync() {
    return await this.getItem(this.storageKeys.LAST_SYNC);
  }
}

export default new StorageService();