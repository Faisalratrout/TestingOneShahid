import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Common/Header';
import FormButton from '../components/Forms/FormButton';
import FormInput from '../components/Forms/FormInput';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { colors } from '../styles/colors';
import { spacing, borderRadius } from '../styles/spacing';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

const ATMScreen = ({ navigation }) => {
  const {
    selectedAccount,
    addTransaction,
    atmSettings,
    loading,
    selectAccount,
    accounts,
  } = useData();
  
  const { sendTransactionNotification } = useNotifications();
  const { user } = useAuth();

  const [selectedOperation, setSelectedOperation] = useState(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  // ATM Operations
  const operations = [
    {
      id: 'withdraw',
      title: 'Withdraw Cash',
      subtitle: 'Get cash from your account',
      icon: 'cash-outline',
      color: colors.primary,
    },
    {
      id: 'deposit',
      title: 'Deposit Cash',
      subtitle: 'Add money to your account',
      icon: 'card-outline',
      color: colors.success,
    },
    {
      id: 'balance',
      title: 'Check Balance',
      subtitle: 'View your account balance',
      icon: 'wallet-outline',
      color: colors.info,
    },
    {
      id: 'transfer',
      title: 'Transfer Money',
      subtitle: 'Send money to another account',
      icon: 'swap-horizontal-outline',
      color: colors.warning,
    },
    {
      id: 'statement',
      title: 'Mini Statement',
      subtitle: 'View recent transactions',
      icon: 'receipt-outline',
      color: colors.secondary,
    },
    {
      id: 'pin',
      title: 'Change PIN',
      subtitle: 'Update your PIN number',
      icon: 'lock-closed-outline',
      color: colors.error,
    },
  ];

  // Quick amount buttons for withdrawals
  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  useEffect(() => {
    // Auto-select first account if none selected
    if (accounts.length > 0 && !selectedAccount) {
      selectAccount(accounts[0]);
    }
  }, [accounts, selectedAccount]);

  const handleOperationSelect = (operation) => {
    setSelectedOperation(operation);
    
    // Handle operations that don't need amount input
    if (operation.id === 'balance') {
      showBalance();
    } else if (operation.id === 'statement') {
      navigation.navigate('TransactionHistory');
    } else if (operation.id === 'pin') {
      navigation.navigate('ChangePIN');
    }
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
  };

  const validateTransaction = () => {
    if (!selectedAccount) {
      Alert.alert('Error', 'Please select an account first');
      return false;
    }

    if (!selectedOperation) {
      Alert.alert('Error', 'Please select an operation');
      return false;
    }

    const transactionAmount = parseFloat(amount);
    
    if (!amount || transactionAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    if (transactionAmount > atmSettings.perTransactionLimit) {
      Alert.alert(
        'Error',
        `Transaction limit exceeded. Maximum per transaction: ${atmSettings.currency} ${atmSettings.perTransactionLimit}`
      );
      return false;
    }

    if (selectedOperation.id === 'withdraw' && transactionAmount > selectedAccount.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return false;
    }

    if (!pin || pin.length < 4) {
      Alert.alert('Error', 'Please enter your 4-digit PIN');
      return false;
    }

    return true;
  };

  const handleProceedTransaction = () => {
    if (validateTransaction()) {
      setShowConfirmDialog(true);
    }
  };

  const executeTransaction = async () => {
    try {
      setTransactionLoading(true);
      setShowConfirmDialog(false);

      const transactionData = {
        type: selectedOperation.id,
        amount: parseFloat(amount),
        accountId: selectedAccount.id,
        accountNumber: selectedAccount.accountNumber,
        description: `${selectedOperation.title} - ${selectedAccount.accountNumber}`,
        location: 'ATM Machine #001',
        pin: pin,
      };

      const result = await addTransaction(transactionData);

      if (result.success) {
        // Send notification
        sendTransactionNotification(result.transaction);

        Alert.alert(
          'Transaction Successful',
          `${selectedOperation.title} of ${atmSettings.currency} ${amount} completed successfully.`,
          [
            {
              text: 'OK',
              onPress: () => {
                resetTransaction();
                navigation.navigate('TransactionReceipt', { 
                  transaction: result.transaction 
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Transaction Failed', result.error || 'Please try again');
      }
    } catch (error) {
      Alert.alert('Error', 'Transaction failed. Please try again.');
    } finally {
      setTransactionLoading(false);
    }
  };

  const showBalance = () => {
    Alert.alert(
      'Account Balance',
      `Current Balance: ${selectedAccount?.currency || atmSettings.currency} ${selectedAccount?.balance?.toFixed(2) || '0.00'}`,
      [{ text: 'OK' }]
    );
  };

  const resetTransaction = () => {
    setSelectedOperation(null);
    setAmount('');
    setPin('');
  };

  const renderAccountSelector = () => {
    if (!showAccountSelector) return null;

    return (
      <View style={styles.accountSelector}>
        <Text style={styles.sectionTitle}>Select Account</Text>
        {accounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            style={[
              styles.accountOption,
              selectedAccount?.id === account.id && styles.selectedAccountOption,
            ]}
            onPress={() => {
              selectAccount(account);
              setShowAccountSelector(false);
            }}
          >
            <View style={styles.accountInfo}>
              <Text style={styles.accountType}>{account.type.toUpperCase()}</Text>
              <Text style={styles.accountNumber}>{account.accountNumber}</Text>
            </View>
            <Text style={styles.accountBalance}>
              {account.currency} {account.balance.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderOperationGrid = () => (
    <View style={styles.operationGrid}>
      {operations.map((operation) => (
        <TouchableOpacity
          key={operation.id}
          style={[
            styles.operationCard,
            selectedOperation?.id === operation.id && styles.selectedOperationCard,
          ]}
          onPress={() => handleOperationSelect(operation)}
          activeOpacity={0.8}
        >
          <View style={[styles.operationIcon, { backgroundColor: operation.color + '20' }]}>
            <Ionicons
              name={operation.icon}
              size={32}
              color={operation.color}
            />
          </View>
          <Text style={styles.operationTitle}>{operation.title}</Text>
          <Text style={styles.operationSubtitle}>{operation.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTransactionForm = () => {
    if (!selectedOperation || ['balance', 'statement', 'pin'].includes(selectedOperation.id)) {
      return null;
    }

    return (
      <View style={styles.transactionForm}>
        <Text style={styles.sectionTitle}>
          {selectedOperation.title}
        </Text>

        {/* Amount Input */}
        <FormInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          keyboardType="numeric"
          leftIcon="cash-outline"
          required
          helperText={`Daily limit: ${atmSettings.currency} ${atmSettings.dailyLimit}`}
        />

        {/* Quick Amount Buttons for Withdrawals */}
        {selectedOperation.id === 'withdraw' && (
          <View style={styles.quickAmountContainer}>
            <Text style={styles.quickAmountLabel}>Quick Amount:</Text>
            <View style={styles.quickAmountGrid}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    amount === quickAmount.toString() && styles.selectedQuickAmount,
                  ]}
                  onPress={() => handleQuickAmount(quickAmount)}
                >
                  <Text style={[
                    styles.quickAmountText,
                    amount === quickAmount.toString() && styles.selectedQuickAmountText,
                  ]}>
                    {quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* PIN Input */}
        <FormInput
          label="PIN"
          value={pin}
          onChangeText={setPin}
          placeholder="Enter your 4-digit PIN"
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          leftIcon="lock-closed-outline"
          required
        />

        {/* Proceed Button */}
        <FormButton
          title={`Proceed with ${selectedOperation.title}`}
          onPress={handleProceedTransaction}
          disabled={!amount || !pin}
          variant="primary"
          style={styles.proceedButton}
        />

        <FormButton
          title="Cancel"
          onPress={resetTransaction}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="ATM Services"
        subtitle={`Welcome, ${user?.name || 'User'}`}
        rightIcon="person-outline"
        onRightIconPress={() => navigation.navigate('Profile')}
        backgroundColor={colors.primary}
        titleColor={colors.white}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Account Display */}
        <TouchableOpacity
          style={styles.accountCard}
          onPress={() => setShowAccountSelector(!showAccountSelector)}
          activeOpacity={0.8}
        >
          <View style={styles.accountHeader}>
            <Ionicons name="card-outline" size={24} color={colors.primary} />
            <Text style={styles.accountLabel}>Current Account</Text>
            <Ionicons 
              name={showAccountSelector ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </View>
          {selectedAccount && (
            <View style={styles.accountDetails}>
              <Text style={styles.accountType}>
                {selectedAccount.type.toUpperCase()}
              </Text>
              <Text style={styles.accountNumber}>
                {selectedAccount.accountNumber}
              </Text>
              <Text style={styles.accountBalance}>
                {selectedAccount.currency} {selectedAccount.balance.toFixed(2)}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Account Selector */}
        {renderAccountSelector()}

        {/* Operation Selection */}
        {!selectedOperation && (
          <>
            <Text style={styles.sectionTitle}>Select Service</Text>
            {renderOperationGrid()}
          </>
        )}

        {/* Transaction Form */}
        {renderTransactionForm()}
      </ScrollView>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={showConfirmDialog}
        title="Confirm Transaction"
        message={`Are you sure you want to ${selectedOperation?.title.toLowerCase()} ${atmSettings.currency} ${amount}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="primary"
        onConfirm={executeTransaction}
        onCancel={() => setShowConfirmDialog(false)}
      />

      {/* Loading Overlay */}
      <LoadingSpinner
        visible={transactionLoading}
        message="Processing transaction..."
        overlay
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    padding: spacing[4],
  },

  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...globalStyles.shadow,
  },

  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  accountLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    marginLeft: spacing[2],
  },

  accountDetails: {
    marginTop: spacing[2],
  },

  accountType: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  accountNumber: {
    ...typography.body,
    color: colors.textPrimary,
    marginVertical: spacing[1],
  },

  accountBalance: {
    ...typography.h6,
    color: colors.success,
    fontWeight: 'bold',
  },

  accountSelector: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
  },

  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  selectedAccountOption: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: -spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.sm,
  },

  accountInfo: {
    flex: 1,
  },

  sectionTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: spacing[3],
  },

  operationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  operationCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
    alignItems: 'center',
    ...globalStyles.shadow,
  },

  selectedOperationCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  operationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },

  operationTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing[1],
  },

  operationSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  transactionForm: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...globalStyles.shadow,
  },

  quickAmountContainer: {
    marginVertical: spacing[3],
  },

  quickAmountLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing[2],
  },

  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  quickAmountButton: {
    width: '30%',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  selectedQuickAmount: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  quickAmountText: {
    ...typography.body,
    color: colors.textPrimary,
  },

  selectedQuickAmountText: {
    color: colors.white,
    fontWeight: 'bold',
  },

  proceedButton: {
    marginTop: spacing[4],
  },

  cancelButton: {
    marginTop: spacing[2],
  },
});

export default ATMScreen;