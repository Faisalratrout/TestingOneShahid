class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.viewMode = 'month'; // month, week, day
        this.events = [];
        this.dataUtils = new DataUtils();
        this.eventFilter = new EventFilter();
        
        this.init();
    }

    init() {
        this.loadEvents();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Navigation buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('#prev-btn')) {
                this.navigatePrevious();
            } else if (e.target.matches('#next-btn')) {
                this.navigateNext();
            } else if (e.target.matches('#today-btn')) {
                this.goToToday();
            } else if (e.target.matches('#clear-events-btn')) {
                this.clearAllEvents();
            }
        });

        // View mode buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.view-btn')) {
                this.setViewMode(e.target.dataset.view);
            }
        });

        // Calendar cell clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.calendar-day')) {
                this.selectDate(e.target.dataset.date);
            }
        });
    }

    render() {
        const container = document.getElementById('calendar-container');
        if (!container) {
            console.error('Calendar container not found');
            return;
        }

        switch (this.viewMode) {
            case 'month':
                this.renderMonthView(container);
                break;
            case 'week':
                this.renderWeekView(container);
                break;
            case 'day':
                this.renderDayView(container);
                break;
        }

        this.updateHeader();
    }

    renderMonthView(container) {
        const monthStart = DataUtils.getMonthStart(this.currentDate);
        const monthEnd = DataUtils.getMonthEnd(this.currentDate);
        const calendarStart = DataUtils.getWeekStart(monthStart, true);
        const calendarEnd = DataUtils.getWeekEnd(monthEnd, true);

        let html = `
            <div class="calendar-header">
                <div class="calendar-nav">
                    <button id="prev-btn" class="nav-btn">&lt;</button>
                    <h2 class="current-month">${this.getMonthYearDisplay()}</h2>
                    <button id="next-btn" class="nav-btn">&gt;</button>
                </div>
                <div class="view-controls">
                    <button class="view-btn ${this.viewMode === 'month' ? 'active' : ''}" data-view="month">Month</button>
                    <button class="view-btn ${this.viewMode === 'week' ? 'active' : ''}" data-view="week">Week</button>
                    <button class="view-btn ${this.viewMode === 'day' ? 'active' : ''}" data-view="day">Day</button>
                </div>
            </div>
            <div class="calendar-grid">
                <div class="calendar-weekdays">
        `;

        // Weekday headers
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        weekdays.forEach(day => {
            html += `<div class="weekday">${day}</div>`;
        });

        html += '</div><div class="calendar-days">';

        // Calendar days
        let currentDay = new Date(calendarStart);
        while (currentDay <= calendarEnd) {
            const dateKey = DataUtils.getDateKey(currentDay);
            const dayEvents = this.getEventsForDate(currentDay);
            const isCurrentMonth = currentDay.getMonth() === this.currentDate.getMonth();
            const isToday = DataUtils.isToday(currentDay);
            const isSelected = DataUtils.getDateKey(currentDay) === DataUtils.getDateKey(this.selectedDate);

            html += `
                <div class="calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} 
                     ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                     data-date="${dateKey}">
                    <div class="day-number">${currentDay.getDate()}</div>
                    <div class="day-events">
            `;

            dayEvents.slice(0, 3).forEach(event => {
                html += `<div class="event-dot ${event.category}" title="${event.title}"></div>`;
            });

            if (dayEvents.length > 3) {
                html += `<div class="more-events">+${dayEvents.length - 3}</div>`;
            }

            html += '</div></div>';
            currentDay = DataUtils.addDays(currentDay, 1);
        }

        html += '</div></div>';
        container.innerHTML = html;
    }

    // Navigation methods
    navigatePrevious() {
        switch (this.viewMode) {
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                break;
            case 'week':
                this.currentDate = DataUtils.subtractDays(this.currentDate, 7);
                break;
            case 'day':
                this.currentDate = DataUtils.subtractDays(this.currentDate, 1);
                break;
        }
        this.render();
    }

    navigateNext() {
        switch (this.viewMode) {
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                break;
            case 'week':
                this.currentDate = DataUtils.addDays(this.currentDate, 7);
                break;
            case 'day':
                this.currentDate = DataUtils.addDays(this.currentDate, 1);
                break;
        }
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.render();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        this.render();
    }

    selectDate(dateString) {
        this.selectedDate = new Date(dateString);
        this.render();
    }

    // Event management
    addEvent(eventData) {
        const validation = DataUtils.validateEvent(eventData);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        const event = new Event(
            eventData.title,
            eventData.date,
            eventData.description,
            eventData.category,
            eventData.priority
        );

        this.events.push(event);
        this.saveEvents();
        this.render();
        return event;
    }

    getEventsForDate(date) {
        const dateKey = DataUtils.getDateKey(date);
        return this.events.filter(event => {
            const eventDateKey = DataUtils.getDateKey(event.date);
            return eventDateKey === dateKey;
        });
    }

    // Data persistence
    loadEvents() {
        const savedEvents = this.dataUtils.loadFromStorage(this.dataUtils.storageKeys.events, []);
        this.events = savedEvents.map(eventData => {
            const event = new Event(
                eventData.title,
                eventData.date,
                eventData.description,
                eventData.category,
                eventData.priority
            );
            Object.assign(event, eventData);
            return event;
        });
    }

    saveEvents() {
        this.dataUtils.saveToStorage(this.dataUtils.storageKeys.events, this.events);
    }

    getMonthYearDisplay() {
        const options = { year: 'numeric', month: 'long' };
        return this.currentDate.toLocaleDateString('en-US', options);
    }

    updateHeader() {
        const header = document.querySelector('.app-header h1');
        if (header) {
            header.textContent = `Calendar - ${this.getMonthYearDisplay()}`;
        }
    }
}
