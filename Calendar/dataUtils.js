class DataUtils {
    constructor() {
        this.storageKeys = {
            events: 'calendar-events',
            settings: 'calendar-settings',
            themes: 'calendar-themes'
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

    // Local Storage Utilities
    saveToStorage(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error(`Error saving to localStorage with key "${key}":`, error);
            return false;
        }
    }

    loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error loading from localStorage with key "${key}":`, error);
            return defaultValue;
        }
    }

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage with key "${key}":`, error);
            return false;
        }
    }

    clearStorage() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return {
            bytes: total,
            kb: (total / 1024).toFixed(2),
            mb: (total / (1024 * 1024)).toFixed(2)
        };
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

    // Data Export/Import
    exportData(data, filename, format = 'json') {
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

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Export failed:', error);
            return false;
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

    importData(file, format = 'json') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target.result;
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

                    resolve(data);
                } catch (error) {
                    reject(new Error(`Failed to parse ${format}: ${error.message}`));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
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
}