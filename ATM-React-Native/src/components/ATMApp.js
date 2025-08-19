import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import { initialAccounts, adminAccount, initialATM } from '../data/initialData';
import { getATMSum, getBillsForAmount } from '../utils/atmLogic';

import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import { initialAccounts, adminAccount, initialATM } from '../data/initialData';
import { getATMSum, getBillsForAmount } from '../utils/atmLogic';

export default function ATMApp({ route, navigation }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [atm, setATM] = useState(initialATM);
  const [currentAccount, setCurrentAccount] = useState(null);

  // Get login credentials from navigation params
  const { username, pin } = route.params;

  React.useEffect(() => {
    // Check if user is admin
    if (username === adminAccount.username && Number(pin) === adminAccount.pin) {
      setCurrentAccount({ ...adminAccount, balance: 0, history: [] });
      return;
    }

    // Find regular user account
    const foundAccount = accounts.find(acc => 
      acc.username === username && acc.pin === Number(pin)
    );

    if (foundAccount) {
      setCurrentAccount(foundAccount);
    } else {
      Alert.alert('Error', 'Invalid credentials', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    }
  }, [username, pin, accounts, navigation]);

  const handleLogout = () => {
    setCurrentAccount(null);
    navigation.navigate('Login');
  };

  const handleWithdraw = (amount) => {
    if (!currentAccount || currentAccount.isAdmin) return 'Unauthorized';

    // Check balance
    if (currentAccount.balance < amount) {
      return 'Insufficient balance';
    }

    // Check if ATM has enough cash
    if (getATMSum(atm) < amount) {
      return 'ATM does not have enough cash';
    }

    // Calculate bills needed
    const billsNeeded = getBillsForAmount(amount, atm);
    if (!billsNeeded) {
      return 'ATM cannot dispense this amount with available bills';
    }

    // Update ATM cash
    const newATM = { ...atm };
    Object.keys(billsNeeded).forEach(bill => {
      newATM[bill] -= billsNeeded[bill];
    });

    // Update account balance and history
    const updatedAccount = {
      ...currentAccount,
      balance: currentAccount.balance - amount,
      history: [
        ...currentAccount.history,
        {
          date: new Date().toISOString(),
          type: 'withdraw',
          amount,
          bills: billsNeeded
        }
      ]
    };

    // Update accounts array
    const updatedAccounts = accounts.map(acc => 
      acc.username === currentAccount.username ? updatedAccount : acc
    );

    setAccounts(updatedAccounts);
    setCurrentAccount(updatedAccount);
    setATM(newATM);

    // Create dispense message
    const dispensedBills = Object.entries(billsNeeded)
      .filter(([k, v]) => v > 0)
      .map(([k, v]) => `${v}×€${k}`)
      .join(', ');

    return `Dispensed €${amount}\nBills: ${dispensedBills}`;
  };

  const handleChangePin = (oldPin, confirmOldPin, newPin) => {
    if (!currentAccount || currentAccount.isAdmin) return 'Unauthorized';

    // Validate inputs
    if (!oldPin || !confirmOldPin || !newPin) {
      return 'Please fill all fields';
    }

    if (oldPin !== confirmOldPin) {
      return 'Old PINs do not match';
    }

    if (Number(oldPin) !== currentAccount.pin) {
      return 'Incorrect old PIN';
    }

    if (newPin.length !== 4) {
      return 'New PIN must be 4 digits';
    }

    if (Number(newPin) === currentAccount.pin) {
      return 'New PIN must be different from old PIN';
    }

    // Update PIN
    const updatedAccount = {
      ...currentAccount,
      pin: Number(newPin)
    };

    const updatedAccounts = accounts.map(acc => 
      acc.username === currentAccount.username ? updatedAccount : acc
    );

    setAccounts(updatedAccounts);
    setCurrentAccount(updatedAccount);

    return 'PIN changed successfully';
  };

  const handleRefillATM = (newATM) => {
    setATM(newATM);
  };

  if (!currentAccount) {
    return <View />; // Loading or will navigate back to login
  }

  return currentAccount.isAdmin ? (
    <AdminDashboard
      accounts={accounts}
      atm={atm}
      handleRefillATM={handleRefillATM}
      handleLogout={handleLogout}
    />
  ) : (
    <UserDashboard
      currentAccount={currentAccount}
      atm={atm}
      onWithdraw={handleWithdraw}
      onChangePin={handleChangePin}
      onLogout={handleLogout}
    />
  );
}


