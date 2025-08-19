import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  // ATM Data
  accounts: [],
  selectedAccount: null,
  transactions: [],
  atmSettings: {
    dailyLimit: 5000,
    perTransactionLimit: 1000,
    currency: 'USD',
    language: 'en',
  },

  // Calendar Data
  events: [],
  selectedDate: null,
  calendarSettings: {
    defaultView: 'month',
    weekStartsOn: 1, // Monday
    showWeekNumbers: false,
  },

  // App Data
  loading: false,
  error: null,
  lastSync: null,
  isOffline: false,
};

// Action types
const DataActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_OFFLINE: 'SET_OFFLINE',
  SET_LAST_SYNC: 'SET_LAST_SYNC',
  
  // ATM Actions
  SET_ACCOUNTS: 'SET_ACCOUNTS',
  SET_SELECTED_ACCOUNT: 'SET_SELECTED_ACCOUNT',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  UPDATE_ACCOUNT_BALANCE: 'UPDATE_ACCOUNT_BALANCE',
  UPDATE_ATM_SETTINGS: 'UPDATE_ATM_SETTINGS',

  // Calendar Actions
  SET_EVENTS: 'SET_EVENTS',
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  SET_SELECTED_DATE: 'SET_SELECTED_DATE',
  UPDATE_CALENDAR_SETTINGS: 'UPDATE_CALENDAR_SETTINGS',

  // Data Management
  RESET_DATA: 'RESET_DATA',
  SYNC_DATA: 'SYNC_DATA',
};

// Reducer
const dataReducer = (state, action) => {
  switch (action.type) {
    case DataActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case DataActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case DataActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case DataActionTypes.SET_OFFLINE:
      return {
        ...state,
        isOffline: action.payload,
      };

    case DataActionTypes.SET_LAST_SYNC:
      return {
        ...state,
        lastSync: action.payload,
      };

    // ATM Actions
    case DataActionTypes.SET_ACCOUNTS:
      return {
        ...state,
        accounts: action.payload,
        selectedAccount: action.payload.length > 0 && !state.selectedAccount 
          ? action.payload[0] 
          : state.selectedAccount,
      };

    case DataActionTypes.SET_SELECTED_ACCOUNT:
      return {
        ...state,
        selectedAccount: action.payload,
      };

    case DataActionTypes.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case DataActionTypes.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
      };

    case DataActionTypes.UPDATE_ACCOUNT_BALANCE:
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.accountId
            ? { ...account, balance: action.payload.newBalance }
            : account
        ),
        selectedAccount: state.selectedAccount?.id === action.payload.accountId
          ? { ...state.selectedAccount, balance: action.payload.newBalance }
          : state.selectedAccount,
      };

    case DataActionTypes.UPDATE_ATM_SETTINGS:
      return {
        ...state,
        atmSettings: { ...state.atmSettings, ...action.payload },
      };

    // Calendar Actions
    case DataActionTypes.SET_EVENTS:
      return {
        ...state,
        events: action.payload,
      };

    case DataActionTypes.ADD_EVENT:
      return {
        ...state,
        events: [...state.events, action.payload],
      };

    case DataActionTypes.UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id ? action.payload : event
        ),
      };

    case DataActionTypes.DELETE_EVENT:
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
      };

    case DataActionTypes.SET_SELECTED_DATE:
      return {
        ...state,
        selectedDate: action.payload,
      };

    case DataActionTypes.UPDATE_CALENDAR_SETTINGS:
      return {
        ...state,
        calendarSettings: { ...state.calendarSettings, ...action.payload },
      };

    // Data Management
    case DataActionTypes.RESET_DATA:
      return {
        ...initialState,
        atmSettings: state.atmSettings,
        calendarSettings: state.calendarSettings,
      };

    case DataActionTypes.SYNC_DATA:
      return {
        ...state,
        ...action.payload,
        lastSync: new Date().toISOString(),
      };

    default:
      return state;
  }
};

// Create context
const DataContext = createContext({});

// Storage keys
const STORAGE_KEYS = {
  ACCOUNTS: '@data_accounts',
  TRANSACTIONS: '@data_transactions',
  EVENTS: '@data_events',
  ATM_SETTINGS: '@data_atm_settings',
  CALENDAR_SETTINGS: '@data_calendar_settings',
  SELECTED_ACCOUNT: '@data_selected_account',
};

