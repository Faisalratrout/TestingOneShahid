import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.storageKey = '@atm_app:notification_settings';
    this.scheduledKey = '@atm_app:scheduled_notifications';
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      await this.requestPermissions();
      
      // Set up notification categories
      await this.setupNotificationCategories();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
    }
  }

  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Notification permissions not granted');
      }

      // Get push notification token for remote notifications
      if (Platform.OS !== 'web') {
        const token = await Notifications.getExpoPushTokenAsync();
        await AsyncStorage.setItem('@atm_app:push_token', token.data);
      }

      return {
        success: true,
        status: finalStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async setupNotificationCategories() {
    try {
      await Notifications.setNotificationCategoryAsync('TRANSACTION_ALERT', [
        {
          identifier: 'VIEW_TRANSACTION',
          buttonTitle: 'View Details',
          options: { opensAppToForeground: true }
        },
        {
          identifier: 'DISMISS',
          buttonTitle: 'Dismiss',
          options: { opensAppToForeground: false }
        }
      ]);

      await Notifications.setNotificationCategoryAsync('EVENT_REMINDER', [
        {
          identifier: 'VIEW_EVENT',
          buttonTitle: 'View Event',
          options: { opensAppToForeground: true }
        },
        {
          identifier: 'SNOOZE',
          buttonTitle: 'Snooze 5min',
          options: { opensAppToForeground: false }
        }
      ]);

      await Notifications.setNotificationCategoryAsync('SECURITY_ALERT', [
        {
          identifier: 'VIEW_SECURITY',
          buttonTitle: 'View Details',
          options: { opensAppToForeground: true }
        }
      ]);
    } catch (error) {
      console.error('Failed to setup notification categories:', error);
    }
  }

  // Settings management
  async getSettings() {
    try {
      const settingsData = await AsyncStorage.getItem(this.storageKey);
      const defaultSettings = {
        pushEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        transactionAlerts: true,
        eventReminders: true,
        securityAlerts: true,
        lowBalanceAlerts: true,
        dailySummary: false,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      };

      const settings = settingsData ? 
        { ...defaultSettings, ...JSON.parse(settingsData) } : 
        defaultSettings;

      return {
        success: true,
        data: settings
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve notification settings'
      };
    }
  }

  async updateSettings(newSettings) {
    try {
      const currentResult = await this.getSettings();
      const currentSettings = currentResult.success ? currentResult.data : {};

      const updatedSettings = {
        ...currentSettings,
        ...newSettings,
        updatedAt: new Date().toISOString()
      };

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(updatedSettings));

      return {
        success: true,
        data: updatedSettings
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update notification settings'
      };
    }
  }

  // Transaction notifications
  async sendTransactionAlert(data) {
    try {
      await this.initialize();

      const settings = await this.getSettings();
      if (!settings.success || !settings.data.transactionAlerts || !settings.data.pushEnabled) {
        return { success: true, skipped: true };
      }

      const { title, message, transaction } = data;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title || 'Transaction Alert',
          body: message,
          sound: settings.data.soundEnabled ? 'default' : false,
          vibrate: settings.data.vibrationEnabled ? [0, 250, 250, 250] : false,
          categoryIdentifier: 'TRANSACTION_ALERT',
          data: {
            type: 'transaction',
            transactionId: transaction?.id,
            accountId: transaction?.accountId,
            amount: transaction?.amount
          }
        },
        trigger: null // Send immediately
      });

      return {
        success: true,
        notificationId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendLowBalanceAlert(data) {
    try {
      await this.initialize();

      const settings = await this.getSettings();
      if (!settings.success || !settings.data.lowBalanceAlerts || !settings.data.pushEnabled) {
        return { success: true, skipped: true };
      }

      const { account, threshold } = data;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Low Balance Alert',
          body: `Your account balance is below $${threshold}. Current balance: $${account.balance.toFixed(2)}`,
          sound: settings.data.soundEnabled ? 'default' : false,
          vibrate: settings.data.vibrationEnabled ? [0, 250, 250, 250] : false,
          categoryIdentifier: 'TRANSACTION_ALERT',
          data: {
            type: 'low_balance',
            accountId: account.id,
            balance: account.balance,
            threshold
          }
        },
        trigger: null
      });

      return {
        success: true,
        notificationId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Event notifications
  async scheduleEventReminder(event) {
    try {
      await this.initialize();

      const settings = await this.getSettings();
      if (!settings.success || !settings.data.eventReminders || !settings.data.pushEnabled) {
        return { success: true, skipped: true };
      }

      if (!event.reminder || !event.date || !event.time) {
        return { success: false, error: 'Invalid event reminder data' };
      }

      // Calculate notification time
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const reminderTime = new Date(eventDateTime.getTime() - (event.reminder * 60 * 1000));

      if (reminderTime <= new Date()) {
        return { success: false, error: 'Reminder time is in the past' };
      }

      // Check if in quiet hours
      if (settings.data.quietHoursEnabled && this.isQuietTime(reminderTime, settings.data)) {
        return { success: true, skipped: true, reason: 'quiet_hours' };
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Event Reminder',
          body: `${event.title} is starting in ${event.reminder} minutes`,
          sound: settings.data.soundEnabled ? 'default' : false,
          vibrate: settings.data.vibrationEnabled ? [0, 250, 250, 250] : false,
          categoryIdentifier: 'EVENT_REMINDER',
          data: {
            type: 'event_reminder',
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: event.time
          }
        },
        trigger: {
          date: reminderTime
        }
      });

      // Store scheduled notification
      await this.storeScheduledNotification({
        id: notificationId,
        type: 'event_reminder',
        eventId: event.id,
        scheduledFor: reminderTime.toISOString()
      });

      return {
        success: true,
        notificationId,
        scheduledFor: reminderTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async cancelEventReminder(eventId) {
    try {
      // Get scheduled notifications
      const scheduledData = await AsyncStorage.getItem(this.scheduledKey);
      const scheduled = scheduledData ? JSON.parse(scheduledData) : [];

      // Find notification for this event
      const eventNotifications = scheduled.filter(n => 
        n.type === 'event_reminder' && n.eventId === eventId
      );

      // Cancel notifications
      for (const notification of eventNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.id);
      }

      // Remove from stored scheduled notifications
      const updatedScheduled = scheduled.filter(n => 
        !(n.type === 'event_reminder' && n.eventId === eventId)
      );
      await AsyncStorage.setItem(this.scheduledKey, JSON.stringify(updatedScheduled));

      return {
        success: true,
        canceledCount: eventNotifications.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Security notifications
  async sendSecurityAlert(data) {
    try {
      await this.initialize();

      const settings = await this.getSettings();
      if (!settings.success || !settings.data.securityAlerts || !settings.data.pushEnabled) {
        return { success: true, skipped: true };
      }

      const { title, message, type } = data;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title || 'Security Alert',
          body: message,
          sound: 'default', // Always play sound for security alerts
          vibrate: [0, 250, 250, 250], // Always vibrate for security alerts
          categoryIdentifier: 'SECURITY_ALERT',
          data: {
            type: 'security',
            securityType: type,
            timestamp: new Date().toISOString()
          }
        },
        trigger: null
      });

      return {
        success: true,
        notificationId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Daily summary
  async scheduleDailySummary(summary) {
    try {
      await this.initialize();

      const settings = await this.getSettings();
      if (!settings.success || !settings.data.dailySummary || !settings.data.pushEnabled) {
        return { success: true, skipped: true };
      }

      // Schedule for next day at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Summary',
          body: `You had ${summary.transactionCount} transactions totaling $${summary.totalAmount.toFixed(2)} yesterday.`,
          sound: settings.data.soundEnabled ? 'default' : false,
          data: {
            type: 'daily_summary',
            summary
          }
        },
        trigger: {
          date: tomorrow,
          repeats: true
        }
      });

      return {
        success: true,
        notificationId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Utility methods
  async storeScheduledNotification(notification) {
    try {
      const scheduledData = await AsyncStorage.getItem(this.scheduledKey);
      const scheduled = scheduledData ? JSON.parse(scheduledData) : [];
      scheduled.push(notification);
      await AsyncStorage.setItem(this.scheduledKey, JSON.stringify(scheduled));
    } catch (error) {
      console.error('Failed to store scheduled notification:', error);
    }
  }

  async getScheduledNotifications() {
    try {
      const scheduledData = await AsyncStorage.getItem(this.scheduledKey);
      return {
        success: true,
        data: scheduledData ? JSON.parse(scheduledData) : []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(this.scheduledKey);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  isQuietTime(time, settings) {
    if (!settings.quietHoursEnabled) return false;

    const hour = time.getHours();
    const startHour = parseInt(settings.quietHoursStart.split(':')[0]);
    const endHour = parseInt(settings.quietHoursEnd.split(':')[0]);

    if (startHour <= endHour) {
      return hour >= startHour && hour < endHour;
    } else {
      // Quiet hours span midnight
      return hour >= startHour || hour < endHour;
    }
  }

  // Notification handlers
  async handleNotificationReceived(notification) {
    const { type } = notification.request.content.data || {};

    switch (type) {
      case 'transaction':
        // Handle transaction notification
        break;
      case 'event_reminder':
        // Handle event reminder
        break;
      case 'security':
        // Handle security alert
        break;
      case 'low_balance':
        // Handle low balance alert
        break;
      default:
        break;
    }
  }

  async handleNotificationResponse(response) {
    const { actionIdentifier, userText } = response;
    const { type, ...data } = response.notification.request.content.data || {};

    switch (actionIdentifier) {
      case 'VIEW_TRANSACTION':
        // Navigate to transaction details
        break;
      case 'VIEW_EVENT':
        // Navigate to event details
        break;
      case 'SNOOZE':
        // Snooze reminder for 5 minutes
        if (type === 'event_reminder') {
          await this.snoozeEventReminder(data.eventId, 5);
        }
        break;
      default:
        break;
    }
  }

  async snoozeEventReminder(eventId, minutes) {
    try {
      const snoozeTime = new Date(Date.now() + minutes * 60 * 1000);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Event Reminder (Snoozed)',
          body: `Your event is starting soon!`,
          categoryIdentifier: 'EVENT_REMINDER',
          data: {
            type: 'event_reminder',
            eventId: eventId,
            snoozed: true
          }
        },
        trigger: {
          date: snoozeTime
        }
      });

      return {
        success: true,
        notificationId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new NotificationService();