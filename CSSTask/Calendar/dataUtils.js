import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export default class DataUtils {
    constructor() {
        this.storageKeys = {
            events: '@calendar-events',
            settings: '@calendar-settings',
            themes: '@calendar-themes'
        };
    }

    // Date Utilities
    static formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Invalid date provided');
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        const formats = {
            'YYYY-MM-DD': `${year}-${month}-${day}`,
            'DD/MM/YYYY': `${day}/${month}/${year}`,
            'MM/DD/YYYY': `${month}/${day}/${year}`,
            'YYYY-MM-DD HH:mm': `${year}-${month}-${day} ${hours}:${minutes}`,
            'DD-MM-YYYY HH:mm:ss': `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`,
            'ISO': d.toISOString(),
            'timestamp': d.getTime()
        };

        return formats[format] || formats['YYYY-MM-DD'];
    }

    static parseDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error(`Cannot parse date: ${dateString}`);
        }
        return date;
    }

    static getDateKey(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    static subtractDays(date, days) {
        return this.addDays(date, -days);
    }

    static getDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    static getWeekStart(date, startOnMonday = false) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = startOnMonday ? (day === 0 ? -6 : 1 - day) : -day;
        d.setDate(d.getDate() + diff);
        return d;
    }

    static getWeekEnd(date, startOnMonday = false) {
        const weekStart = this.getWeekStart(date, startOnMonday);
        return this.addDays(weekStart, 6);
    }

    static getMonthStart(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }

    static getMonthEnd(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }

    static isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return today.toDateString() === checkDate.toDateString();
    }

    static isThisWeek(date) {
        const today = new Date();
        const checkDate = new Date(date);
        const weekStart = this.getWeekStart(today);
        const weekEnd = this.getWeekEnd(today);
        return checkDate >= weekStart && checkDate <= weekEnd;
    }

    static isThisMonth(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return today.getMonth() === checkDate.getMonth() && 
               today.getFullYear() === checkDate.getFullYear();
    }

    // Local Storage Utilities (React Native AsyncStorage)
    async saveToStorage(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            await AsyncStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error(`Error saving to AsyncStorage with key "${key}":`, error);
            return false;
        }
    }

    async loadFromStorage(key, defaultValue = null) {
        try {
            const item = await AsyncStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error loading from AsyncStorage with key "${key}":`, error);
            return defaultValue;
        }
    }

    async removeFromStorage(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from AsyncStorage with key "${key}":`, error);
            return false;
        }
    }

    async clearStorage() {
        try {
            const keys = Object.values(this.storageKeys);
            await AsyncStorage.multiRemove(keys);
            return true;
        } catch (error) {
            console.error('Error clearing AsyncStorage:', error);
            return false;
        }
    }

    async getStorageSize() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            let total = 0;
            
            for (const key of keys) {
                const value = await AsyncStorage.getItem(key);
                if (value) {
                    total += value.length + key.length;
                }
            }
            
            return {
                bytes: total,
                kb: (total / 1024).toFixed(2),
                mb: (total / (1024 * 1024)).toFixed(2)
            };
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return { bytes: 0, kb: '0', mb: '0' };
        }
    }

    // Data Validation
    static validateEvent(eventData) {
        const errors = [];

        if (!eventData.title || typeof eventData.title !== 'string' || eventData.title.trim().length === 0) {
            errors.push('Title is required and must be a non-empty string');
        }

        if (eventData.title && eventData.title.length > 100) {
            errors.push('Title must be 100 characters or less');
        }

        if (!eventData.date) {
            errors.push('Date is required');
        } else {
            try {
                const date = new Date(eventData.date);
                if (isNaN(date.getTime())) {
                    errors.push('Invalid date format');
                }
            } catch (e) {
                errors.push('Invalid date format');
            }
        }

        if (eventData.description && eventData.description.length > 500) {
            errors.push('Description must be 500 characters or less');
        }

        const validCategories = ['work', 'personal', 'health', 'education', 'default'];
        if (eventData.category && !validCategories.includes(eventData.category)) {
            errors.push(`Category must be one of: ${validCategories.join(', ')}`);
        }

        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (eventData.priority && !validPriorities.includes(eventData.priority)) {
            errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    static sanitizeString(str) {
        if (typeof str !== 'string') return '';
        return str.trim().replace(/[<>]/g, '');
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Data Export/Import (React Native mobile compatible)
    async exportData(data, filename, format = 'json') {
        try {
            let content, mimeType;

            switch (format.toLowerCase()) {
                case 'json':
                    content = JSON.stringify(data, null, 2);
                    mimeType = 'application/json';
                    break;
                case 'csv':
                    content = this.convertToCSV(data);
                    mimeType = 'text/csv';
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            // Create file in device storage
            const fileUri = `${FileSystem.documentDirectory}${filename}.${format}`;
            await FileSystem.writeAsStringAsync(fileUri, content);

            // Share the file (mobile-friendly export)
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: mimeType,
                    dialogTitle: `Export ${filename}`
                });
            }

            return { success: true, fileUri };
        } catch (error) {
            console.error('Export failed:', error);
            return { success: false, error: error.message };
        }
    }

    convertToCSV(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }

        const headers = Object.keys(data[0]);
        const csvData = [headers];

        data.forEach(item => {
            const row = headers.map(header => {
                const value = item[header];
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvData.push(row);
        });

        return csvData.map(row => row.join(',')).join('\n');
    }

    async importData(format = 'json') {
        try {
            // Use DocumentPicker for mobile file selection
            const result = await DocumentPicker.getDocumentAsync({
                type: format === 'json' ? 'application/json' : 'text/csv',
                copyToCacheDirectory: true
            });

            if (result.type === 'cancel') {
                return { success: false, cancelled: true };
            }

            // Read file content
            const content = await FileSystem.readAsStringAsync(result.uri);
            let data;

            switch (format.toLowerCase()) {
                case 'json':
                    data = JSON.parse(content);
                    break;
                case 'csv':
                    data = this.parseCSV(content);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            return { success: true, data };
        } catch (error) {
            return { 
                success: false, 
                error: `Failed to parse ${format}: ${error.message}` 
            };
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        const headers = this.parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = values[index];
                });
                data.push(item);
            }
        }

        return data;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    }

    // Utility Functions
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    // Advanced Date Utilities
    static getYearStart(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), 0, 1);
    }

    static getYearEnd(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), 11, 31);
    }

    static getQuarterStart(date) {
        const d = new Date(date);
        const quarter = Math.floor(d.getMonth() / 3);
        return new Date(d.getFullYear(), quarter * 3, 1);
    }

    static getQuarterEnd(date) {
        const d = new Date(date);
        const quarter = Math.floor(d.getMonth() / 3);
        return new Date(d.getFullYear(), quarter * 3 + 3, 0);
    }

    static getWeekNumber(date) {
        const d = new Date(date);
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekStart = this.getWeekStart(yearStart, true);
        const diffTime = d - weekStart;
        return Math.ceil(diffTime / (7 * 24 * 60 * 60 * 1000));
    }

    static getDaysInMonth(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    }

    static getBusinessDays(startDate, endDate) {
        let count = 0;
        let current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) { // Not Sunday or Saturday
                count++;
            }
            current = this.addDays(current, 1);
        }
        return count;
    }

    static isWeekend(date) {
        const day = new Date(date).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    }

    static isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    static getTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    static formatRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
        if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
        return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`;
    }

    // Event Processing and Analytics
    static groupEventsByDate(events) {
        const grouped = {};
        events.forEach(event => {
            const dateKey = this.getDateKey(event.date);
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(event);
        });
        return grouped;
    }

    static groupEventsByCategory(events) {
        const grouped = {};
        events.forEach(event => {
            const category = event.category || 'default';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(event);
        });
        return grouped;
    }

    static groupEventsByPriority(events) {
        const grouped = {};
        events.forEach(event => {
            const priority = event.priority || 'medium';
            if (!grouped[priority]) {
                grouped[priority] = [];
            }
            grouped[priority].push(event);
        });
        return grouped;
    }

    static getEventStatistics(events) {
        const total = events.length;
        const categories = this.groupEventsByCategory(events);
        const priorities = this.groupEventsByPriority(events);
        
        const completed = events.filter(e => e.isCompleted).length;
        const pending = total - completed;
        
        const today = new Date();
        const upcomingEvents = events.filter(e => new Date(e.date) >= today).length;
        const pastEvents = events.filter(e => new Date(e.date) < today).length;

        return {
            total,
            completed,
            pending,
            upcomingEvents,
            pastEvents,
            categories: Object.keys(categories).map(cat => ({
                name: cat,
                count: categories[cat].length,
                percentage: ((categories[cat].length / total) * 100).toFixed(1)
            })),
            priorities: Object.keys(priorities).map(pri => ({
                name: pri,
                count: priorities[pri].length,
                percentage: ((priorities[pri].length / total) * 100).toFixed(1)
            }))
        };
    }

    static findEventConflicts(events) {
        const conflicts = [];
        const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));

        for (let i = 0; i < sortedEvents.length - 1; i++) {
            for (let j = i + 1; j < sortedEvents.length; j++) {
                const event1 = sortedEvents[i];
                const event2 = sortedEvents[j];

                if (this.getDateKey(event1.date) === this.getDateKey(event2.date)) {
                    // Check for time conflicts if events have time
                    if (event1.time && event2.time) {
                        const time1 = this.parseTime(event1.time);
                        const time2 = this.parseTime(event2.time);
                        
                        if (Math.abs(time1 - time2) < 60) { // Within 1 hour
                            conflicts.push({
                                event1: event1,
                                event2: event2,
                                type: 'time_conflict'
                            });
                        }
                    } else {
                        conflicts.push({
                            event1: event1,
                            event2: event2,
                            type: 'date_conflict'
                        });
                    }
                }
            }
        }

        return conflicts;
    }

    static parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Search and Filter Utilities
    static searchEvents(events, query) {
        if (!query || query.trim() === '') return events;
        
        const searchTerm = query.toLowerCase().trim();
        return events.filter(event => 
            event.title.toLowerCase().includes(searchTerm) ||
            (event.description && event.description.toLowerCase().includes(searchTerm)) ||
            event.category.toLowerCase().includes(searchTerm) ||
            event.priority.toLowerCase().includes(searchTerm)
        );
    }

    static filterEventsByDateRange(events, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= start && eventDate <= end;
        });
    }

    static filterEventsByCategory(events, categories) {
        if (!Array.isArray(categories) || categories.length === 0) return events;
        return events.filter(event => categories.includes(event.category));
    }

    static filterEventsByPriority(events, priorities) {
        if (!Array.isArray(priorities) || priorities.length === 0) return events;
        return events.filter(event => priorities.includes(event.priority));
    }

    static sortEvents(events, sortBy = 'date', order = 'asc') {
        const sorted = [...events];
        
        sorted.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'date':
                    valueA = new Date(a.date);
                    valueB = new Date(b.date);
                    break;
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'category':
                    valueA = a.category.toLowerCase();
                    valueB = b.category.toLowerCase();
                    break;
                case 'priority':
                    const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                    valueA = priorityOrder[a.priority] || 0;
                    valueB = priorityOrder[b.priority] || 0;
                    break;
                case 'created':
                    valueA = new Date(a.createdAt);
                    valueB = new Date(b.createdAt);
                    break;
                default:
                    valueA = a[sortBy];
                    valueB = b[sortBy];
            }
            
            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        });
        
        return sorted;
    }

    // Backup and Sync Utilities (Mobile optimized)
    async exportToCloud(data, provider = 'local') {
        try {
            switch (provider) {
                case 'local':
                    return await this.exportData(data, `calendar-backup-${this.formatDate(new Date(), 'YYYY-MM-DD')}`);
                case 'google-drive':
                    // Could be extended with Google Drive API
                    throw new Error('Google Drive sync not implemented');
                case 'icloud':
                    // Could be extended with iCloud integration
                    throw new Error('iCloud sync not implemented');
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
        } catch (error) {
            console.error('Export to cloud failed:', error);
            return { success: false, error: error.message };
        }
    }

    async createBackup() {
        const backup = {
            events: await this.loadFromStorage(this.storageKeys.events, []),
            settings: await this.loadFromStorage(this.storageKeys.settings, {}),
            themes: await this.loadFromStorage(this.storageKeys.themes, {}),
            timestamp: new Date().toISOString(),
            version: '1.0',
            platform: 'react-native'
        };

        return await this.exportData(backup, `calendar-full-backup-${DataUtils.formatDate(new Date(), 'YYYY-MM-DD')}`);
    }

    async restoreBackup() {
        try {
            const importResult = await this.importData('json');
            
            if (!importResult.success) {
                return importResult;
            }

            const backupData = importResult.data;
            
            if (backupData.events) {
                await this.saveToStorage(this.storageKeys.events, backupData.events);
            }
            if (backupData.settings) {
                await this.saveToStorage(this.storageKeys.settings, backupData.settings);
            }
            if (backupData.themes) {
                await this.saveToStorage(this.storageKeys.themes, backupData.themes);
            }

            return {
                success: true,
                restored: {
                    events: backupData.events?.length || 0,
                    hasSettings: !!backupData.settings,
                    hasThemes: !!backupData.themes,
                    timestamp: backupData.timestamp,
                    platform: backupData.platform
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Theme and Settings Management (Async for React Native)
    async saveTheme(themeName, themeData) {
        const themes = await this.loadFromStorage(this.storageKeys.themes, {});
        themes[themeName] = {
            ...themeData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return await this.saveToStorage(this.storageKeys.themes, themes);
    }

    async loadTheme(themeName) {
        const themes = await this.loadFromStorage(this.storageKeys.themes, {});
        return themes[themeName] || null;
    }

    async getAllThemes() {
        return await this.loadFromStorage(this.storageKeys.themes, {});
    }

    async deleteTheme(themeName) {
        const themes = await this.loadFromStorage(this.storageKeys.themes, {});
        delete themes[themeName];
        return await this.saveToStorage(this.storageKeys.themes, themes);
    }

    async saveSettings(settings) {
        const currentSettings = await this.loadFromStorage(this.storageKeys.settings, {});
        const updatedSettings = {
            ...currentSettings,
            ...settings,
            updatedAt: new Date().toISOString()
        };
        return await this.saveToStorage(this.storageKeys.settings, updatedSettings);
    }

    async loadSettings() {
        return await this.loadFromStorage(this.storageKeys.settings, {
            defaultView: 'month',
            weekStartsOnMonday: true,
            showWeekNumbers: false,
            timeFormat: '24h',
            notifications: true,
            autoSave: true,
            theme: 'default',
            darkMode: false,
            fontSize: 'medium',
            language: 'en'
        });
    }

    // Validation and Error Handling
    static validateDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { isValid: false, error: 'Invalid date format' };
        }
        
        if (start > end) {
            return { isValid: false, error: 'Start date must be before end date' };
        }
        
        return { isValid: true };
    }

    static validateTimeFormat(time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Performance Utilities
    static memoize(fn) {
        const cache = new Map();
        return function(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }

    static createBatchProcessor(batchSize = 100) {
        return {
            process: async function(items, processor) {
                const results = [];
                for (let i = 0; i < items.length; i += batchSize) {
                    const batch = items.slice(i, i + batchSize);
                    const batchResults = await Promise.all(batch.map(processor));
                    results.push(...batchResults);
                }
                return results;
            }
        };
    }

    // Utility Constants
    static get CALENDAR_CONSTANTS() {
        return {
            DAYS_IN_WEEK: 7,
            MONTHS_IN_YEAR: 12,
            HOURS_IN_DAY: 24,
            MINUTES_IN_HOUR: 60,
            SECONDS_IN_MINUTE: 60,
            MS_IN_SECOND: 1000,
            MS_IN_MINUTE: 60 * 1000,
            MS_IN_HOUR: 60 * 60 * 1000,
            MS_IN_DAY: 24 * 60 * 60 * 1000,
            MS_IN_WEEK: 7 * 24 * 60 * 60 * 1000,
            
            WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            WEEKDAYS_SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            WEEKDAYS_MIN: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            
            MONTHS: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
            MONTHS_SHORT: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            
            CATEGORIES: ['work', 'personal', 'health', 'education', 'default'],
            PRIORITIES: ['low', 'medium', 'high', 'urgent'],
            
            DATE_FORMATS: [
                'YYYY-MM-DD',
                'DD/MM/YYYY',
                'MM/DD/YYYY',
                'YYYY-MM-DD HH:mm',
                'DD-MM-YYYY HH:mm:ss',
                'ISO',
                'timestamp'
            ]
        };
    }
}