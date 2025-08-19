import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import NotificationService from './NotificationService';

class CalendarService {
  constructor() {
    this.storageKey = '@atm_app:events';
    this.settingsKey = '@atm_app:calendar_settings';
  }

  // Event management
  async getAllEvents() {
    try {
      const eventsData = await AsyncStorage.getItem(this.storageKey);
      const events = eventsData ? JSON.parse(eventsData) : [];
      return {
        success: true,
        data: events.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve events',
        data: []
      };
    }
  }

  async getEventById(eventId) {
    try {
      const result = await this.getAllEvents();
      if (!result.success) return result;

      const event = result.data.find(e => e.id === eventId);
      return {
        success: true,
        data: event || null
      };
    } catch (error) {
      return {
        success: false,
        error: 'Event not found'
      };
    }
  }

  async getEventsByDate(date) {
    try {
      const result = await this.getAllEvents();
      if (!result.success) return result;

      const dateEvents = result.data.filter(event => event.date === date);
      return {
        success: true,
        data: dateEvents
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve events for date',
        data: []
      };
    }
  }

  async getEventsByDateRange(startDate, endDate) {
    try {
      const result = await this.getAllEvents();
      if (!result.success) return result;

      const start = new Date(startDate);
      const end = new Date(endDate);

      const rangeEvents = result.data.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      });

