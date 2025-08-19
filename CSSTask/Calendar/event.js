import DataUtils from './dataUtils';
import { Alert, Platform } from 'react-native';

export default class Event {
    constructor(title, date, description = '', category = 'default', priority = 'medium', endDate = null) {
        this.id = this.generateId();
        this.title = title.trim();
        this.date = date; // Start date
        this.endDate = endDate; // End date for multi-day events
        this.description = description.trim();
        this.category = category;
        this.priority = priority;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isCompleted = false;
        this.reminders = [];
        this.location = '';
        this.attendees = [];
        this.isAllDay = true;
        this.startTime = null;
        this.endTime = null;
        this.recurrence = null; // For recurring events
        this.color = this.getCategoryColor(category);
        this.attachments = [];
        this.tags = [];
        this.isPrivate = false;
        this.timezone = this.getDeviceTimezone();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getDeviceTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (error) {
            return 'UTC';
        }
    }

    getCategoryColor(category) {
        const categoryColors = {
            work: '#3b82f6',
            personal: '#10b981',
            health: '#ef4444',
            education: '#f59e0b',
            family: '#8b5cf6',
            travel: '#06b6d4',
            finance: '#84cc16',
            fitness: '#f97316',
            default: '#6b7280'
        };
        return categoryColors[category] || categoryColors.default;
    }

    updateTitle(newTitle) {
        if (!newTitle || !newTitle.trim()) {
            throw new Error('Event title cannot be empty');
        }
        this.title = newTitle.trim();
        this.color = this.getCategoryColor(this.category);
        this.updatedAt = new Date();
        return this;
    }

    updateDescription(newDescription) {
        this.description = newDescription.trim();
        this.updatedAt = new Date();
        return this;
    }

    updateDate(newDate) {
        if (!newDate || isNaN(new Date(newDate))) {
            throw new Error('Invalid date provided');
        }
        this.date = newDate;
        this.updatedAt = new Date();
        return this;
    }

    updateEndDate(newEndDate) {
        if (newEndDate && isNaN(new Date(newEndDate))) {
            throw new Error('Invalid end date provided');
        }
        if (newEndDate && new Date(newEndDate) < new Date(this.date)) {
            throw new Error('End date cannot be before start date');
        }
        this.endDate = newEndDate;
        this.updatedAt = new Date();
        return this;
    }

    setDateRange(startDate, endDate) {
        if (!startDate || isNaN(new Date(startDate))) {
            throw new Error('Invalid start date provided');
        }
        if (endDate && isNaN(new Date(endDate))) {
            throw new Error('Invalid end date provided');
        }
        if (endDate && new Date(endDate) < new Date(startDate)) {
            throw new Error('End date cannot be before start date');
        }
        
        this.date = startDate;
        this.endDate = endDate;
        this.updatedAt = new Date();
        return this;
    }

    updateCategory(newCategory) {
        const validCategories = ['work', 'personal', 'health', 'education', 'default'];
        if (!validCategories.includes(newCategory)) {
            throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }
        this.category = newCategory;
        this.updatedAt = new Date();
        return this;
    }

