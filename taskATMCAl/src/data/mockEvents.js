export const EVENT_CATEGORIES = {
  PERSONAL: 'personal',
  WORK: 'work',
  HEALTH: 'health',
  ATM: 'atm',
  FINANCE: 'finance',
  SHOPPING: 'shopping',
  TRAVEL: 'travel',
  EDUCATION: 'education'
};

export const EVENT_PRIORITIES = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  IN_PROGRESS: 'in_progress'
};

export const RECURRING_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

export const mockEvents = [
  // ATM Related Events
  {
    id: 'evt_001',
    title: 'Monthly ATM Withdrawal',
    description: 'Monthly cash withdrawal for expenses',
    date: '2024-12-20',
    time: '10:00',
    category: EVENT_CATEGORIES.ATM,
    priority: EVENT_PRIORITIES.MEDIUM,
    status: EVENT_STATUS.UPCOMING,
    recurring: RECURRING_TYPES.MONTHLY,
    location: 'Main Street ATM',
    amount: 500.00,
    accountId: 'acc_001',
    reminders: [
      { type: 'push', minutesBefore: 60 },
      { type: 'email', minutesBefore: 1440 }
    ],
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z'
  },
  {
    id: 'evt_002',
    title: 'Check ATM Balance',
    description: 'Check account balance before weekend',
    date: '2024-12-18',
    time: '15:30',
    category: EVENT_CATEGORIES.ATM,
    priority: EVENT_PRIORITIES.LOW,
    status: EVENT_STATUS.UPCOMING,
    recurring: RECURRING_TYPES.WEEKLY,
    location: 'Shopping Mall ATM',
    accountId: 'acc_001',
    reminders: [
      { type: 'push', minutesBefore: 30 }
    ],
    createdAt: '2024-12-01T09:15:00Z',
    updatedAt: '2024-12-01T09:15:00Z'
  },

  // Financial Events
  {
    id: 'evt_003',
    title: 'Transfer to Savings',
    description: 'Monthly automatic savings transfer',
    date: '2024-12-25',
    time: '09:00',
    category: EVENT_CATEGORIES.FINANCE,
    priority: EVENT_PRIORITIES.HIGH,
    status: EVENT_STATUS.UPCOMING,
    recurring: RECURRING_TYPES.MONTHLY,
    amount: 500.00,
    fromAccountId: 'acc_001',
    toAccountId: 'acc_002',
    reminders: [
      { type: 'push', minutesBefore: 60 },
      { type: 'email', minutesBefore: 720 }
    ],
    createdAt: '2024-11-25T10:00:00Z',
    updatedAt: '2024-12-01T11:20:00Z'
  },
  {
    id: 'evt_004',
    title: 'Credit Card Payment',
    description: 'Monthly credit card payment due',
    date: '2024-12-28',
    time: '12:00',
    category: EVENT_CATEGORIES.FINANCE,
    priority: EVENT_PRIORITIES.URGENT,
    status: EVENT_STATUS.UPCOMING,
    recurring: RECURRING_TYPES.MONTHLY,
    amount: 250.00,
    fromAccountId: 'acc_001',
    toAccountId: 'acc_003',
    reminders: [
      { type: 'push', minutesBefore: 1440 },
      { type: 'email', minutesBefore: 2880 }
    ],
    createdAt: '2024-11-28T10:00:00Z',
    updatedAt: '2024-12-01T14:45:00Z'
  },
  {
    id: 'evt_005',
    title: 'Budget Review',
    description: 'Monthly budget and expenses review',
    date: '2024-12-30',
    time: '19:00',
    category: EVENT_CATEGORIES.FINANCE,
    priority: EVENT_PRIORITIES.MEDIUM,
    status: EVENT_STATUS.UPCOMING,
    recurring: RECURRING_TYPES.MONTHLY,
    reminders: [
      { type: 'push', minutesBefore: 120 }
    ],
    createdAt: '2024-11-30T18:00:00Z',
    updatedAt: '2024-12-01T18:00:00Z'
  },

  // Work Events
  {
    id: 'evt_006',
    title: 'Team Meeting',
    description: 'Weekly team standup meeting',
    date: '2024-12-19',
    time: '14:00',
    category: EVENT_CATEGORIES.WORK,
    priority: EVENT_PRIORITIES.HIGH,
    status: EVENT_STATUS.UPCOMING,
    recurring: RECURRING_TYPES.WEEKLY,
    location: 'Conference Room A',
    reminders: [
      { type: 'push', minutesBefore: 15 }
    ],
    createdAt: '2024-12-01T13:00:00Z',
    updatedAt: '2024-12-15T13:30:00Z'
  },
  {
    id: 'evt_007',
    title: 'Salary Deposit',
    description: 'Monthly salary direct deposit',
    date: '2024-12-31',
    time: '08:00',
    category: EVENT_CATEGORIES.WORK,
    priority: EVENT_PRIORITIES.MEDIUM,
    status: EVENT_STATUS.UPCOMING,
    recurring: RECURRING_TYPES.MONTHLY,
    amount: 3500.00,
    accountId: 'acc_001',
    reminders: [
      { type: 'push', minutesBefore: 60 }
    ],
    createdAt: '2024-11-31T08:00:00Z',
    updatedAt: '2024-12-01T08:00:00Z'
  },

  // Personal Events
  {
    id: 'evt_008',
    title: 'Grocery Shopping',
    description: 'Weekly grocery shopping',
    date: '2024-12-21',
    time: '11:00',
    category: EVENT_CATEGORIES.PERSONAL,
    priority: EVENT_PRIORITIES.MEDIUM,
    status: EVENT_STATUS.UPCOMING,
    recurring: RECURRING_TYPES.WEEKLY,
    location: 'Local Supermarket',
    estimatedAmount: 120.00,
    reminders: [
      { type: 'push', minutesBefore: 30 }
    ],
    createdAt: '2024-12-14T10:00:00Z',
    updatedAt: '2024-12-14T10:00:00Z'
  },
  {
    id: 'evt_009',
    title: 'Doctor Appointment',
    description: 'Annual health checkup',
    date: '2024-12-23',
    time: '10:30',
    category: EVENT_CATEGORIES.HEALTH,
    priority: EVENT_PRIORITIES.HIGH,
    status: EVENT_STATUS.UPCOMING,
    recurring: RECURRING_TYPES.YEARLY,
    location: 'Medical Center',
    reminders: [
      { type: 'push', minutesBefore: 1440 },
      { type: 'email', minutesBefore: 2880 }
    ],
    createdAt: '2024-11-23T09:00:00Z',
    updatedAt: '2024-12-01T09:30:00Z'
  },

  // Completed Events
  {
    id: 'evt_010',
    title: 'ATM Cash Withdrawal',
    description: 'Emergency cash withdrawal',
    date: '2024-12-15',
    time: '16:45',
    category: EVENT_CATEGORIES.ATM,
    priority: EVENT_PRIORITIES.URGENT,
    status: EVENT_STATUS.COMPLETED,
    recurring: RECURRING_TYPES.NONE,
    location: 'Gas Station ATM',
    amount: 100.00,
    accountId: 'acc_001',
    completedAt: '2024-12-15T16:50:00Z',
    createdAt: '2024-12-15T16:30:00Z',
    updatedAt: '2024-12-15T16:50:00Z'
  }
];

