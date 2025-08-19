import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getATMString, getATMSum } from '../utils/atmLogic';
import styles from '../styles/styles';

const AdminDashboard = ({ atm, accounts, handleRefillATM, handleLogout }) => {
  const [atmRefill, setATMRefill] = useState({ 50: '', 20: '', 10: '', 5: '' });

  const refillATM = () => {
    // Validate inputs
    const refillAmounts = {};
    let hasValidInput = false;

    for (let bill of [50, 20, 10, 5]) {
      const value = atmRefill[bill];
      if (value && value.trim() !== '') {
        const amount = parseInt(value);
        if (isNaN(amount) || amount < 0) {
          Alert.alert('Error', `Invalid amount for €${bill} bills`);
          return;
        }
        refillAmounts[bill] = amount;
        hasValidInput = true;
      } else {
        refillAmounts[bill] = 0;
      }
    }

    if (!hasValidInput) {
      Alert.alert('Error', 'Please enter at least one refill amount');
      return;
    }

    // Update ATM
    const newATM = { ...atm };
    let refillMessage = 'ATM Refilled:\n';
    
    for (let bill of [50, 20, 10, 5]) {
      if (refillAmounts[bill] > 0) {
        newATM[bill] += refillAmounts[bill];
        refillMessage += `€${bill}: +${refillAmounts[bill]} bills\n`;
      }
    }

    handleRefillATM(newATM);
    setATMRefill({ 50: '', 20: '', 10: '', 5: '' });
    
    Alert.alert('Success', `${refillMessage}\nTotal ATM Cash: €${getATMSum(newATM)}`);
  };

  const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getTotalSystemBalance = () => {
    return accounts.reduce((total, acc) => total + acc.balance, 0);
  };

  const getTotalTransactions = () => {
    return accounts.reduce((total, acc) => total + (acc.history ? acc.history.length : 0), 0);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Admin Header */}
      <View style={styles.adminHeader}>
        <Text style={styles.adminHeaderText}>Admin Dashboard</Text>
      </View>

      {/* System Overview */}
      <View style={styles.card}>
        <Text style={styles.subHeader}>System Overview</Text>
        <Text style={styles.accountDetail}>Total Users: {accounts.length}</Text>
        <Text style={styles.accountDetail}>Total Transactions: {getTotalTransactions()}</Text>
        <Text style={styles.accountBalance}>Total System Balance: €{getTotalSystemBalance().toFixed(2)}</Text>
      </View>

      {/* ATM Status */}
      <View style={styles.card}>
        <Text style={styles.subHeader}>ATM Status</Text>
        <View style={styles.atmInfo}>
          <Text style={styles.atmText}>Current Cash: €{getATMSum(atm)}</Text>
          <Text style={styles.atmText}>Bills Available:</Text>
          <Text style={styles.atmText}>€50 bills: {atm[50]}</Text>
          <Text style={styles.atmText}>€20 bills: {atm[20]}</Text>
          <Text style={styles.atmText}>€10 bills: {atm[10]}</Text>
          <Text style={styles.atmText}>€5 bills: {atm[5]}</Text>
        </View>
      </View>

      {/* ATM Refill Section */}
      <View style={styles.refillSection}>
        <Text style={styles.refillHeader}>Refill ATM</Text>
        <TextInput
          placeholder="Add €50 bills"
          value={atmRefill[50]}
          onChangeText={v => setATMRefill({ ...atmRefill, 50: v })}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Add €20 bills"
          value={atmRefill[20]}
          onChangeText={v => setATMRefill({ ...atmRefill, 20: v })}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Add €10 bills"
          value={atmRefill[10]}
          onChangeText={v => setATMRefill({ ...atmRefill, 10: v })}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Add €5 bills"
          value={atmRefill[5]}
          onChangeText={v => setATMRefill({ ...atmRefill, 5: v })}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={refillATM}>
          <Text style={styles.primaryButtonText}>Refill ATM</Text>
        </TouchableOpacity>
      </View>

      {/* User Accounts */}
      <View style={styles.card}>
        <Text style={styles.subHeader}>User Accounts & Transaction History</Text>
        {accounts.map(acc => (
          <View key={acc.username} style={styles.accountContainer}>
            <Text style={styles.accountHeader}>
              {acc.owner} ({acc.username})
            </Text>
            <Text style={styles.accountDetail}>PIN: {acc.pin}</Text>
            <Text style={styles.accountBalance}>Balance: €{acc.balance.toFixed(2)}</Text>
            
            <Text style={[styles.accountDetail, { marginTop: 10, fontWeight: '600' }]}>
              Transaction History ({acc.history ? acc.history.length : 0} transactions):
            </Text>
            
            {acc.history && acc.history.length > 0 ? (
              <ScrollView style={{ maxHeight: 150 }}>
                {acc.history.slice().reverse().map((transaction, idx) => (
                  <View key={idx} style={styles.transactionContainer}>
                    <Text style={styles.transactionHeader}>
                      {formatTransactionDate(transaction.date)}
                    </Text>
                    <Text style={styles.transactionText}>
                      {transaction.type === 'withdraw' ? 'Withdrew' : transaction.type}: €{transaction.amount}
                    </Text>
                    <Text style={styles.transactionText}>
                      Bills dispensed: {Object.entries(transaction.bills || {})
                        .filter(([k, v]) => v > 0)
                        .map(([k, v]) => `${v}×€${k}`)
                        .join(', ') || 'None'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noTransactions}>No transactions yet</Text>
            )}
          </View>
        ))}
      </View>

      {/* Logout */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
          <Text style={styles.dangerButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AdminDashboard;
