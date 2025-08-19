import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const useCalendar = () => {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    calendarSettings,
    updateCalendarSettings,
  } = useData();

  const { user } = useAuth();
  const { scheduleEventReminder, cancelEventReminder, sendEventAlert } = useNotifications();

  // Calendar State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Event categories with colors
  const eventCategories = {
    work: { label: 'Work', color: '#3B82F6', icon: 'briefcase-outline' },
    personal: { label: 'Personal', color: '#10B981', icon: 'person-outline' },
    health: { label: 'Health', color: '#F59E0B', icon: 'fitness-outline' },
    finance: { label: 'Finance', color: '#EF4444', icon: 'card-outline' },
    social: { label: 'Social', color: '#8B5CF6', icon: 'people-outline' },
    travel: { label: 'Travel', color: '#06B6D4', icon: 'airplane-outline' },
    education: { label: 'Education', color: '#84CC16', icon: 'school-outline' },
    other: { label: 'Other', color: '#6B7280', icon: 'ellipse-outline' },
  };

  // Calendar utilities
  const getDaysInMonth = useCallback((date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const weekStartsOn = calendarSettings.weekStartsOn || 1; // 0 = Sunday, 1 = Monday
    return weekStartsOn === 0 ? firstDay : (firstDay === 0 ? 6 : firstDay - 1);
  }, [calendarSettings.weekStartsOn]);

  const formatDateString = useCallback((date) => {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }, []);

  const parseDate = useCallback((dateString) => {
    return new Date(dateString + 'T00:00:00');
  }, []);

  const isToday = useCallback((dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }, []);

  const isSameMonth = useCallback((dateString, monthDate) => {
    const date = parseDate(dateString);
    return date.getMonth() === monthDate.getMonth() && 
           date.getFullYear() === monthDate.getFullYear();
  }, [parseDate]);

  const getWeekDates = useCallback((date) => {
    const weekStartsOn = calendarSettings.weekStartsOn || 1;
    const startOfWeek = new Date(date);
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek - weekStartsOn;
    startOfWeek.setDate(date.getDate() - (diff < 0 ? diff + 7 : diff));

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(formatDateString(currentDate));
    }
    return weekDates;
  }, [calendarSettings.weekStartsOn, formatDateString]);

  // Event management
  const getEventsForDate = useCallback((dateString) => {
    return events.filter(event => event.date === dateString);
  }, [events]);

  const getEventsForMonth = useCallback((monthDate) => {
    return events.filter(event => isSameMonth(event.date, monthDate));
  }, [events, isSameMonth]);

  const getEventsForWeek = useCallback((weekDates) => {
    return events.filter(event => weekDates.includes(event.date));
  }, [events]);

  const searchEvents = useCallback((query, categoryFilter = 'all') => {
    let filteredEvents = events;

    if (categoryFilter !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.category === categoryFilter);
    }

    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.location?.toLowerCase().includes(searchTerm)
      );
    }

    return filteredEvents.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateA - dateB;
    });
  }, [events]);

  const createEvent = useCallback(async (eventData) => {
    setIsLoading(true);

    try {
      // Validate event data
      if (!eventData.title?.trim()) {
        throw new Error('Event title is required');
      }

      if (!eventData.date) {
        throw new Error('Event date is required');
      }

      if (!eventData.time) {
        throw new Error('Event time is required');
      }

      // Create new event
      const newEvent = {
        id: Date.now().toString(),
        userId: user?.id,
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
        color: eventCategories[eventData.category]?.color || eventCategories.other.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await addEvent(newEvent);

      if (result.success) {
        // Schedule reminder if specified
        if (newEvent.reminder && calendarSettings.defaultReminder) {
          await scheduleEventReminder(newEvent);
        }

        // Send event creation alert
        sendEventAlert({
          title: 'Event Created',
          message: `"${newEvent.title}" has been scheduled for ${formatEventDateTime(newEvent)}`,
          event: newEvent,
        });

        return {
          success: true,
          event: newEvent,
          message: 'Event created successfully',
        };
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setIsLoading(false);
    }
  }, [user, addEvent, scheduleEventReminder, sendEventAlert, calendarSettings]);

  const updateEventData = useCallback(async (eventId, updates) => {
    setIsLoading(true);

    try {
      const existingEvent = events.find(e => e.id === eventId);
      if (!existingEvent) {
        throw new Error('Event not found');
      }

      // Validate updates
      if (updates.title !== undefined && !updates.title?.trim()) {
        throw new Error('Event title is required');
      }

      const updatedEvent = {
        ...existingEvent,
        ...updates,
        title: updates.title?.trim() || existingEvent.title,
        description: updates.description?.trim() || existingEvent.description,
        location: updates.location?.trim() || existingEvent.location,
        color: updates.category ? 
          eventCategories[updates.category]?.color || eventCategories.other.color :
          existingEvent.color,
        updatedAt: new Date().toISOString(),
      };

      const result = await updateEvent(eventId, updatedEvent);

      if (result.success) {
        // Update reminder if changed
        if (updates.reminder !== undefined || updates.date || updates.time) {
          await cancelEventReminder(eventId);
          if (updatedEvent.reminder && calendarSettings.defaultReminder) {
            await scheduleEventReminder(updatedEvent);
          }
        }

        // Send update alert
        sendEventAlert({
          title: 'Event Updated',
          message: `"${updatedEvent.title}" has been updated`,
          event: updatedEvent,
        });

        return {
          success: true,
          event: updatedEvent,
          message: 'Event updated successfully',
        };
      } else {
        throw new Error(result.error || 'Failed to update event');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setIsLoading(false);
    }
  }, [events, updateEvent, cancelEventReminder, scheduleEventReminder, sendEventAlert, calendarSettings]);

  const removeEvent = useCallback(async (eventId) => {
    setIsLoading(true);

    try {
      const eventToDelete = events.find(e => e.id === eventId);
      if (!eventToDelete) {
        throw new Error('Event not found');
      }

      const result = await deleteEvent(eventId);

      if (result.success) {
        // Cancel any scheduled reminders
        await cancelEventReminder(eventId);

        // Send deletion alert
        sendEventAlert({
          title: 'Event Deleted',
          message: `"${eventToDelete.title}" has been deleted`,
          event: eventToDelete,
        });

        return {
          success: true,
          message: 'Event deleted successfully',
        };
      } else {
        throw new Error(result.error || 'Failed to delete event');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setIsLoading(false);
    }
  }, [events, deleteEvent, cancelEventReminder, sendEventAlert]);

  // Calendar navigation
  const navigateToDate = useCallback((dateString) => {
    setSelectedDate(dateString);
    setCurrentMonth(parseDate(dateString));
  }, [parseDate]);

  const navigateToToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    navigateToDate(today);
  }, [navigateToDate]);

  const navigateToPreviousMonth = useCallback(() => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  }, [currentMonth]);

  const navigateToNextMonth = useCallback(() => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  }, [currentMonth]);

  const navigateToPreviousWeek = useCallback(() => {
    const selectedDateObj = parseDate(selectedDate);
    const prevWeek = new Date(selectedDateObj);
    prevWeek.setDate(prevWeek.getDate() - 7);
    const newDateString = formatDateString(prevWeek);
    setSelectedDate(newDateString);
    setCurrentMonth(prevWeek);
  }, [selectedDate, parseDate, formatDateString]);

  const navigateToNextWeek = useCallback(() => {
    const selectedDateObj = parseDate(selectedDate);
    const nextWeek = new Date(selectedDateObj);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const newDateString = formatDateString(nextWeek);
    setSelectedDate(newDateString);
    setCurrentMonth(nextWeek);
  }, [selectedDate, parseDate, formatDateString]);

  // Utility functions
  const formatEventDateTime = useCallback((event) => {
    const date = parseDate(event.date);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const time = event.time;
    const [hours, minutes] = time.split(':');
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours), parseInt(minutes));
    const timeStr = timeObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${dateStr} at ${timeStr}`;
  }, [parseDate]);

  const getEventsByCategory = useCallback(() => {
    const categorizedEvents = {};
    Object.keys(eventCategories).forEach(category => {
      categorizedEvents[category] = events.filter(event => event.category === category);
    });
    return categorizedEvents;
  }, [events]);

  const getUpcomingEvents = useCallback((days = 7) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return events
      .filter(event => {
        const eventDate = parseDate(event.date);
        return eventDate >= today && eventDate <= futureDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
      });
  }, [events, parseDate]);

  // Memoized computed values
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const monthEvents = getEventsForMonth(currentMonth);

    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateString = formatDateString(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day));
      days.push({
        day,
        dateString,
        isCurrentMonth: false,
        isToday: isToday(dateString),
        events: getEventsForDate(dateString),
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateString(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
      days.push({
        day,
        dateString,
        isCurrentMonth: true,
        isToday: isToday(dateString),
        events: getEventsForDate(dateString),
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    for (let day = 1; day <= remainingDays; day++) {
      const dateString = formatDateString(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day));
      days.push({
        day,
        dateString,
        isCurrentMonth: false,
        isToday: isToday(dateString),
        events: getEventsForDate(dateString),
      });
    }

    return { days, monthEvents };
  }, [currentMonth, getDaysInMonth, getFirstDayOfMonth, getEventsForMonth, getEventsForDate, formatDateString, isToday]);

  return {
    // State
    selectedDate,
    currentMonth,
    viewMode,
    isLoading,
    searchQuery,
    selectedCategory,

    // Calendar data
    calendarData,
    eventCategories,

    // Event operations
    createEvent,
    updateEventData,
    removeEvent,
    getEventsForDate,
    getEventsForMonth,
    getEventsForWeek,
    searchEvents,
    getEventsByCategory,
    getUpcomingEvents,

    // Navigation
    navigateToDate,
    navigateToToday,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToPreviousWeek,
    navigateToNextWeek,

    // Utilities
    formatEventDateTime,
    getWeekDates,
    isToday,
    isSameMonth,
    parseDate,
    formatDateString,

    // Setters
    setSelectedDate,
    setCurrentMonth,
    setViewMode,
    setSearchQuery,
    setSelectedCategory,

    // Settings
    calendarSettings,
    updateCalendarSettings,
  };
};

export default useCalendar;