// Data Provider
export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Initialize data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeData();
    } else {
      // Reset data when user logs out
      dispatch({ type: DataActionTypes.RESET_DATA });
    }
  }, [isAuthenticated, user]);

  // Auto-sync data periodically (every 5 minutes / my preference)
  useEffect(() => {
    if (isAuthenticated) {
      const syncInterval = setInterval(() => {
        syncData();
      }, 5 * 60 * 1000); // Sync every 5 minutes(my preference)

      return () => clearInterval(syncInterval);
    }
  }, [isAuthenticated]);

  const initializeData = async () => {
    try {
      dispatch({ type: DataActionTypes.SET_LOADING, payload: true });

      // Load data from storage
      const [
        accountsData,
        transactionsData,
        eventsData,
        atmSettingsData,
        calendarSettingsData,
        selectedAccountData,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.EVENTS),
        AsyncStorage.getItem(STORAGE_KEYS.ATM_SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_ACCOUNT),
      ]);

      // Parse and set data
      if (accountsData) {
        const accounts = JSON.parse(accountsData);
        dispatch({ type: DataActionTypes.SET_ACCOUNTS, payload: accounts });
      } else {
        // Load default/demo accounts
        await loadDefaultAccounts();
      }

      if (transactionsData) {
        const transactions = JSON.parse(transactionsData);
        dispatch({ type: DataActionTypes.SET_TRANSACTIONS, payload: transactions });
      }

      if (eventsData) {
        const events = JSON.parse(eventsData);
        dispatch({ type: DataActionTypes.SET_EVENTS, payload: events });
      }

      if (atmSettingsData) {
        const atmSettings = JSON.parse(atmSettingsData);
        dispatch({ type: DataActionTypes.UPDATE_ATM_SETTINGS, payload: atmSettings });
      }

      if (calendarSettingsData) {
        const calendarSettings = JSON.parse(calendarSettingsData);
        dispatch({ type: DataActionTypes.UPDATE_CALENDAR_SETTINGS, payload: calendarSettings });
      }

      if (selectedAccountData) {
        const selectedAccount = JSON.parse(selectedAccountData);
        dispatch({ type: DataActionTypes.SET_SELECTED_ACCOUNT, payload: selectedAccount });
      }

      dispatch({ type: DataActionTypes.SET_LOADING, payload: false });
      dispatch({ type: DataActionTypes.SET_LAST_SYNC, payload: new Date().toISOString() });
    } catch (error) {
      console.error('Data initialization error:', error);
      dispatch({ type: DataActionTypes.SET_ERROR, payload: 'Failed to load data' });
    }
  };

  // ATM Functions
  const loadDefaultAccounts = async () => {
    const defaultAccounts = [
      {
        id: '1',
        accountNumber: '****1234',
        fullAccountNumber: '1234567812345678',
        type: 'checking',
        balance: 2500.00,
        currency: 'USD',
        isActive: true,
        isPrimary: true,
        bank: 'Demo Bank',
        cardholderName: user?.name || 'Demo User',
      },
      {
        id: '2',
        accountNumber: '****5678',
        fullAccountNumber: '5678901256789012',
        type: 'savings',
        balance: 10750.50,
        currency: 'USD',
        isActive: true,
        isPrimary: false,
        bank: 'Demo Bank',
        cardholderName: user?.name || 'Demo User',
      },
    ];

    dispatch({ type: DataActionTypes.SET_ACCOUNTS, payload: defaultAccounts });
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(defaultAccounts));
  };

  const addTransaction = async (transactionData) => {
    try {
      const transaction = {
        id: Date.now().toString(),
        ...transactionData,
        timestamp: new Date().toISOString(),
        status: 'completed',
      };

      dispatch({ type: DataActionTypes.ADD_TRANSACTION, payload: transaction });

      // Update account balance
      if (state.selectedAccount) {
        const newBalance = transactionData.type === 'withdrawal'
          ? state.selectedAccount.balance - transactionData.amount
          : state.selectedAccount.balance + transactionData.amount;

        dispatch({
          type: DataActionTypes.UPDATE_ACCOUNT_BALANCE,
          payload: {
            accountId: state.selectedAccount.id,
            newBalance,
          },
        });

        // Save to storage
        await saveTransactions([transaction, ...state.transactions]);
        await saveAccounts(state.accounts.map(account =>
          account.id === state.selectedAccount.id
            ? { ...account, balance: newBalance }
            : account
        ));
      }

      return { success: true, transaction };
    } catch (error) {
      dispatch({ type: DataActionTypes.SET_ERROR, payload: 'Failed to process transaction' });
      return { success: false, error: error.message };
    }
  };

  const selectAccount = async (account) => {
    dispatch({ type: DataActionTypes.SET_SELECTED_ACCOUNT, payload: account });
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT, JSON.stringify(account));
  };

  const updateATMSettings = async (settings) => {
    dispatch({ type: DataActionTypes.UPDATE_ATM_SETTINGS, payload: settings });
    await AsyncStorage.setItem(STORAGE_KEYS.ATM_SETTINGS, JSON.stringify({
      ...state.atmSettings,// storing existing settings 
      ...settings,
    }));
  };

  // Calendar Functions
  const addEvent = async (eventData) => {
    try {
      const event = {
        id: Date.now().toString(),
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: DataActionTypes.ADD_EVENT, payload: event });
      await saveEvents([...state.events, event]);

      return { success: true, event };
    } catch (error) {
      dispatch({ type: DataActionTypes.SET_ERROR, payload: 'Failed to add event' });
      return { success: false, error: error.message };
    }
  };

  const updateEvent = async (eventId, eventData) => {
    try {
      const updatedEvent = {
        ...state.events.find(e => e.id === eventId),
        ...eventData,
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: DataActionTypes.UPDATE_EVENT, payload: updatedEvent });
      
      const updatedEvents = state.events.map(event =>
        event.id === eventId ? updatedEvent : event
      );
      await saveEvents(updatedEvents);

      return { success: true, event: updatedEvent };
    } catch (error) {
      dispatch({ type: DataActionTypes.SET_ERROR, payload: 'Failed to update event' });
      return { success: false, error: error.message };
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      dispatch({ type: DataActionTypes.DELETE_EVENT, payload: eventId });
      
      const filteredEvents = state.events.filter(event => event.id !== eventId);
      await saveEvents(filteredEvents);

      return { success: true };
    } catch (error) {
      dispatch({ type: DataActionTypes.SET_ERROR, payload: 'Failed to delete event' });
      return { success: false, error: error.message };
    }
  };

  const setSelectedDate = (date) => {
    dispatch({ type: DataActionTypes.SET_SELECTED_DATE, payload: date });
  };

  const updateCalendarSettings = async (settings) => {
    dispatch({ type: DataActionTypes.UPDATE_CALENDAR_SETTINGS, payload: settings });
    await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_SETTINGS, JSON.stringify({
      ...state.calendarSettings,
      ...settings,
    }));
  };

  // Data Management Functions
  const syncData = async () => {
    try {
      // Simulate API sync - replace with my actual API calls
      const response = await mockSyncAPI({
        accounts: state.accounts,
        transactions: state.transactions,
        events: state.events,
        lastSync: state.lastSync,
      });

      if (response.success) {
        // Update local data with server data
        dispatch({ type: DataActionTypes.SYNC_DATA, payload: response.data });
        
        // Save synced data to storage
        await Promise.all([
          saveAccounts(response.data.accounts || state.accounts),
          saveTransactions(response.data.transactions || state.transactions),
          saveEvents(response.data.events || state.events),
        ]);
      }

      return { success: true };
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: DataActionTypes.CLEAR_ERROR });
  };

  const setOfflineStatus = (isOffline) => {
    dispatch({ type: DataActionTypes.SET_OFFLINE, payload: isOffline });
  };

  // Storage helper functions
  const saveAccounts = async (accounts) => {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  };

  const saveTransactions = async (transactions) => {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  };

  const saveEvents = async (events) => {
    await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  };

  // Computed values
  const getEventsByDate = (date) => {
    return state.events.filter(event => event.date === date);
  };

  const getTransactionsByAccount = (accountId) => {
    return state.transactions.filter(transaction => 
      transaction.accountId === accountId
    );
  };

  const getTotalBalance = () => {
    return state.accounts.reduce((total, account) => total + account.balance, 0);
  };

  // Context value
  const value = {
    // State
    ...state,

    // ATM Functions
    addTransaction,
    selectAccount,
    updateATMSettings,
    getTransactionsByAccount,
    getTotalBalance,

    // Calendar Functions
    addEvent,
    updateEvent,
    deleteEvent,
    setSelectedDate,
    updateCalendarSettings,
    getEventsByDate,

    // Data Management
    syncData,
    clearError,
    setOfflineStatus,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use data context
export const useData = () => {
  const context = useContext(DataContext);
  
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
};

// Mock API function (replace with my actual API)
const mockSyncAPI = async (localData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock response
  return {
    success: true,
    data: {
      accounts: localData.accounts,
      transactions: localData.transactions,
      events: localData.events,
      serverTime: new Date().toISOString(),
    },
  };
};

export default DataContext;