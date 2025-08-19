import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Storage keys
const STORAGE_KEYS = {
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
  LAST_LOGIN: '@atm_app:last_login',
  SESSION_DATA: '@atm_app:session_data',
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

const useStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storageSize, setStorageSize] = useState(0);

  // Generic storage operations
  const setItem = useCallback(async (key, value) => {
    try {
      setIsLoading(true);
      setError(null);

      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
      });

      await AsyncStorage.setItem(key, serializedValue);
      return { success: true };
    } catch (error) {
      const errorMessage = `Failed to save ${key}: ${error.message}`;
      setError(errorMessage);
      console.error('Storage setItem error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getItem = useCallback(async (key, defaultValue = null) => {
    try {
      setIsLoading(true);
      setError(null);

      const serializedValue = await AsyncStorage.getItem(key);
      
      if (serializedValue === null) {
        return { success: true, data: defaultValue };
      }

      const parsedValue = JSON.parse(serializedValue);
      return { 
        success: true, 
        data: parsedValue.data,
        timestamp: parsedValue.timestamp,
      };
    } catch (error) {
      const errorMessage = `Failed to retrieve ${key}: ${error.message}`;
      setError(errorMessage);
      console.error('Storage getItem error:', errorMessage);
      return { success: false, error: errorMessage, data: defaultValue };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (key) => {
    try {
      setIsLoading(true);
      setError(null);

      await AsyncStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      const errorMessage = `Failed to remove ${key}: ${error.message}`;
      setError(errorMessage);
      console.error('Storage removeItem error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await AsyncStorage.clear();
      return { success: true };
    } catch (error) {
      const errorMessage = `Failed to clear storage: ${error.message}`;
      setError(errorMessage);
      console.error('Storage clearAll error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cached storage operations
  const setCachedItem = useCallback(async (key, value, expiration = CACHE_EXPIRATION.MEDIUM) => {
    const cacheData = {
      data: value,
      timestamp: Date.now(),
      expiration: Date.now() + expiration,
    };

    return await setItem(key, cacheData);
  }, [setItem]);

  const getCachedItem = useCallback(async (key, defaultValue = null) => {
    const result = await getItem(key, defaultValue);
    
    if (!result.success || !result.data) {
      return result;
    }

    // Check if cache is expired
    if (result.data.expiration && Date.now() > result.data.expiration) {
      await removeItem(key);
      return { success: true, data: defaultValue, expired: true };
    }

    return { 
      success: true, 
      data: result.data.data,
      timestamp: result.data.timestamp,
      cached: true,
    };
  }, [getItem, removeItem]);

  // User data operations
  const saveUserData = useCallback(async (userData) => {
    return await setItem(STORAGE_KEYS.USER_DATA, userData);
  }, [setItem]);

  const getUserData = useCallback(async () => {
    return await getItem(STORAGE_KEYS.USER_DATA, null);
  }, [getItem]);

  const clearUserData = useCallback(async () => {
    return await removeItem(STORAGE_KEYS.USER_DATA);
  }, [removeItem]);

  // Account operations
  const saveAccounts = useCallback(async (accounts) => {
    return await setItem(STORAGE_KEYS.ACCOUNTS, accounts);
  }, [setItem]);

  const getAccounts = useCallback(async () => {
    const result = await getItem(STORAGE_KEYS.ACCOUNTS, []);
    return result.success ? { ...result, data: result.data || [] } : result;
  }, [getItem]);

  const addAccount = useCallback(async (account) => {
    const accountsResult = await getAccounts();
    if (!accountsResult.success) return accountsResult;

    const updatedAccounts = [...(accountsResult.data || []), account];
    return await saveAccounts(updatedAccounts);
  }, [getAccounts, saveAccounts]);

  const updateAccount = useCallback(async (accountId, updates) => {
    const accountsResult = await getAccounts();
    if (!accountsResult.success) return accountsResult;

    const accounts = accountsResult.data || [];
    const updatedAccounts = accounts.map(account => 
      account.id === accountId ? { ...account, ...updates } : account
    );

    return await saveAccounts(updatedAccounts);
  }, [getAccounts, saveAccounts]);

  const deleteAccount = useCallback(async (accountId) => {
    const accountsResult = await getAccounts();
    if (!accountsResult.success) return accountsResult;

    const accounts = accountsResult.data || [];
    const updatedAccounts = accounts.filter(account => account.id !== accountId);

    return await saveAccounts(updatedAccounts);
  }, [getAccounts, saveAccounts]);

  // Transaction operations
  const saveTransactions = useCallback(async (transactions) => {
    return await setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [setItem]);

  const getTransactions = useCallback(async () => {
    const result = await getItem(STORAGE_KEYS.TRANSACTIONS, []);
    return result.success ? { ...result, data: result.data || [] } : result;
  }, [getItem]);

  const addTransaction = useCallback(async (transaction) => {
    const transactionsResult = await getTransactions();
    if (!transactionsResult.success) return transactionsResult;

    const updatedTransactions = [...(transactionsResult.data || []), transaction];
    return await saveTransactions(updatedTransactions);
  }, [getTransactions, saveTransactions]);

  const getTransactionsByAccount = useCallback(async (accountId) => {
    const transactionsResult = await getTransactions();
    if (!transactionsResult.success) return transactionsResult;

    const accountTransactions = (transactionsResult.data || [])
      .filter(transaction => transaction.accountId === accountId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return { success: true, data: accountTransactions };
  }, [getTransactions]);

  // Event operations
  const saveEvents = useCallback(async (events) => {
    return await setItem(STORAGE_KEYS.EVENTS, events);
  }, [setItem]);

  const getEvents = useCallback(async () => {
    const result = await getItem(STORAGE_KEYS.EVENTS, []);
    return result.success ? { ...result, data: result.data || [] } : result;
  }, [getItem]);

  const addEvent = useCallback(async (event) => {
    const eventsResult = await getEvents();
    if (!eventsResult.success) return eventsResult;

    const updatedEvents = [...(eventsResult.data || []), event];
    return await saveEvents(updatedEvents);
  }, [getEvents, saveEvents]);

  const updateEvent = useCallback(async (eventId, updates) => {
    const eventsResult = await getEvents();
    if (!eventsResult.success) return eventsResult;

    const events = eventsResult.data || [];
    const updatedEvents = events.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    );

    return await saveEvents(updatedEvents);
  }, [getEvents, saveEvents]);

  const deleteEvent = useCallback(async (eventId) => {
    const eventsResult = await getEvents();
    if (!eventsResult.success) return eventsResult;

    const events = eventsResult.data || [];
    const updatedEvents = events.filter(event => event.id !== eventId);

    return await saveEvents(updatedEvents);
  }, [getEvents, saveEvents]);

  // Settings operations
  const saveATMSettings = useCallback(async (settings) => {
    return await setItem(STORAGE_KEYS.ATM_SETTINGS, settings);
  }, [setItem]);

  const getATMSettings = useCallback(async () => {
    const defaultSettings = {
      currency: 'USD',
      autoPrintReceipt: true,
      showQuickAmounts: true,
      dailyLimit: 1000,
      singleTransactionLimit: 500,
    };
    
    const result = await getItem(STORAGE_KEYS.ATM_SETTINGS, defaultSettings);
    return result.success ? { ...result, data: result.data || defaultSettings } : result;
  }, [getItem]);

  const saveCalendarSettings = useCallback(async (settings) => {
    return await setItem(STORAGE_KEYS.CALENDAR_SETTINGS, settings);
  }, [setItem]);

  const getCalendarSettings = useCallback(async () => {
    const defaultSettings = {
      weekStartsOn: 1, // Monday
      showWeekNumbers: false,
      defaultReminder: true,
      defaultReminderTime: 15, // minutes before event
    };

    const result = await getItem(STORAGE_KEYS.CALENDAR_SETTINGS, defaultSettings);
    return result.success ? { ...result, data: result.data || defaultSettings } : result;
  }, [getItem]);

  const saveNotificationSettings = useCallback(async (settings) => {
    return await setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
  }, [setItem]);

  const getNotificationSettings = useCallback(async () => {
    const defaultSettings = {
      pushEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      transactionAlerts: true,
      eventReminders: true,
      securityAlerts: true,
    };

    const result = await getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, defaultSettings);
    return result.success ? { ...result, data: result.data || defaultSettings } : result;
  }, [getItem]);

  // Session management
  const saveSessionData = useCallback(async (sessionData) => {
    return await setCachedItem(STORAGE_KEYS.SESSION_DATA, sessionData, CACHE_EXPIRATION.LONG);
  }, [setCachedItem]);

  const getSessionData = useCallback(async () => {
    return await getCachedItem(STORAGE_KEYS.SESSION_DATA, null);
  }, [getCachedItem]);

  const clearSessionData = useCallback(async () => {
    return await removeItem(STORAGE_KEYS.SESSION_DATA);
  }, [removeItem]);

  // Security operations
  const saveBiometricEnabled = useCallback(async (enabled) => {
    return await setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled);
  }, [setItem]);

  const getBiometricEnabled = useCallback(async () => {
    const result = await getItem(STORAGE_KEYS.BIOMETRIC_ENABLED, false);
    return result.success ? { ...result, data: result.data || false } : result;
  }, [getItem]);

  const saveLastLogin = useCallback(async (timestamp) => {
    return await setItem(STORAGE_KEYS.LAST_LOGIN, timestamp);
  }, [setItem]);

  const getLastLogin = useCallback(async () => {
    return await getItem(STORAGE_KEYS.LAST_LOGIN, null);
  }, [getItem]);

  // Storage management
  const getStorageInfo = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      const itemSizes = {};

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        const size = new Blob([value || '']).size;
        totalSize += size;
        itemSizes[key] = size;
      }

      setStorageSize(totalSize);

      return {
        success: true,
        data: {
          totalKeys: keys.length,
          totalSize,
          itemSizes,
          keys,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }, []);

  const cleanupExpiredCache = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.includes('cache') || key.includes('session'));
      
      let cleanedCount = 0;

      for (const key of cacheKeys) {
        const result = await getCachedItem(key);
        if (result.expired) {
          cleanedCount++;
        }
      }

      return {
        success: true,
        cleanedCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }, [getCachedItem]);

  const exportData = useCallback(async () => {
    try {
      const userData = await getUserData();
      const accounts = await getAccounts();
      const transactions = await getTransactions();
      const events = await getEvents();
      const atmSettings = await getATMSettings();
      const calendarSettings = await getCalendarSettings();

      const exportData = {
        user: userData.data,
        accounts: accounts.data,
        transactions: transactions.data,
        events: events.data,
        settings: {
          atm: atmSettings.data,
          calendar: calendarSettings.data,
        },
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      return {
        success: true,
        data: exportData,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }, [getUserData, getAccounts, getTransactions, getEvents, getATMSettings, getCalendarSettings]);

  const importData = useCallback(async (importData) => {
    try {
      if (!importData || !importData.version) {
        throw new Error('Invalid import data format');
      }

      // Backup current data before import
      const backupData = await exportData();
      await setItem('@atm_app:backup_' + Date.now(), backupData.data);

      // Import data
      if (importData.user) await saveUserData(importData.user);
      if (importData.accounts) await saveAccounts(importData.accounts);
      if (importData.transactions) await saveTransactions(importData.transactions);
      if (importData.events) await saveEvents(importData.events);
      if (importData.settings?.atm) await saveATMSettings(importData.settings.atm);
      if (importData.settings?.calendar) await saveCalendarSettings(importData.settings.calendar);

      return {
        success: true,
        message: 'Data imported successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }, [exportData, setItem, saveUserData, saveAccounts, saveTransactions, saveEvents, saveATMSettings, saveCalendarSettings]);

  // Initialize storage
  useEffect(() => {
    cleanupExpiredCache();
    getStorageInfo();
  }, []);

  return {
    // State
    isLoading,
    error,
    storageSize,

    // Generic operations
    setItem,
    getItem,
    removeItem,
    clearAll,
    setCachedItem,
    getCachedItem,

    // User operations
    saveUserData,
    getUserData,
    clearUserData,

    // Account operations
    saveAccounts,
    getAccounts,
    addAccount,
    updateAccount,
    deleteAccount,

    // Transaction operations
    saveTransactions,
    getTransactions,
    addTransaction,
    getTransactionsByAccount,

    // Event operations
    saveEvents,
    getEvents,
    addEvent,
    updateEvent,
    deleteEvent,

    // Settings operations
    saveATMSettings,
    getATMSettings,
    saveCalendarSettings,
    getCalendarSettings,
    saveNotificationSettings,
    getNotificationSettings,

    // Session management
    saveSessionData,
    getSessionData,
    clearSessionData,

    // Security operations
    saveBiometricEnabled,
    getBiometricEnabled,
    saveLastLogin,
    getLastLogin,

    // Storage management
    getStorageInfo,
    cleanupExpiredCache,
    exportData,
    importData,

    // Constants
    STORAGE_KEYS,
    CACHE_EXPIRATION,
  };
};

export default useStorage;