class EventFilter {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.activeFilters = {
            search: '',
            category: 'all',
            priority: 'all',
            status: 'all',
            dateRange: null,
            tags: []
        };
        this.sortOptions = {
            field: 'date',
            direction: 'asc'
        };
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateFilteredEvents();
    }

    attachEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-events');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.setSearchFilter(e.target.value);
            });
        }

        // Filter type select
        const filterSelect = document.getElementById('filter-type');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.setQuickFilter(e.target.value);
            });
        }

        // Subscribe to event manager changes
        this.eventManager.subscribe('eventAdded', () => this.updateFilteredEvents());
        this.eventManager.subscribe('eventRemoved', () => this.updateFilteredEvents());
        this.eventManager.subscribe('eventUpdated', () => this.updateFilteredEvents());
        this.eventManager.subscribe('allEventsCleared', () => this.updateFilteredEvents());
    }

    // Filter Methods
    setSearchFilter(query) {
        this.activeFilters.search = query.toLowerCase().trim();
        this.updateFilteredEvents();
    }

    setCategoryFilter(category) {
        this.activeFilters.category = category;
        this.updateFilteredEvents();
    }

    setPriorityFilter(priority) {
        this.activeFilters.priority = priority;
        this.updateFilteredEvents();
    }

    setStatusFilter(status) {
        this.activeFilters.status = status;
        this.updateFilteredEvents();
    }

    setDateRangeFilter(startDate, endDate) {
        if (!startDate && !endDate) {
            this.activeFilters.dateRange = null;
        } else {
            this.activeFilters.dateRange = {
                start: startDate ? new Date(startDate) : null,
                end: endDate ? new Date(endDate) : null
            };
        }
        this.updateFilteredEvents();
    }

    setQuickFilter(type) {
        // Reset other filters when using quick filters
        this.resetFilters();
        
        const today = new Date();
        
        switch (type) {
            case 'today':
                this.setDateRangeFilter(today, today);
                break;
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                this.setDateRangeFilter(weekStart, weekEnd);
                break;
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                this.setDateRangeFilter(monthStart, monthEnd);
                break;
            case 'upcoming':
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + 30);
                this.setDateRangeFilter(today, futureDate);
                break;
            case 'overdue':
                this.setStatusFilter('overdue');
                break;
            case 'completed':
                this.setStatusFilter('completed');
                break;
            case 'pending':
                this.setStatusFilter('pending');
                break;
            default:
                // 'all' or any other value resets filters
                break;
        }
    }

    addTagFilter(tag) {
        if (!this.activeFilters.tags.includes(tag)) {
            this.activeFilters.tags.push(tag);
            this.updateFilteredEvents();
        }
    }

    removeTagFilter(tag) {
        const index = this.activeFilters.tags.indexOf(tag);
        if (index !== -1) {
            this.activeFilters.tags.splice(index, 1);
            this.updateFilteredEvents();
        }
    }

    resetFilters() {
        this.activeFilters = {
            search: '',
            category: 'all',
            priority: 'all',
            status: 'all',
            dateRange: null,
            tags: []
        };
        
        // Reset UI elements
        const searchInput = document.getElementById('search-events');
        if (searchInput) searchInput.value = '';
        
        const filterSelect = document.getElementById('filter-type');
        if (filterSelect) filterSelect.value = 'all';
        
        this.updateFilteredEvents();
    }

    // Sorting Methods
    setSortOrder(field, direction = 'asc') {
        this.sortOptions.field = field;
        this.sortOptions.direction = direction;
        this.updateFilteredEvents();
    }

    toggleSortDirection() {
        this.sortOptions.direction = this.sortOptions.direction === 'asc' ? 'desc' : 'asc';
        this.updateFilteredEvents();
    }

    // Main Filtering Logic
    getFilteredEvents() {
        let events = this.eventManager.getAllEvents();

        // Apply search filter
        if (this.activeFilters.search) {
            events = events.filter(event => 
                event.title.toLowerCase().includes(this.activeFilters.search) ||
                event.description.toLowerCase().includes(this.activeFilters.search)
            );
        }

        // Apply category filter
        if (this.activeFilters.category !== 'all') {
            events = events.filter(event => event.category === this.activeFilters.category);
        }

        // Apply priority filter
        if (this.activeFilters.priority !== 'all') {
            events = events.filter(event => event.priority === this.activeFilters.priority);
        }

        // Apply status filter
        if (this.activeFilters.status !== 'all') {
            events = this.applyStatusFilter(events, this.activeFilters.status);
        }

        // Apply date range filter
        if (this.activeFilters.dateRange) {
            events = this.applyDateRangeFilter(events, this.activeFilters.dateRange);
        }

        // Apply tag filters
        if (this.activeFilters.tags.length > 0) {
            events = events.filter(event => 
                this.activeFilters.tags.some(tag => 
                    event.title.toLowerCase().includes(tag.toLowerCase()) ||
                    event.description.toLowerCase().includes(tag.toLowerCase())
                )
            );
        }

        // Apply sorting
        return this.sortEvents(events);
    }

    applyStatusFilter(events, status) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (status) {
            case 'completed':
                return events.filter(event => event.isCompleted);
            case 'pending':
                return events.filter(event => !event.isCompleted);
            case 'overdue':
                return events.filter(event => {
                    const eventDate = new Date(event.date);
                    eventDate.setHours(0, 0, 0, 0);
                    return !event.isCompleted && eventDate < today;
                });
            case 'upcoming':
                return events.filter(event => {
                    const eventDate = new Date(event.date);
                    eventDate.setHours(0, 0, 0, 0);
                    return eventDate >= today;
                });
            default:
                return events;
        }
    }

    applyDateRangeFilter(events, dateRange) {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);

            if (dateRange.start && dateRange.end) {
                const start = new Date(dateRange.start);
                start.setHours(0, 0, 0, 0);
                const end = new Date(dateRange.end);
                end.setHours(23, 59, 59, 999);
                return eventDate >= start && eventDate <= end;
            } else if (dateRange.start) {
                const start = new Date(dateRange.start);
                start.setHours(0, 0, 0, 0);
                return eventDate >= start;
            } else if (dateRange.end) {
                const end = new Date(dateRange.end);
                end.setHours(23, 59, 59, 999);
                return eventDate <= end;
            }
            return true;
        });
    }

    sortEvents(events) {
        const { field, direction } = this.sortOptions;
        
        return events.sort((a, b) => {
            let comparison = 0;

            switch (field) {
                case 'date':
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'priority':
                    const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                case 'category':
                    comparison = a.category.localeCompare(b.category);
                    break;
                case 'created':
                    comparison = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
                case 'updated':
                    comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
                    break;
                default:
                    comparison = 0;
            }

            return direction === 'desc' ? -comparison : comparison;
        });
    }

    updateFilteredEvents() {
        const filteredEvents = this.getFilteredEvents();
        this.renderUpcomingEvents(filteredEvents);
        
        // Notify subscribers about filter changes
        if (typeof CustomEvent !== 'undefined') {
            const event = new CustomEvent('eventsFiltered', {
                detail: { events: filteredEvents, filters: this.activeFilters }
            });
            document.dispatchEvent(event);
        }
    }

    renderUpcomingEvents(events) {
        const upcomingList = document.getElementById('upcoming-list');
        if (!upcomingList) return;

        if (events.length === 0) {
            upcomingList.innerHTML = '<div class="no-events">No events found</div>';
            return;
        }

        // Take only next 10 events for upcoming list
        const upcomingEvents = events
            .filter(event => new Date(event.date) >= new Date())
            .slice(0, 10);

        upcomingList.innerHTML = upcomingEvents.map(event => `
            <div class="event-item" data-event-id="${event.id}">
                <div class="event-date">${event.getFormattedDate('short')}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-meta">
                    <span class="event-category" style="color: ${event.getCategoryColor()}">${event.category}</span>
                    <span class="event-priority" style="color: ${event.getPriorityColor()}">${event.priority}</span>
                </div>
            </div>
        `).join('');
    }

    // Advanced Filter Methods
    createCustomFilter(filterFunction) {
        const events = this.eventManager.getAllEvents();
        return events.filter(filterFunction);
    }

    getEventsInNextDays(days) {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + days);
        
        return this.eventManager.getEventsForDateRange(today, futureDate);
    }

    getEventsByDayOfWeek(dayOfWeek) {
        // dayOfWeek: 0 = Sunday, 1 = Monday, etc.
        return this.eventManager.getAllEvents().filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDay() === dayOfWeek;
        });
    }

    getRecurringPatterns() {
        const events = this.eventManager.getAllEvents();
        const patterns = {};

        events.forEach(event => {
            const title = event.title.toLowerCase();
            if (!patterns[title]) {
                patterns[title] = [];
            }
            patterns[title].push(event);
        });

        // Return only patterns with multiple events
        return Object.entries(patterns)
            .filter(([title, events]) => events.length > 1)
            .reduce((acc, [title, events]) => {
                acc[title] = events;
                return acc;
            }, {});
    }

    // Export filtered results
    exportFilteredEvents(format = 'json') {
        const filteredEvents = this.getFilteredEvents();
        const data = filteredEvents.map(event => event.toJSON());
        
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.exportToCSV(data);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    exportToCSV(data) {
        const headers = ['Title', 'Date', 'Category', 'Priority', 'Status', 'Description'];
        const csvData = [headers];
        
        data.forEach(event => {
            csvData.push([
                event.title,
                event.date,
                event.category,
                event.priority,
                event.isCompleted ? 'Completed' : 'Pending',
                event.description
            ]);
        });
        
        return csvData.map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    // Get filter statistics
    getFilterStats() {
        const allEvents = this.eventManager.getAllEvents();
        const filteredEvents = this.getFilteredEvents();
        
        return {
            total: allEvents.length,
            filtered: filteredEvents.length,
            percentage: allEvents.length > 0 ? (filteredEvents.length / allEvents.length * 100).toFixed(1) : 0,
            activeFilters: this.getActiveFilterCount()
        };
    }

    getActiveFilterCount() {
        let count = 0;
        if (this.activeFilters.search) count++;
        if (this.activeFilters.category !== 'all') count++;
        if (this.activeFilters.priority !== 'all') count++;
        if (this.activeFilters.status !== 'all') count++;
        if (this.activeFilters.dateRange) count++;
        if (this.activeFilters.tags.length > 0) count++;
        return count;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventFilter;
}