      return {
        success: true,
        data: rangeEvents
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve events for date range',
        data: []
      };
    }
  }

  async createEvent(eventData) {
    try {
      // Validate required fields
      if (!eventData.title?.trim()) {
        throw new Error('Event title is required');
      }
      if (!eventData.date) {
        throw new Error('Event date is required');
      }
      if (!eventData.time) {
        throw new Error('Event time is required');
      }

      const result = await this.getAllEvents();
      const events = result.success ? result.data : [];

      const newEvent = {
        id: Date.now().toString(),
        title: eventData.title.trim(),
        description: eventData.description?.trim() || '',
        date: eventData.date,
        time: eventData.time,
        endTime: eventData.endTime || null,
        location: eventData.location?.trim() || '',
        category: eventData.category || 'other',
        reminder: eventData.reminder || null,
        isRecurring: eventData.isRecurring || false,
        recurringPattern: eventData.recurringPattern || null,
        attendees: eventData.attendees || [],
        priority: eventData.priority || 'medium',
        color: eventData.color || '#6B7280',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: eventData.userId
      };

      events.push(newEvent);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(events));

      // Schedule reminder if specified
      if (newEvent.reminder) {
        await NotificationService.scheduleEventReminder(newEvent);
      }

      // Handle recurring events
      if (newEvent.isRecurring && newEvent.recurringPattern) {
        await this.createRecurringEvents(newEvent);
      }

      return {
        success: true,
        data: newEvent
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to create event'
      };
    }
  }

  async updateEvent(eventId, updates) {
    try {
      const result = await this.getAllEvents();
      if (!result.success) return result;

      const events = result.data;
      const eventIndex = events.findIndex(e => e.id === eventId);

      if (eventIndex === -1) {
        throw new Error('Event not found');
      }

      const existingEvent = events[eventIndex];
      const updatedEvent = {
        ...existingEvent,
        ...updates,
        id: eventId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      events[eventIndex] = updatedEvent;
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(events));

      // Update reminder if changed
      if (updates.reminder !== undefined || updates.date || updates.time) {
        await NotificationService.cancelEventReminder(eventId);
        if (updatedEvent.reminder) {
          await NotificationService.scheduleEventReminder(updatedEvent);
        }
      }

      return {
        success: true,
        data: updatedEvent
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update event'
      };
    }
  }

  async deleteEvent(eventId) {
    try {
      const result = await this.getAllEvents();
      if (!result.success) return result;

      const events = result.data;
      const eventIndex = events.findIndex(e => e.id === eventId);

      if (eventIndex === -1) {
        throw new Error('Event not found');
      }

      const deletedEvent = events[eventIndex];
      events.splice(eventIndex, 1);

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(events));

      // Cancel any scheduled reminders
      await NotificationService.cancelEventReminder(eventId);

      return {
        success: true,
        data: deletedEvent
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete event'
      };
    }
  }

  async createRecurringEvents(baseEvent) {
    try {
      const { recurringPattern } = baseEvent;
      if (!recurringPattern) return;

      const events = [];
      const startDate = new Date(baseEvent.date);
      const endDate = new Date(recurringPattern.endDate || new Date().setFullYear(new Date().getFullYear() + 1));
      
      let currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + this.getRecurrenceInterval(recurringPattern.frequency));

      while (currentDate <= endDate && events.length < 50) { // Limit to 50 occurrences
        const recurringEvent = {
          ...baseEvent,
          id: `${baseEvent.id}_${currentDate.toISOString().split('T')[0]}`,
          date: currentDate.toISOString().split('T')[0],
          isRecurring: false, // Individual occurrences are not recurring
          recurringParentId: baseEvent.id
        };

        events.push(recurringEvent);
        currentDate.setDate(currentDate.getDate() + this.getRecurrenceInterval(recurringPattern.frequency));
      }

      // Save all recurring events
      const allEventsResult = await this.getAllEvents();
      const allEvents = allEventsResult.success ? allEventsResult.data : [];
      allEvents.push(...events);

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(allEvents));

      return {
        success: true,
        data: events
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create recurring events'
      };
    }
  }

  getRecurrenceInterval(frequency) {
    switch (frequency) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'yearly': return 365;
      default: return 7;
    }
  }

  async searchEvents(query, filters = {}) {
    try {
      const result = await this.getAllEvents();
      if (!result.success) return result;

      let events = result.data;

      // Apply text search
      if (query?.trim()) {
        const searchTerm = query.toLowerCase();
        events = events.filter(event =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        events = events.filter(event => event.category === filters.category);
      }

      // Apply date range filter
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        events = events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= start && eventDate <= end;
        });
      }

      // Apply priority filter
      if (filters.priority) {
        events = events.filter(event => event.priority === filters.priority);
      }

      return {
        success: true,
        data: events
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search events',
        data: []
      };
    }
  }

  // Calendar settings
  async getSettings() {
    try {
      const settingsData = await AsyncStorage.getItem(this.settingsKey);
      const defaultSettings = {
        weekStartsOn: 1, // Monday
        showWeekNumbers: false,
        defaultReminder: true,
        defaultReminderTime: 15,
        timeFormat: '12h',
        firstDayOfWeek: 'monday'
      };

      const settings = settingsData ? { ...defaultSettings, ...JSON.parse(settingsData) } : defaultSettings;
      
      return {
        success: true,
        data: settings
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve calendar settings'
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

      await AsyncStorage.setItem(this.settingsKey, JSON.stringify(updatedSettings));

      return {
        success: true,
        data: updatedSettings
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update calendar settings'
      };
    }
  }

  // Utility methods
  async getUpcomingEvents(days = 7) {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      return await this.getEventsByDateRange(
        today.toISOString().split('T')[0],
        futureDate.toISOString().split('T')[0]
      );
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve upcoming events',
        data: []
      };
    }
  }

  async getTodaysEvents() {
    const today = new Date().toISOString().split('T')[0];
    return await this.getEventsByDate(today);
  }

  async getEventStatistics() {
    try {
      const result = await this.getAllEvents();
      if (!result.success) return result;

      const events = result.data;
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const statistics = {
        total: events.length,
        thisWeek: events.filter(event => new Date(event.date) >= oneWeekAgo).length,
        thisMonth: events.filter(event => new Date(event.date) >= oneMonthAgo).length,
        upcoming: events.filter(event => new Date(event.date) > now).length,
        byCategory: {},
        byPriority: {}
      };

      // Count by category
      events.forEach(event => {
        statistics.byCategory[event.category] = (statistics.byCategory[event.category] || 0) + 1;
        statistics.byPriority[event.priority] = (statistics.byPriority[event.priority] || 0) + 1;
      });

      return {
        success: true,
        data: statistics
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate statistics'
      };
    }
  }

  // Export/Import
  async exportEvents() {
    try {
      const eventsResult = await this.getAllEvents();
      const settingsResult = await this.getSettings();

      return {
        success: true,
        data: {
          events: eventsResult.data || [],
          settings: settingsResult.data || {},
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to export calendar data'
      };
    }
  }

  async importEvents(importData) {
    try {
      if (!importData.events || !Array.isArray(importData.events)) {
        throw new Error('Invalid import data format');
      }

      // Backup current data
      const backupResult = await this.exportEvents();
      if (backupResult.success) {
        await AsyncStorage.setItem(
          `@atm_app:calendar_backup_${Date.now()}`,
          JSON.stringify(backupResult.data)
        );
      }

      // Import events
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(importData.events));

      // Import settings if provided
      if (importData.settings) {
        await AsyncStorage.setItem(this.settingsKey, JSON.stringify(importData.settings));
      }

      return {
        success: true,
        data: {
          eventsImported: importData.events.length,
          settingsImported: !!importData.settings
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to import calendar data'
      };
    }
  }
}

export default new CalendarService();