    updatePriority(newPriority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(newPriority)) {
            throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
        }
        this.priority = newPriority;
        this.updatedAt = new Date();
        return this;
    }

    toggleCompletion() {
        this.isCompleted = !this.isCompleted;
        this.updatedAt = new Date();
        return this;
    }

    addReminder(reminderDate, message = '') {
        if (new Date(reminderDate) <= new Date()) {
            throw new Error('Reminder date must be in the future');
        }

        const reminder = {
            id: this.generateId(),
            date: reminderDate,
            message: message || `Reminder: ${this.title}`,
            isTriggered: false
        };

        this.reminders.push(reminder);
        this.updatedAt = new Date();
        return reminder;
    }

    removeReminder(reminderId) {
        const index = this.reminders.findIndex(r => r.id === reminderId);
        if (index === -1) {
            throw new Error('Reminder not found');
        }
        
        const removed = this.reminders.splice(index, 1)[0];
        this.updatedAt = new Date();
        return removed;
    }

    getDaysUntil() {
        const eventDate = new Date(this.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        
        const diffTime = eventDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDurationInDays() {
        if (!this.endDate) {
            return 1; // Single day event
        }
        
        const startDate = new Date(this.date);
        const endDate = new Date(this.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        const diffTime = endDate - startDate;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    }

    isMultiDay() {
        return this.endDate && new Date(this.date).toDateString() !== new Date(this.endDate).toDateString();
    }

    isToday() {
        const eventDate = new Date(this.date);
        const today = new Date();
        
        return eventDate.getDate() === today.getDate() &&
               eventDate.getMonth() === today.getMonth() &&
               eventDate.getFullYear() === today.getFullYear();
    }

    isThisWeek() {
        const eventDate = new Date(this.date);
        const today = new Date();
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return eventDate >= weekStart && eventDate <= weekEnd;
    }

    isThisMonth() {
        const eventDate = new Date(this.date);
        const today = new Date();
        
        return eventDate.getMonth() === today.getMonth() &&
               eventDate.getFullYear() === today.getFullYear();
    }

    isPast() {
        return new Date(this.date) < new Date();
    }

    isFuture() {
        return new Date(this.date) > new Date();
    }

    getFormattedDate(format = 'short') {
        const eventDate = new Date(this.date);
        
        if (this.isMultiDay()) {
            const endDate = new Date(this.endDate);
            
            switch (format) {
                case 'short':
                    return `${eventDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
                case 'long':
                    return `${eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })} - ${endDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}`;
                case 'time':
                    return eventDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                case 'datetime':
                    return `${eventDate.toLocaleString()} - ${endDate.toLocaleString()}`;
                default:
                    return `${eventDate.toISOString()} - ${endDate.toISOString()}`;
            }
        }
        
        switch (format) {
            case 'short':
                return eventDate.toLocaleDateString();
            case 'long':
                return eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'time':
                return eventDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'datetime':
                return eventDate.toLocaleString();
            default:
                return eventDate.toISOString();
        }
    }

    getPriorityColor() {
        const colors = {
            low: '#95a5a6',
            medium: '#f39c12',
            high: '#e67e22',
            urgent: '#e74c3c'
        };
        return colors[this.priority] || colors.medium;
    }

    getCategoryColor() {
        const colors = {
            work: '#3498db',
            personal: '#9b59b6',
            health: '#e74c3c',
            education: '#f39c12',
            default: '#95a5a6'
        };
        return colors[this.category] || colors.default;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            date: this.date,
            description: this.description,
            category: this.category,
            priority: this.priority,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            isCompleted: this.isCompleted,
            reminders: this.reminders
        };
    }
    

    static fromJSON(data) {
        const event = new Event(data.title, data.date, data.description, data.category, data.priority);
        event.id = data.id;
        event.createdAt = new Date(data.createdAt);
        event.updatedAt = new Date(data.updatedAt);
        event.isCompleted = data.isCompleted  || false;
        event.reminders = data.reminders || [];
        return event;
    }

    clone() {
        return Event.fromJSON(this.toJSON());
    }

    validate() {
        const errors = [];

        if (!this.title || this.title.trim().length === 0) {
            errors.push('Title is required');
        }

        if (!this.date || isNaN(new Date(this.date))) {
            errors.push('Valid start date is required');
        }

        if (this.endDate && isNaN(new Date(this.endDate))) {
            errors.push('Valid end date is required');
        }

        if (this.endDate && new Date(this.endDate) < new Date(this.date)) {
            errors.push('End date cannot be before start date');
        }

        if (this.title && this.title.length > 100) {
            errors.push('Title must be 100 characters or less');
        }

        if (this.description && this.description.length > 500) {
            errors.push('Description must be 500 characters or less');
        }

        if (this.location && this.location.length > 200) {
            errors.push('Location must be 200 characters or less');
        }

        if (this.attendees && this.attendees.length > 100) {
            errors.push('Too many attendees (max 100)');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Mobile-specific methods
    setLocation(location, coordinates = null) {
        this.location = location.trim();
        if (coordinates) {
            this.coordinates = {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            };
        }
        this.updatedAt = new Date();
        return this;
    }

    addAttendee(email, name = '', status = 'pending') {
        if (!email || !this.validateEmail(email)) {
            throw new Error('Valid email is required for attendee');
        }

        const attendee = {
            id: this.generateId(),
            email: email.toLowerCase(),
            name: name.trim(),
            status: status, // pending, accepted, declined
            addedAt: new Date()
        };

        // Check if attendee already exists
        const existingIndex = this.attendees.findIndex(a => a.email === email.toLowerCase());
        if (existingIndex !== -1) {
            this.attendees[existingIndex] = attendee;
        } else {
            this.attendees.push(attendee);
        }

        this.updatedAt = new Date();
        return attendee;
    }

    removeAttendee(email) {
        const index = this.attendees.findIndex(a => a.email === email.toLowerCase());
        if (index === -1) {
            throw new Error('Attendee not found');
        }

        const removed = this.attendees.splice(index, 1)[0];
        this.updatedAt = new Date();
        return removed;
    }

    addTag(tag) {
        const normalizedTag = tag.toLowerCase().trim();
        if (!this.tags.includes(normalizedTag)) {
            this.tags.push(normalizedTag);
            this.updatedAt = new Date();
        }
        return this;
    }

    removeTag(tag) {
        const normalizedTag = tag.toLowerCase().trim();
        const index = this.tags.indexOf(normalizedTag);
        if (index !== -1) {
            this.tags.splice(index, 1);
            this.updatedAt = new Date();
        }
        return this;
    }

    setTimeRange(startTime, endTime) {
        if (startTime && endTime && new Date(`2025-01-01 ${startTime}`) >= new Date(`2025-01-01 ${endTime}`)) {
            throw new Error('Start time must be before end time');
        }

        this.startTime = startTime;
        this.endTime = endTime;
        this.isAllDay = !startTime && !endTime;
        this.updatedAt = new Date();
        return this;
    }

    setRecurrence(pattern) {
        const validTypes = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
        
        if (pattern && !validTypes.includes(pattern.type)) {
            throw new Error(`Invalid recurrence type. Must be one of: ${validTypes.join(', ')}`);
        }

        this.recurrence = pattern;
        this.updatedAt = new Date();
        return this;
    }

    getDuration() {
        if (!this.startTime || !this.endTime) {
            return null;
        }

        const start = new Date(`2025-01-01 ${this.startTime}`);
        const end = new Date(`2025-01-01 ${this.endTime}`);
        const diffMs = end - start;

        return {
            hours: Math.floor(diffMs / (1000 * 60 * 60)),
            minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
            totalMinutes: Math.floor(diffMs / (1000 * 60))
        };
    }

    // Mobile notification scheduling
    scheduleNotification() {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            // This would integrate with react-native push notifications
            return {
                eventId: this.id,
                title: this.title,
                body: this.description || `Event: ${this.title}`,
                date: new Date(this.date),
                data: {
                    eventId: this.id,
                    category: this.category,
                    priority: this.priority
                }
            };
        }
        return null;
    }

    // Share event data for mobile sharing
    getShareData() {
        const dateStr = this.getFormattedDate('long');
        const timeStr = this.startTime ? ` at ${this.startTime}` : '';
        const locationStr = this.location ? `\nLocation: ${this.location}` : '';
        
        return {
            title: `Calendar Event: ${this.title}`,
            message: `${this.title}\n${dateStr}${timeStr}${locationStr}\n\n${this.description}`,
            url: null // Could be a deep link to the event
        };
    }

    // Mobile-friendly date formatting
    getMobileDateFormat() {
        const eventDate = new Date(this.date);
        const now = new Date();
        const diffDays = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
        if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

        return eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: eventDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    // Conflict detection with other events
    conflictsWith(otherEvent) {
        if (!otherEvent || this.getDateKey() !== otherEvent.getDateKey()) {
            return false;
        }

        // If either event is all-day, check date only
        if (this.isAllDay || otherEvent.isAllDay) {
            return true;
        }

        // Check time overlap
        if (!this.startTime || !this.endTime || !otherEvent.startTime || !otherEvent.endTime) {
            return false;
        }

        const thisStart = new Date(`2025-01-01 ${this.startTime}`);
        const thisEnd = new Date(`2025-01-01 ${this.endTime}`);
        const otherStart = new Date(`2025-01-01 ${otherEvent.startTime}`);
        const otherEnd = new Date(`2025-01-01 ${otherEvent.endTime}`);

        return thisStart < otherEnd && thisEnd > otherStart;
    }

    getDateKey() {
        return DataUtils.getDateKey(this.date);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Enhanced toJSON for mobile storage
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            date: this.date,
            endDate: this.endDate,
            description: this.description,
            category: this.category,
            priority: this.priority,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            isCompleted: this.isCompleted,
            reminders: this.reminders,
            location: this.location,
            coordinates: this.coordinates,
            attendees: this.attendees,
            isAllDay: this.isAllDay,
            startTime: this.startTime,
            endTime: this.endTime,
            recurrence: this.recurrence,
            color: this.color,
            attachments: this.attachments,
            tags: this.tags,
            isPrivate: this.isPrivate,
            timezone: this.timezone
        };
    }

    static fromJSON(data) {
        const event = new Event(data.title, data.date, data.description, data.category, data.priority, data.endDate);
        
        // Restore all properties
        Object.keys(data).forEach(key => {
            if (key === 'createdAt' || key === 'updatedAt') {
                event[key] = new Date(data[key]);
            } else {
                event[key] = data[key];
            }
        });

        return event;
    }

    // Mobile analytics
    getEventMetrics() {
        return {
            daysFromCreation: Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24)),
            daysUntilEvent: this.getDaysUntil(),
            hasReminders: this.reminders.length > 0,
            hasAttendees: this.attendees.length > 0,
            hasLocation: !!this.location,
            isRecurring: !!this.recurrence,
            category: this.category,
            priority: this.priority,
            duration: this.getDuration()
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Event;
}