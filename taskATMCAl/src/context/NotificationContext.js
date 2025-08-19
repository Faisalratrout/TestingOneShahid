import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  pushToken: null,
  settings: {
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    transactionAlerts: true,
    eventReminders: true,
    securityAlerts: true,
    marketingNotifications: false,
  },
  loading: false,
  error: null,
  permissionStatus: 'undetermined',
};

// Action types
const NotificationActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  CLEAR_ALL_NOTIFICATIONS: 'CLEAR_ALL_NOTIFICATIONS',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  SET_PUSH_TOKEN: 'SET_PUSH_TOKEN',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_PERMISSION_STATUS: 'SET_PERMISSION_STATUS',
};

// Notification types
export const NotificationTypes = {
  TRANSACTION: 'transaction',
  EVENT_REMINDER: 'event_reminder',
  SECURITY: 'security',
  SYSTEM: 'system',
  MARKETING: 'marketing',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
};

// Notification priorities
export const NotificationPriorities = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NotificationActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case NotificationActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case NotificationActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case NotificationActionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
      };

    case NotificationActionTypes.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length,
      };

    case NotificationActionTypes.UPDATE_NOTIFICATION:
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload.id ? action.payload : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };

    case NotificationActionTypes.DELETE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length,
      };

    case NotificationActionTypes.MARK_AS_READ:
      const markedNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, read: true, readAt: new Date().toISOString() }
          : notification
      );
      return {
        ...state,
        notifications: markedNotifications,
        unreadCount: markedNotifications.filter(n => !n.read).length,
      };

    case NotificationActionTypes.MARK_ALL_AS_READ:
      const allReadNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true,
        readAt: new Date().toISOString(),
      }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      };

    case NotificationActionTypes.CLEAR_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    case NotificationActionTypes.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
      };

    case NotificationActionTypes.SET_PUSH_TOKEN:
      return {
        ...state,
        pushToken: action.payload,
      };

    case NotificationActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case NotificationActionTypes.SET_PERMISSION_STATUS:
      return {
        ...state,
        permissionStatus: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext({});


const STORAGE_KEYS = {
  NOTIFICATIONS: '@notifications',
  SETTINGS: '@notification_settings',
  PUSH_TOKEN: '@push_token',
};

// Notification Prov
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeNotifications();
      registerForPushNotifications();
    }
  }, [isAuthenticated, user]);

  // Listen for push notifications
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    const responseListener = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      dispatch({ type: NotificationActionTypes.SET_LOADING, payload: true });

      // Load notifications from storage
      const [notificationsData, settingsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      if (notificationsData) {
        const notifications = JSON.parse(notificationsData);
        dispatch({ type: NotificationActionTypes.SET_NOTIFICATIONS, payload: notifications });
      }

      if (settingsData) {
        const settings = JSON.parse(settingsData);
        dispatch({ type: NotificationActionTypes.UPDATE_SETTINGS, payload: settings });
      }

      dispatch({ type: NotificationActionTypes.SET_LOADING, payload: false });
    } catch (error) {
      console.error('Notification initialization error:', error);
      dispatch({ type: NotificationActionTypes.SET_ERROR, payload: 'Failed to load notifications' });
    }
  };

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      dispatch({ type: NotificationActionTypes.SET_PERMISSION_STATUS, payload: finalStatus });

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        dispatch({ type: NotificationActionTypes.SET_PERMISSION_STATUS, payload: finalStatus });
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted');
        return;
      }

      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      dispatch({ type: NotificationActionTypes.SET_PUSH_TOKEN, payload: token });

      // Save token to storage and send to server
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
      await sendPushTokenToServer(token);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Push notification registration error:', error);
    }
  };

  const handleNotificationReceived = (notification) => {
    const { title, body, data } = notification.request.content;
    
    // Add to local notifications
    addNotification({
      title,
      message: body,
      type: data?.type || NotificationTypes.SYSTEM,
      priority: data?.priority || NotificationPriorities.NORMAL,
      data: data || {},
      source: 'push',
    });
  };

  const handleNotificationResponse = (response) => {
    const { notification, actionIdentifier } = response;
    const { data } = notification.request.content;
    
    // Handle notification tap
    if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      // Navigate to specific screen based on notification type :)
      handleNotificationNavigation(data);
    }
  };

  const handleNotificationNavigation = (data) => {
    // This would typically use your navigation system
    console.log('Navigate based on notification data:', data);
    
    switch (data?.type) {
      case NotificationTypes.TRANSACTION:
        // Navigate to transaction details
        break;
      case NotificationTypes.EVENT_REMINDER:
        // Navigate to calendar
        break;
      case NotificationTypes.SECURITY:
        // Navigate to security settings
        break;
      default:
        // Navigate to notifications list
        break;
    }
  };

  // Add notification
  const addNotification = async (notificationData) => {
    try {
      const notification = {
        id: Date.now().toString(),
        ...notificationData,
        read: false,
        createdAt: new Date().toISOString(),
        userId: user?.id,
      };

      dispatch({ type: NotificationActionTypes.ADD_NOTIFICATION, payload: notification });

      // Save to storage
      const updatedNotifications = [notification, ...state.notifications];
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));

      // Show in-app notification if app is active
      if (notification.source !== 'push') {
        showInAppNotification(notification);
      }

      return { success: true, notification };
    } catch (error) {
      dispatch({ type: NotificationActionTypes.SET_ERROR, payload: 'Failed to add notification' });
      return { success: false, error: error.message };
    }
  };

  // Show local push notification
  const showLocalNotification = async (notificationData) => {
    try {
      if (!state.settings.pushEnabled) return;

      const { title, message, data = {}, scheduledFor } = notificationData;

      const notificationContent = {
        title,
        body: message,
        data,
        sound: state.settings.soundEnabled,
      };

      if (scheduledFor) {
        // Schedule notification
        await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: { date: new Date(scheduledFor) },
        });
      } else {
        // Show immediate notification
        await Notifications.presentNotificationAsync(notificationContent);
      }

      return { success: true };
    } catch (error) {
      console.error('Local notification error:', error);
      return { success: false, error: error.message };
    }
  };

  // Show in-app notification (custom component)
  const showInAppNotification = (notification) => {
    // This would show a custom toast/banner component but for simplicity, we will use an alert
    // For now, we'll use Alert as fallback because it's simple and effective 
    if (notification.priority === NotificationPriorities.URGENT) {
      Alert.alert(
        notification.title,
        notification.message,
        [{ text: 'OK', onPress: () => markAsRead(notification.id) }]
      );
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    dispatch({ type: NotificationActionTypes.MARK_AS_READ, payload: notificationId });
    
    const updatedNotifications = state.notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true, readAt: new Date().toISOString() }
        : notification
    );
    
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    dispatch({ type: NotificationActionTypes.MARK_ALL_AS_READ });
    
    const updatedNotifications = state.notifications.map(notification => ({
      ...notification,
      read: true,
      readAt: new Date().toISOString(),
    }));
    
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    dispatch({ type: NotificationActionTypes.DELETE_NOTIFICATION, payload: notificationId });
    
    const filteredNotifications = state.notifications.filter(
      notification => notification.id !== notificationId
    );
    
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filteredNotifications));
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    dispatch({ type: NotificationActionTypes.CLEAR_ALL_NOTIFICATIONS });
    await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  };

  // Update notification settings
  const updateSettings = async (newSettings) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    dispatch({ type: NotificationActionTypes.UPDATE_SETTINGS, payload: newSettings });
    
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    
    // Update push token if push notifications are toggled
    if (newSettings.hasOwnProperty('pushEnabled')) {
      if (newSettings.pushEnabled && !state.pushToken) {
        await registerForPushNotifications();
      }
    }
  };

  // Schedule event reminder
  const scheduleEventReminder = async (event, reminderMinutes = 15) => {
    try {
      if (!state.settings.eventReminders) return { success: false };

      const eventDateTime = new Date(`${event.date} ${event.time}`);
      const reminderDateTime = new Date(eventDateTime.getTime() - reminderMinutes * 60000);

      if (reminderDateTime <= new Date()) {
        return { success: false, error: 'Cannot schedule past reminders' };
      }

      await showLocalNotification({
        title: 'Event Reminder',
        message: `${event.title} starts in ${reminderMinutes} minutes`,
        data: {
          type: NotificationTypes.EVENT_REMINDER,
          eventId: event.id,
        },
        scheduledFor: reminderDateTime.toISOString(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Send transaction notification
  const sendTransactionNotification = (transaction) => {
    if (!state.settings.transactionAlerts) return;

    const isWithdrawal = transaction.type === 'withdrawal';
    const title = isWithdrawal ? 'Money Withdrawn' : 'Money Deposited';
    const message = `${isWithdrawal ? '-' : '+'}$${transaction.amount.toFixed(2)} from ${transaction.accountNumber}`;

    addNotification({
      title,
      message,
      type: NotificationTypes.TRANSACTION,
      priority: NotificationPriorities.HIGH,
      data: {
        transactionId: transaction.id,
        accountId: transaction.accountId,
      },
    });
  };

  // Send security alert
  const sendSecurityAlert = (alertData) => {
    if (!state.settings.securityAlerts) return;

    addNotification({
      title: 'Security Alert',
      message: alertData.message,
      type: NotificationTypes.SECURITY,
      priority: NotificationPriorities.URGENT,
      data: alertData,
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: NotificationActionTypes.CLEAR_ERROR });
  };

  // Helper functions
  const sendPushTokenToServer = async (token) => {
    try {
      // Send token to your backend server
      console.log('Sending push token to server:', token);
      // await api.sendPushToken(token);
    } catch (error) {
      console.error('Failed to send push token to server:', error);
    }
  };

  const getNotificationsByType = (type) => {
    return state.notifications.filter(notification => notification.type === type);
  };

  const getUnreadNotifications = () => {
    return state.notifications.filter(notification => !notification.read);
  };

  // Context value
  const value = {
    ...state,

    // Actions
    addNotification,
    showLocalNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    scheduleEventReminder,
    sendTransactionNotification,
    sendSecurityAlert,
    clearError,

    // Helper functions
    getNotificationsByType,
    getUnreadNotifications,
    registerForPushNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;