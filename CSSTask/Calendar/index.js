// Main application entry point
class CalendarApp {
    constructor() {
        this.calendar = null;
        this.eventManager = null;
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('Initializing Calendar Application...');
        
        try {
            // Initialize the main calendar
            this.calendar = new Calendar();
            
            // Setup additional event listeners
            this.setupGlobalEventListeners();
            
            // Setup event form if present
            this.setupEventForm();
            
            // Setup export/import functionality
            this.setupDataManagement();
            
            console.log('Calendar Application initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize Calendar Application:', error);
            this.showError('Failed to load the calendar application. Please refresh the page.');
        }
    }

    setupGlobalEventListeners() {
        // Handle event item clicks (edit/delete)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.edit-event')) {
                this.editEvent(e.target.dataset.eventId);
            } else if (e.target.matches('.delete-event')) {
                this.deleteEvent(e.target.dataset.eventId);
            } else if (e.target.matches('#add-event-btn')) {
                this.showEventForm();
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.showEventForm();
                        break;
                    case 't':
                        e.preventDefault();
                        this.calendar.goToToday();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.calendar.navigatePrevious();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.calendar.navigateNext();
                        break;
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', DataUtils.debounce(() => {
            this.calendar.render();
        }, 300));
    }

    setupEventForm() {
        const eventForm = document.getElementById('event-form');
        if (!eventForm) {
            this.createEventForm();
            return;
        }

        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEventSubmission(e.target);
        });

        // Setup form validation
        const requiredFields = eventForm.querySelectorAll('input[required], select[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });
    }

    createEventForm() {
        const formContainer = document.getElementById('event-form-container');
        if (!formContainer) return;

        const formHTML = `
            <form id="event-form" class="event-form">
                <h3>Add New Event</h3>
                <div class="form-group">
                    <label for="event-title">Title *</label>
                    <input type="text" id="event-title" name="title" required maxlength="100">
                    <div class="error-message"></div>
                </div>
                
                <div class="form-group">
                    <label for="event-date">Date *</label>
                    <input type="date" id="event-date" name="date" required>
                    <div class="error-message"></div>
                </div>
                
                <div class="form-group">
                    <label for="event-time">Time</label>
                    <input type="time" id="event-time" name="time">
                </div>
                
                <div class="form-group">
                    <label for="event-description">Description</label>
                    <textarea id="event-description" name="description" maxlength="500" rows="3"></textarea>
                    <div class="char-count">0/500</div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="event-category">Category</label>
                        <select id="event-category" name="category">
                            <option value="default">Default</option>
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                            <option value="health">Health</option>
                            <option value="education">Education</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-priority">Priority</label>
                        <select id="event-priority" name="priority">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Event</button>
                    <button type="button" class="btn btn-secondary" id="cancel-event">Cancel</button>
                </div>
                
                <input type="hidden" name="eventId">
            </form>
        `;

        formContainer.innerHTML = formHTML;
        this.setupEventForm();
    }

    setupDataManagement() {
        // Export functionality
        const exportBtn = document.getElementById('export-events');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportEvents());
        }

        // Import functionality
        const importBtn = document.getElementById('import-events');
        const importFile = document.getElementById('import-file');
        
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', (e) => this.importEvents(e.target.files[0]));
        }
    }

    // Event management methods
    showEventForm(eventData = null) {
        const form = document.getElementById('event-form');
        if (!form) return;

        if (eventData) {
            // Edit mode
            form.querySelector('[name="title"]').value = eventData.title;
            form.querySelector('[name="date"]').value = DataUtils.formatDate(eventData.date, 'YYYY-MM-DD');
            form.querySelector('[name="description"]').value = eventData.description || '';
            form.querySelector('[name="category"]').value = eventData.category || 'default';
            form.querySelector('[name="priority"]').value = eventData.priority || 'medium';
            form.querySelector('[name="eventId"]').value = eventData.id;
            form.querySelector('h3').textContent = 'Edit Event';
        } else {
            // Add mode
            form.reset();
            form.querySelector('[name="eventId"]').value = '';
            form.querySelector('h3').textContent = 'Add New Event';
            
            // Set default date to selected date
            const selectedDate = this.calendar.selectedDate;
            form.querySelector('[name="date"]').value = DataUtils.formatDate(selectedDate, 'YYYY-MM-DD');
        }

        // Show the form (if it's hidden)
        const formContainer = document.getElementById('event-form-container');
        if (formContainer) {
            formContainer.style.display = 'block';
            formContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    editEvent(eventId) {
        const event = this.calendar.events.find(e => e.id === eventId);
        if (event) {
            this.showEventForm(event);
        }
    }

    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                this.calendar.deleteEvent(eventId);
                this.showSuccess('Event deleted successfully!');
            } catch (error) {
                this.showError('Failed to delete event: ' + error.message);
            }
        }
    }

    handleEventSubmission(form) {
        if (!this.validateForm(form)) {
            return;
        }

        const formData = new FormData(form);
        const eventData = {
            title: formData.get('title').trim(),
            date: formData.get('date'),
            time: formData.get('time'),
            description: formData.get('description').trim(),
            category: formData.get('category'),
            priority: formData.get('priority')
        };

        try {
            const eventId = formData.get('eventId');
            if (eventId) {
                this.calendar.updateEvent(eventId, eventData);
                this.showSuccess('Event updated successfully!');
            } else {
                this.calendar.addEvent(eventData);
                this.showSuccess('Event added successfully!');
            }
            
            form.reset();
            this.hideEventForm();
        } catch (error) {
            this.showError('Error saving event: ' + error.message);
        }
    }

    hideEventForm() {
        const formContainer = document.getElementById('event-form-container');
        if (formContainer) {
            formContainer.style.display = 'none';
        }
    }

    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Check required fields
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

    
        // Specific validations
        if (field.name === 'title' && value.length > 100) {
            isValid = false;
            errorMessage = 'Title must be 100 characters or less';
        }

        if (field.name === 'description' && value.length > 500) {
            isValid = false;
            errorMessage = 'Description must be 500 characters or less';
        }

        if (field.type === 'date' && value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                isValid = false;
                errorMessage = 'Please enter a valid date';
            }
        }

        // Show/hide error message
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = isValid ? 'none' : 'block';
        }

        // Add/remove error class
        field.classList.toggle('error', !isValid);

        return isValid;
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        field.classList.remove('error');
    }

    // Data management
    exportEvents() {
        try {
            this.calendar.exportEvents('json');
            this.showSuccess('Events exported successfully!');
        } catch (error) {
            this.showError('Failed to export events: ' + error.message);
        }
    }

    async importEvents(file) {
        if (!file) return;

        try {

            const result = await this.calendar.importEvents(file, 'json');
            if (result.success) {
                this.showSuccess(`Successfully imported ${result.imported} events!`);
            } else {
                this.showError('Import failed: ' + result.error);
            }
        } catch (error) {
            this.showError('Failed to import events: ' + error.message);
        }
    }

    // UI feedback methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }


    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add to page 
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Allow manual dismissal
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
}

// Initialize the application when the script loads
const app = new CalendarApp();

// Make it available globally for debugging
window.CalendarApp = app;
