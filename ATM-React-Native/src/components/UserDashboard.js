import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { getATMString } from '../utils/atmLogic';
import { VALIDATION_MESSAGES } from '../utils/constants';
import styles from '../styles/styles';

const UserDashboard = ({ currentAccount, atm, onWithdraw, onChangePin, onLogout }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [confirmOldPin, setConfirmOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showQuickAmounts, setShowQuickAmounts] = useState(true);

  // quick amount buttons for withdrawal / common amounts
  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  // confirmation function for withdrawals
  const confirmWithdrawal = (amount) => {
    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw €${amount}?\n\nCurrent Balance: €${currentAccount.balance}\n\nNote: ATM will dispense the best combination of available bills.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => processWithdrawal(amount),
        },
      ]
    );
  };

  const handleQuickWithdraw = (amount) => {
    const result = onWithdraw(amount);
    if (result.includes('Dispensed')) {
      Alert.alert('Success', result);

    } else {
      Alert.alert('Error', result);
    }
  };

  const handleWithdrawAmount = () => {
    const amount = Number(withdrawAmount);
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }
    if (amount % 5 !== 0) {
      Alert.alert('Error', 'Amount must be a multiple of 5 (ATM only dispenses €5, €10, €20, €50 bills)');
      return;
    }
    if (amount < 5) {
      Alert.alert('Error', 'Minimum withdrawal amount is €5');
      return;
    }
    if (amount > 2000) {
      Alert.alert('Error', 'Maximum withdrawal amount is €2000 per transaction');
      return;
    }
    confirmWithdrawal(amount);
    setWithdrawAmount('');
  };

  const handleChangePinSubmit = () => {
    const result = onChangePin(oldPin, confirmOldPin, newPin);
    if (result === 'PIN changed successfully') {
      Alert.alert('Success', result);
      setOldPin('');
      setConfirmOldPin('');
      setNewPin('');
    } else {
      Alert.alert('Error', result);
    }
  };

  const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit' , second:'2-digit'});
  };

  const getLastTransactions = () => {
    if (!currentAccount.history || currentAccount.history.length === 0) return [];
    return currentAccount.history.slice(-5).reverse(); // Last 5 transactions
  };

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Welcome, {currentAccount.owner}</Text>
        <Text style={styles.accountDetail}>Account: {currentAccount.username}</Text>
      </View>

      {/* Balance Display */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Current Balance:</Text>
        <Text style={styles.balanceAmount}>€{currentAccount.balance.toFixed(2)}</Text>
      </View>

      {/* ATM Status */}
      <View style={styles.atmInfo}>
        <Text style={styles.atmText}>ATM Available Cash: {getATMString(atm)}</Text>
      </View>

      {/* Quick Withdrawal Section */}
      <View style={styles.card}>
        <Text style={styles.subHeader}>Quick Withdrawal</Text>
        <Text style={styles.accountDetail}>Choose a common amount</Text>
        <View style={styles.quickAmountContainer}>
          {quickAmounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.quickAmountButton,
                currentAccount.balance < amount && { opacity: 0.5 }
              ]}
              onPress={() => handleQuickWithdraw(amount)}
              disabled={currentAccount.balance < amount}
            >
              <Text style={[
                styles.quickAmountText,
                currentAccount.balance < amount && { color: '#9ca3af' }
              ]}>
                €{amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Withdrawal Section */}
      <View style={styles.card}>
        <Text style={styles.subHeader}>Custom Amount</Text>
        <Text style={styles.accountDetail}>Enter any amount (multiple of 5)</Text>
        <View style={styles.atmInfo}>
          <Text style={styles.atmText}>
            ATM Bills Available: €50, €20, €10, €5
          </Text>
          <Text style={styles.atmText}>
            The ATM will give you the best combination of bills
          </Text>
        </View>
        <TextInput
          placeholder="Enter amount: "
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleWithdrawAmount}>
          <Text style={styles.primaryButtonText}>Withdraw Custom Amount</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.card}>
        <Text style={styles.subHeader}>Recent Transactions</Text>
        {getLastTransactions().length > 0 ? (
          <>
            {getLastTransactions().map((transaction, index) => (
              <View key={index} style={styles.transactionContainer}>
                <Text style={styles.transactionText}>
                  {formatTransactionDate(transaction.date)} - Withdrew €{transaction.amount} 
                </Text>
                <Text style={styles.transactionText}>
                  Bills: {Object.entries(transaction.bills || {})
                    .filter(([k, v]) => v > 0)
                    .map(([k, v]) => `${v}×€${k}`)
                    .join(', ')}
                </Text>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setShowTransactionHistory(true)}
            >
              <Text style={styles.secondaryButtonText}>View All Transactions</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noTransactions}>No transactions yet</Text>
        )}
      </View>

      {/* Security Section - Change PIN */}
      <View style={styles.card}>
        <Text style={styles.subHeader}>Security Settings</Text>
        <Text style={styles.accountDetail}>Change your PIN for security</Text>
        
        <TextInput
          placeholder="Current PIN"
          value={oldPin}
          onChangeText={setOldPin}
          secureTextEntry
          keyboardType="numeric"
          style={styles.input}
          maxLength={4}
        />
        <TextInput
          placeholder="Confirm Current PIN"
          value={confirmOldPin}
          onChangeText={setConfirmOldPin}
          secureTextEntry
          keyboardType="numeric"
          style={styles.input}
          maxLength={4}
        />
        <TextInput
          placeholder="New PIN (4 digits)"
          value={newPin}
          onChangeText={setNewPin}
          secureTextEntry
          keyboardType="numeric"
          style={styles.input}
          maxLength={4}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleChangePinSubmit}>
          <Text style={styles.primaryButtonText}>Update PIN</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.dangerButton} onPress={onLogout}>
          <Text style={styles.dangerButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction History Modal */}
      <Modal
        visible={showTransactionHistory}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.header}>Transaction History</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {currentAccount.history && currentAccount.history.length > 0 ? (
                currentAccount.history.slice().reverse().map((transaction, index) => (
                  <View key={index} style={styles.transactionContainer}>
                    <Text style={styles.transactionHeader}>
                      {formatTransactionDate(transaction.date)}
                    </Text>
                    <Text style={styles.transactionText}>
                      Withdrew: €{transaction.amount}
                    </Text>
                    <Text style={styles.transactionText}>
                      Bills dispensed: {Object.entries(transaction.bills || {})
                        .filter(([k, v]) => v > 0)
                        .map(([k, v]) => `${v}×€${k}`)
                        .join(', ')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noTransactions}>No transactions found</Text>
              )}
            </ScrollView>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setShowTransactionHistory(false)}
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default UserDashboard;
