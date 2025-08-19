import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a', // Deep blue banking background
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  
  // Card containers for different sections
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  // Headers
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },
  
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 5,
  }, 
  
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e3a8a',
    marginTop: 20,
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },

  // Balance and ATM info
  balanceContainer: {
    backgroundColor: '#059669', 
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  
  balanceText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginTop: 5,
  },

  atmInfo: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  
  atmText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },

  // Input fields
  input: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: 'white',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  inputFocused: {
    borderColor: '#1e3a8a',
    borderWidth: 2,
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  secondaryButton: {
    backgroundColor: '#6b7280',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginVertical: 8,
  },
  
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  dangerButton: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginVertical: 8,
  },
  
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Admin specific styles
  adminHeader: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  
  adminHeaderText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Account containers for admin view
  accountContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  accountHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  
  accountDetail: {
    fontSize: 14,
    color: '#4b5563',
    marginVertical: 2,
    fontWeight: '500',
  },
  
  accountBalance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginVertical: 2,
  },

  // Transaction history
  transactionContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  
  transactionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#353f4fff',
    marginBottom: 5,
  },
  
  transactionText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    fontFamily: 'monospace', 
  },
  
  noTransactions: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  // ATM refill section
  refillSection: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  
  refillHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 10,
    textAlign: 'center',
  },

  // Quick amount buttons for withdrawal
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  
  quickAmountButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    width: '30%',
    alignItems: 'center',
  },
  
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // Status indicators
  successIndicator: {
    backgroundColor: '#10b981',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 5,
  },
  
  errorIndicator: {
    backgroundColor: '#ef4444',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 5,
  },
  
  indicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
  },
  
  loadingText: {
    color: 'white',
    fontsize: 16,
    marginTop: 10,
  },
}
);