// Helper functions
export const getEventById = (eventId) => {
  return mockEvents.find(event => event.id === eventId);
};

export const getEventsByDate = (date) => {
  return mockEvents.filter(event => event.date === date);
};

export const getEventsByCategory = (category) => {
  return mockEvents.filter(event => event.category === category);
};

export const getEventsByPriority = (priority) => {
  return mockEvents.filter(event => event.priority === priority);
};

export const getEventsByStatus = (status) => {
  return mockEvents.filter(event => event.status === status);
};

export const getEventsByDateRange = (startDate, endDate) => {
  return mockEvents.filter(event => {
    const eventDate = new Date(event.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return eventDate >= start && eventDate <= end;
  });
};

export const getUpcomingEvents = (limit = 5) => {
  const now = new Date();
  return mockEvents
    .filter(event => {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      return eventDateTime > now && event.status === EVENT_STATUS.UPCOMING;
    })
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA - dateTimeB;
    })
    .slice(0, limit);
};

export const getEventsByMonth = (year, month) => {
  return mockEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month - 1;
  });
};

export const getTodaysEvents = () => {
  const today = new Date().toISOString().split('T')[0];
  return getEventsByDate(today);
};

export const getRecurringEvents = () => {
  return mockEvents.filter(event => event.recurring !== RECURRING_TYPES.NONE);
};

export const getFinancialEvents = () => {
  return mockEvents.filter(event => 
    event.category === EVENT_CATEGORIES.FINANCE || 
    event.category === EVENT_CATEGORIES.ATM
  );
};

export const getEventColor = (category) => {
  const colors = {
    [EVENT_CATEGORIES.PERSONAL]: '#007AFF',
    [EVENT_CATEGORIES.WORK]: '#34C759',
    [EVENT_CATEGORIES.HEALTH]: '#FF3B30',
    [EVENT_CATEGORIES.ATM]: '#FF9500',
    [EVENT_CATEGORIES.FINANCE]: '#5856D6',
    [EVENT_CATEGORIES.SHOPPING]: '#AF52DE',
    [EVENT_CATEGORIES.TRAVEL]: '#32D74B',
    [EVENT_CATEGORIES.EDUCATION]: '#FFD60A'
  };
  return colors[category] || '#8E8E93';
};

export const getPriorityColor = (priority) => {
  const colors = {
    [EVENT_PRIORITIES.URGENT]: '#FF3B30',
    [EVENT_PRIORITIES.HIGH]: '#FF9500',
    [EVENT_PRIORITIES.MEDIUM]: '#FFD60A',
    [EVENT_PRIORITIES.LOW]: '#30D158'
  };
  return colors[priority] || '#8E8E93';
};

export const formatEventTime = (time) => {
  const [hours, minutes] = time.split(':');
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes} ${ampm}`;
};

export const isEventToday = (event) => {
  const today = new Date().toISOString().split('T')[0];
  return event.date === today;
};

export const isEventUpcoming = (event) => {
  const now = new Date();
  const eventDateTime = new Date(`${event.date}T${event.time}`);
  return eventDateTime > now;
};

export const getEventDuration = (startTime, endTime) => {
  if (!endTime) return null;
  
  const start = new Date(`2024-01-01T${startTime}`);
  const end = new Date(`2024-01-01T${endTime}`);
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins} mins`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
};