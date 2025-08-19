import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const useATM = () => {
  const {
    selectedAccount,
    accounts,
    updateAccountBalance,
    addTransaction,
    atmSettings,
    updateATMSettings,
  } = useData();

  const { user } = useAuth();
  const { sendTransactionAlert, sendSecurityAlert } = useNotifications();

  // ATM State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeout, setLockTimeout] = useState(null);

  // Transaction limits and settings
  const DAILY_WITHDRAWAL_LIMIT = 1000;
  const SINGLE_WITHDRAWAL_LIMIT = 500;
  const MAX_PIN_ATTEMPTS = 3;
  const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  const MINIMUM_BALANCE = 10;

  // Quick amount options
  const quickAmounts = [20, 40, 60, 80, 100, 200];

  useEffect(() => {
    // Clear PIN verification when account changes
    if (selectedAccount) {
      setIsPinVerified(false);
      setEnteredPin('');
    }
  }, [selectedAccount]);

  useEffect(() => {
    // Handle account lockout timeout
    if (lockTimeout) {
      const timer = setTimeout(() => {
        setIsLocked(false);
        setAttemptCount(0);
        setLockTimeout(null);
      }, LOCK_DURATION);

      return () => clearTimeout(timer);
    }
  }, [lockTimeout]);

  // PIN Management
  const verifyPin = useCallback(async (pin) => {
    if (isLocked) {
      return {
        success: false,
        error: 'Account is temporarily locked. Please try again later.',
      };
    }

    if (!selectedAccount) {
      return {
        success: false,
        error: 'No account selected',
      };
    }

    setIsProcessing(true);

    try {
      // Simulate PIN verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check PIN (in real app, this would be encrypted and verified securely)
      const isValidPin = pin === selectedAccount.pin || pin === '1234'; // Default PIN for demo

      if (isValidPin) {
        setIsPinVerified(true);
        setEnteredPin(pin);
        setAttemptCount(0);
        
        return {
          success: true,
          message: 'PIN verified successfully',
        };
      } else {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (newAttemptCount >= MAX_PIN_ATTEMPTS) {
          setIsLocked(true);
          setLockTimeout(Date.now());
          
          // Send security alert
          sendSecurityAlert({
            title: 'Account Locked',
            message: 'Multiple failed PIN attempts detected',
            type: 'security_lockout',
          });

          return {
            success: false,
            error: `Account locked due to ${MAX_PIN_ATTEMPTS} failed attempts. Please try again in 15 minutes.`,
          };
        }

        return {
          success: false,
          error: `Incorrect PIN. ${MAX_PIN_ATTEMPTS - newAttemptCount} attempts remaining.`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'PIN verification failed. Please try again.',
      };
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAccount, attemptCount, isLocked, sendSecurityAlert]);

  // Balance Inquiry
  const checkBalance = useCallback(async () => {
    if (!isPinVerified || !selectedAccount) {
      return {
        success: false,
        error: 'PIN verification required',
      };
    }

    setIsProcessing(true);
    setCurrentOperation('balance_inquiry');

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const transaction = {
        id: Date.now().toString(),
        type: 'balance_inquiry',
        amount: 0,
        balance: selectedAccount.balance,
        accountId: selectedAccount.id,
        timestamp: new Date().toISOString(),
        location: 'ATM Terminal',
        description: 'Balance Inquiry',
        status: 'completed',
      };

      await addTransaction(transaction);

      return {
        success: true,
        balance: selectedAccount.balance,
        transaction,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Unable to retrieve balance. Please try again.',
      };
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
    }
  }, [isPinVerified, selectedAccount, addTransaction]);

  // Cash Withdrawal
  const withdrawCash = useCallback(async (amount) => {
    if (!isPinVerified || !selectedAccount) {
      return {
        success: false,
        error: 'PIN verification required',
      };
    }

    // Validation checks
    if (amount <= 0) {
      return {
        success: false,
        error: 'Please enter a valid amount',
      };
    }

    if (amount % 10 !== 0) {
      return {
        success: false,
        error: 'Amount must be in multiples of $10',
      };
    }

    if (amount > SINGLE_WITHDRAWAL_LIMIT) {
      return {
        success: false,
        error: `Maximum withdrawal amount is $${SINGLE_WITHDRAWAL_LIMIT}`,
      };
    }

    if (selectedAccount.balance - amount < MINIMUM_BALANCE) {
      return {
        success: false,
        error: `Insufficient funds. Minimum balance of $${MINIMUM_BALANCE} required.`,
      };
    }

    // Check daily withdrawal limit
    const today = new Date().toDateString();
    const todaysWithdrawals = selectedAccount.transactions?.filter(
      t => t.type === 'withdrawal' && new Date(t.timestamp).toDateString() === today
    ) || [];
    
    const dailyTotal = todaysWithdrawals.reduce((sum, t) => sum + t.amount, 0);
    
    if (dailyTotal + amount > DAILY_WITHDRAWAL_LIMIT) {
      return {
        success: false,
        error: `Daily withdrawal limit of $${DAILY_WITHDRAWAL_LIMIT} would be exceeded.`,
      };
    }

    setIsProcessing(true);
    setCurrentOperation('withdrawal');

    try {
      // Simulate ATM processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update account balance
      const newBalance = selectedAccount.balance - amount;
      await updateAccountBalance(selectedAccount.id, newBalance);

      // Create transaction record
      const transaction = {
        id: Date.now().toString(),
        type: 'withdrawal',
        amount: amount,
        balance: newBalance,
        accountId: selectedAccount.id,
        timestamp: new Date().toISOString(),
        location: 'ATM Terminal',
        description: `Cash Withdrawal - $${amount}`,
        status: 'completed',
        receiptNumber: `ATM${Date.now()}`,
      };

      await addTransaction(transaction);

      // Send transaction alert
      sendTransactionAlert({
        title: 'Cash Withdrawal',
        message: `$${amount} withdrawn from your account`,
        amount: amount,
        balance: newBalance,
      });

      return {
        success: true,
        transaction,
        newBalance,
        message: `$${amount} withdrawn successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Withdrawal failed. Please try again.',
      };
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
    }
  }, [isPinVerified, selectedAccount, updateAccountBalance, addTransaction, sendTransactionAlert]);

  // Cash Deposit
  const depositCash = useCallback(async (amount) => {
    if (!isPinVerified || !selectedAccount) {
      return {
        success: false,
        error: 'PIN verification required',
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        error: 'Please enter a valid amount',
      };
    }

    if (amount > 10000) {
      return {
        success: false,
        error: 'Maximum deposit amount is $10,000',
      };
    }

    setIsProcessing(true);
    setCurrentOperation('deposit');

    try {
      // Simulate deposit processing
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Update account balance
      const newBalance = selectedAccount.balance + amount;
      await updateAccountBalance(selectedAccount.id, newBalance);

      // Create transaction record
      const transaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount: amount,
        balance: newBalance,
        accountId: selectedAccount.id,
        timestamp: new Date().toISOString(),
        location: 'ATM Terminal',
        description: `Cash Deposit - $${amount}`,
        status: 'completed',
        receiptNumber: `ATM${Date.now()}`,
      };

      await addTransaction(transaction);

      // Send transaction alert
      sendTransactionAlert({
        title: 'Cash Deposit',
        message: `$${amount} deposited to your account`,
        amount: amount,
        balance: newBalance,
      });

      return {
        success: true,
        transaction,
        newBalance,
        message: `$${amount} deposited successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Deposit failed. Please try again.',
      };
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
    }
  }, [isPinVerified, selectedAccount, updateAccountBalance, addTransaction, sendTransactionAlert]);

  // Fund Transfer
  const transferFunds = useCallback(async (toAccountId, amount, description = '') => {
    if (!isPinVerified || !selectedAccount) {
      return {
        success: false,
        error: 'PIN verification required',
      };
    }

    const toAccount = accounts.find(acc => acc.id === toAccountId);
    if (!toAccount) {
      return {
        success: false,
        error: 'Destination account not found',
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        error: 'Please enter a valid amount',
      };
    }

    if (selectedAccount.balance - amount < MINIMUM_BALANCE) {
      return {
        success: false,
        error: `Insufficient funds. Minimum balance of $${MINIMUM_BALANCE} required.`,
      };
    }

    setIsProcessing(true);
    setCurrentOperation('transfer');

    try {
      // Simulate transfer processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update balances
      const fromNewBalance = selectedAccount.balance - amount;
      const toNewBalance = toAccount.balance + amount;

      await updateAccountBalance(selectedAccount.id, fromNewBalance);
      await updateAccountBalance(toAccountId, toNewBalance);

      // Create transaction records
      const fromTransaction = {
        id: Date.now().toString(),
        type: 'transfer_out',
        amount: amount,
        balance: fromNewBalance,
        accountId: selectedAccount.id,
        toAccountId: toAccountId,
        timestamp: new Date().toISOString(),
        location: 'ATM Terminal',
        description: description || `Transfer to ${toAccount.accountNumber}`,
        status: 'completed',
        receiptNumber: `ATM${Date.now()}`,
      };

      const toTransaction = {
        id: (Date.now() + 1).toString(),
        type: 'transfer_in',
        amount: amount,
        balance: toNewBalance,
        accountId: toAccountId,
        fromAccountId: selectedAccount.id,
        timestamp: new Date().toISOString(),
        location: 'ATM Terminal',
        description: description || `Transfer from ${selectedAccount.accountNumber}`,
        status: 'completed',
        receiptNumber: `ATM${Date.now()}`,
      };

      await addTransaction(fromTransaction);
      await addTransaction(toTransaction);

      // Send transaction alerts
      sendTransactionAlert({
        title: 'Fund Transfer',
        message: `$${amount} transferred successfully`,
        amount: amount,
        balance: fromNewBalance,
      });

      return {
        success: true,
        transaction: fromTransaction,
        newBalance: fromNewBalance,
        message: `$${amount} transferred successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Transfer failed. Please try again.',
      };
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
    }
  }, [isPinVerified, selectedAccount, accounts, updateAccountBalance, addTransaction, sendTransactionAlert]);

  // Change PIN
  const changePin = useCallback(async (currentPin, newPin) => {
    if (!selectedAccount) {
      return {
        success: false,
        error: 'No account selected',
      };
    }

    if (currentPin !== selectedAccount.pin && currentPin !== '1234') {
      return {
        success: false,
        error: 'Current PIN is incorrect',
      };
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return {
        success: false,
        error: 'New PIN must be 4 digits',
      };
    }

    if (newPin === currentPin) {
      return {
        success: false,
        error: 'New PIN must be different from current PIN',
      };
    }

    setIsProcessing(true);

    try {
      // Simulate PIN change processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real implementation, PIN would be encrypted and stored securely
      // For demo purposes, we'll just update the local state
      
      // Send security alert
      sendSecurityAlert({
        title: 'PIN Changed',
        message: 'Your ATM PIN has been changed successfully',
        type: 'pin_change',
      });

      // Reset PIN verification state
      setIsPinVerified(false);
      setEnteredPin('');

      return {
        success: true,
        message: 'PIN changed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'PIN change failed. Please try again.',
      };
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAccount, sendSecurityAlert]);

  // Utility functions
  const resetATMState = useCallback(() => {
    setIsPinVerified(false);
    setEnteredPin('');
    setCurrentOperation(null);
    setIsProcessing(false);
  }, []);

  const getCurrentOperationStatus = useCallback(() => {
    const statusMessages = {
      'balance_inquiry': 'Retrieving balance...',
      'withdrawal': 'Processing withdrawal...',
      'deposit': 'Processing deposit...',
      'transfer': 'Processing transfer...',
    };

    return statusMessages[currentOperation] || null;
  }, [currentOperation]);

  return {
    // State
    isProcessing,
    currentOperation,
    isPinVerified,
    isLocked,
    attemptCount,
    maxAttempts: MAX_PIN_ATTEMPTS,
    selectedAccount,
    quickAmounts,
    
    // Limits
    dailyWithdrawalLimit: DAILY_WITHDRAWAL_LIMIT,
    singleWithdrawalLimit: SINGLE_WITHDRAWAL_LIMIT,
    minimumBalance: MINIMUM_BALANCE,
    
    // Functions
    verifyPin,
    checkBalance,
    withdrawCash,
    depositCash,
    transferFunds,
    changePin,
    resetATMState,
    getCurrentOperationStatus,
    
    // Settings
    atmSettings,
    updateATMSettings,
  };
};

export default useATM;