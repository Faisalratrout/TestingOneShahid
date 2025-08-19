export const colors = {
  // Primary Colors
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  
  // Secondary Colors
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFE0B2',
  
  // Status Colors
  success: '#4CAF50',
  successDark: '#388E3C',
  successLight: '#C8E6C9',
  
  error: '#f44336',
  errorDark: '#D32F2F',
  errorLight: '#FFCDD2',
  
  warning: '#FF9800',
  warningDark: '#F57C00',
  warningLight: '#FFE0B2',
  
  info: '#2196F3',
  infoDark: '#1976D2',
  infoLight: '#BBDEFB',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  dark: '#212121',
  darkGray: '#424242',
  gray: '#757575',
  lightGray: '#BDBDBD',
  veryLightGray: '#E0E0E0',
  background: '#F5F5F5',
  surface: '#FAFAFA',
  
  // Text Colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#000000',
  
  // ATM Specific Colors
  atmBlue: '#1565C0',
  atmGreen: '#2E7D32',
  atmRed: '#C62828',
  atmGold: '#FF8F00',
  
  // Calendar Specific Colors
  calendarToday: '#2196F3',
  calendarSelected: '#1976D2',
  calendarEvent: '#4CAF50',
  calendarATMEvent: '#f44336',
  
  // Card Colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E0E0E0',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  
  // Button Colors
  buttonPrimary: '#2196F3',
  buttonSecondary: '#757575',
  buttonSuccess: '#4CAF50',
  buttonError: '#f44336',
  buttonWarning: '#FF9800',
  buttonDisabled: '#BDBDBD',
  
  // Input Colors
  inputBorder: '#BDBDBD',
  inputFocus: '#2196F3',
  inputError: '#f44336',
  inputBackground: '#FFFFFF',
  inputPlaceholder: '#BDBDBD',
  
  // Navigation Colors
  tabActive: '#2196F3',
  tabInactive: '#757575',
  tabBackground: '#FFFFFF',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: 'rgba(0, 0, 0, 0.6)',
  
  // Gradient Colors
  gradientStart: '#2196F3',
  gradientEnd: '#1976D2',
  
  // Border Colors
  borderLight: '#E0E0E0',
  borderMedium: '#BDBDBD',
  borderDark: '#757575',
  
  // Event Category Colors
  workEvent: '#2196F3',
  personalEvent: '#4CAF50',
  healthEvent: '#FF5722',
  financeEvent: '#FF9800',
  atmEvent: '#f44336',
  otherEvent: '#9C27B0',
  
  // Priority Colors
  lowPriority: '#4CAF50',
  mediumPriority: '#FF9800',
  highPriority: '#FF5722',
  urgentPriority: '#f44336',
  
  // Transaction Type Colors
  withdrawal: '#f44336',
  deposit: '#4CAF50',
  transfer: '#FF9800',
  inquiry: '#2196F3',
  
  // Account Type Colors
  checking: '#2196F3',
  savings: '#4CAF50',
  credit: '#FF9800',
  
  // Misc Colors
  divider: '#E0E0E0',
  placeholder: '#BDBDBD',
  disabled: '#F5F5F5',
  hover: 'rgba(33, 150, 243, 0.1)',
  pressed: 'rgba(33, 150, 243, 0.2)',
  
  // Light Theme specific
  lightBackground: '#FFFFFF',
  lightSurface: '#FAFAFA',
  lightText: '#212121',
  
  // You can extend with dark theme later
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',
  darkText: '#FFFFFF',
};

// Color utility functions
export const getColorOpacity = (color, opacity) => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const getEventColor = (category) => {
  switch (category) {
    case 'work':
      return colors.workEvent;
    case 'personal':
      return colors.personalEvent;
    case 'health':
      return colors.healthEvent;
    case 'finance':
      return colors.financeEvent;
    case 'atm':
      return colors.atmEvent;
    default:
      return colors.otherEvent;
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'low':
      return colors.lowPriority;
    case 'medium':
      return colors.mediumPriority;
    case 'high':
      return colors.highPriority;
    case 'urgent':
      return colors.urgentPriority;
    default:
      return colors.mediumPriority;
  }
};

export const getTransactionColor = (type) => {
  switch (type) {
    case 'withdrawal':
      return colors.withdrawal;
    case 'deposit':
      return colors.deposit;
    case 'transfer':
      return colors.transfer;
    case 'balance_inquiry':
      return colors.inquiry;
    default:
      return colors.gray;
  }
};

export default colors;