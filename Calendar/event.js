class Event {
    constructor(title, date, description = '', category = 'default', priority = 'medium') {
        this.id = this.generateId();
        this.title = title.trim();
        this.date = date;
        this.description = description.trim();
        this.category = category;
        this.priority = priority;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isCompleted = false;
        this.reminders = [];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    updateTitle(newTitle) {
        if (!newTitle || !newTitle.trim()) {
            throw new Error('Event title cannot be empty');
        }
        this.title = newTitle.trim();
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
        event.isCompleted = data.isCompleted || false;
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
            errors.push('Valid date is required');
        }

        if (this.title && this.title.length > 100) {
            errors.push('Title must be 100 characters or less');
        }

        if (this.description && this.description.length > 500) {
            errors.push('Description must be 500 characters or less');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Event;
}