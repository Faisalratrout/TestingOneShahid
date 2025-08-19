import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';

const adminAccount = {
  owner: 'Admin User',
  username: 'admin',
  pin: 1111,
  isAdmin: true,
};

const initialAccounts = [
  {
    owner: 'Faisal Ratrout',
    username: 'FR',
    pin: 1234,
    balance: 10,
    history: [],
  },
  {
    owner: 'Zeyad Albazlamit',
    username: 'ZA',
    pin: 4321,
    balance: 1350,
    history: [],
  },
];

const initialATM = { 50: 0, 20: 0, 10: 0, 5: 0 };

const createUsername = owner =>
  owner
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('');

function getATMSum(atm) {// Calculate total cash in ATM
  return (
    atm[50] * 50 +
    atm[20] * 20 +
    atm[10] * 10 +
    atm[5] * 5 
  );
}

function getATMString(atm) {
  return `50s: ${atm[50]}, 20s: ${atm[20]}, 10s: ${atm[10]}, 5s: ${atm[5]}`;
}

function getBillsForAmount(amount, atm) {
  let needed = amount;
  const bills = { 50: 0, 20: 0, 10: 0,  5: 0 };
  for (let bill of [50, 20, 10, 5]) {
    let take = Math.min(Math.floor(needed / bill), atm[bill]);
    bills[bill] = take;
    needed -= take * bill;
  }
  if (needed === 0) return bills;
  return null;
}

function getTransactionHistory() {
  return accounts.flatMap(acc => 
    (acc.history || []).map(h => `${acc.owner}: ${h.type} €${h.amount} on ${h.date}`)
  ).join('\n') || 'No transactions found';
}

function showHistoryAdmin (currentAccount){
  if (!currentAccount || !currentAccount.isAdmin) {
    Alert.alert('Access denied');
    return;
  }
  const history = getTransactionHistory();
  Alert.alert('Transaction History', history);
}

export default function ATMApp() {// Main ATM component
  const [accounts, setAccounts] = useState(initialAccounts);
  const [atm, setATM] = useState(initialATM);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [atmRefill, setATMRefill] = useState({ 50: '', 20: '', 10: '', 5: '' });
  const [signupOwner, setSignupOwner] = useState('');
  const [signupPin, setSignupPin] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [confirmOldPin, setConfirmOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  // Login 
  const handleLogin = () => {
    let acc;
    if (
      loginUsername === adminAccount.username &&
      Number(loginPin) === adminAccount.pin
    ) {
      acc = adminAccount;
    } else {
      acc = accounts.find(a => a.username === loginUsername);
    }
    if (acc && acc.pin === Number(loginPin)) {
      setCurrentAccount(acc);
      setLoginUsername('');
      setLoginPin('');
    } else {
      Alert.alert('Incorrect username or pin');
    }
  };

  // Logout
  const handleLogout = () => {
    setCurrentAccount(null);
    setWithdrawAmount('');
    setATMRefill({ 50: '', 20: '', 10: '', 5: '' });
  };

  // Admin: refill ATM
  const handleRefillATM = () => {
    const newATM = { ...atm };
    for (let bill of [50, 20, 10, 5]) {
      const add = parseInt(atmRefill[bill]) || 0;
      newATM[bill] += add;
    }
    setATM(newATM);
    setATMRefill({ 50: '', 20: '', 10: '', 5: '' });
    Alert.alert('ATM refilled', getATMString(newATM));
  };

  // User withdraw
  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount % 5 !== 0) {
      Alert.alert('Amount must be a multiple of 5');
      return;
    }
    if (currentAccount.balance < amount) {
      Alert.alert(`Insufficient balance. Your balance: €${currentAccount.balance}`);
      return;
    }
    if (getATMSum(atm) < amount) {
      Alert.alert('ATM does not have enough cash. Please contact admin.');
      return;
    }
    const bills = getBillsForAmount(amount, atm);
    if (!bills) {
      Alert.alert('ATM cannot dispense this amount with available bills.');
      return;
    }
    // Update ATM
    const newATM = { ...atm };
    for (let bill of [50, 20, 10, 5]) {
      newATM[bill] -= bills[bill];
    }
    setATM(newATM);
    // Update user balance and history
    const updatedAccounts = accounts.map(acc =>
      acc.username === currentAccount.username
        ? {
            ...acc,
            balance: acc.balance - amount,
            history: [
              ...(acc.history || []),
              {
                type: 'withdraw',
                amount,
                date: new Date().toLocaleString(),
                bills,
              },
            ],
          }
        : acc
    );
    setAccounts(updatedAccounts);
    setCurrentAccount({
      ...currentAccount,
      balance: currentAccount.balance - amount,
      history: [
        ...(currentAccount.history || []),
        {
          type: 'withdraw',
          amount,
          date: new Date().toLocaleString(),
          bills,
        },
      ],
    });
    setWithdrawAmount('');
    Alert.alert(
      'Withdrawal successful',
      `Dispensed: ${Object.entries(bills)
        .filter(([k, v]) => v > 0)
        .map(([k, v]) => `${v} of ${k}`)
        .join(', ')}`
    );
  };

  // Signup
  const handleSignup = () => {
    if (!signupOwner || !signupPin) {
      Alert.alert('Please fill all fields');
      return;
    }
    const username = createUsername(signupOwner);
    if (
      accounts.some(acc => acc.username === username) ||
      username === adminAccount.username
    ) {
      Alert.alert('Username already exists');
      return;
    }
    const newAcc = {
      owner: signupOwner,
      username,
      pin: Number(signupPin),
      balance: 0,
    };
    setAccounts([...accounts, newAcc]);
    setSignupOwner('');
    setSignupPin('');
    setShowSignup(false);
    Alert.alert(`Account created! Your username: ${username}`);
  };

  // Change PIN
  const handleChangePin = () => {
    if (!oldPin || !confirmOldPin || !newPin) {
      Alert.alert('Please fill all fields');
      return;
    }
    if (oldPin !== confirmOldPin) {
      Alert.alert('Old PINs do not match');
      return;
    }
    if (Number(oldPin) !== currentAccount.pin) {
      Alert.alert('Old PIN is incorrect');
      return;
    }
    if (oldPin === newPin) {
      Alert.alert('New PIN must be different from old PIN');
      return;
    }
    // Update PIN in accounts
    const updatedAccounts = accounts.map(acc =>
      acc.username === currentAccount.username
        ? { ...acc, pin: Number(newPin) }
        : acc
    );
    setAccounts(updatedAccounts);
    setCurrentAccount({ ...currentAccount, pin: Number(newPin) });
    setOldPin('');
    setConfirmOldPin('');
    setNewPin('');
    Alert.alert('PIN changed successfully');
  };

  // UI
  if (!currentAccount) {
    return (
      <View>
        {showSignup ? (
          <>
            <Text>Sign Up</Text>
            <TextInput
              placeholder="Full Name"
              value={signupOwner}
              onChangeText={setSignupOwner}
            />
            <TextInput
              placeholder="PIN"
              value={signupPin}
              onChangeText={setSignupPin}
              secureTextEntry
              keyboardType="numeric"
            />
            <Button title="Create Account" onPress={handleSignup} />
            <Button
              title="Back to Login"
              onPress={() => setShowSignup(false)}
            />
          </>
        ) : (
          <>
            <Text>Login</Text>
            <TextInput
              placeholder="Username"
              value={loginUsername}
              onChangeText={setLoginUsername}
          />
            <TextInput
              placeholder="PIN"
              value={loginPin}
              onChangeText={setLoginPin}
              secureTextEntry
              keyboardType="numeric"
            />
            <Button title="Login" onPress={handleLogin} />
            <Button
              title="Sign Up"
              onPress={() => setShowSignup(true)}
            />
          </>
        )}
      </View>
    );
  }

  // Admin view for ATM 
  if (currentAccount.username === adminAccount.username) {
    return (
      <ScrollView>
        <Text>Welcome Admin</Text>
        <Text>ATM Cash: {getATMString(atm)}</Text>
        <Text>Refill ATM</Text>
        <TextInput
          placeholder="Add 50s"
          value={atmRefill[50]}
          onChangeText={v => setATMRefill({ ...atmRefill, 50: v })}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Add 20s"
          value={atmRefill[20]}
          onChangeText={v => setATMRefill({ ...atmRefill, 20: v })}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Add 10s"
          value={atmRefill[10]}
          onChangeText={v => setATMRefill({ ...atmRefill, 10: v })}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Add 5s"
          value={atmRefill[5]}
          onChangeText={v => setATMRefill({ ...atmRefill, 5: v })}
          keyboardType="numeric"
        />
        <Button title="Refill ATM" onPress={handleRefillATM} />
        <Text style={{ marginTop: 20, fontWeight: 'bold' }}>User Details & Transactions:</Text>
        {accounts.map(acc => (
          <View
            key={acc.username}
            style={{
              marginVertical: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: '#ccc',
              backgroundColor: '#f9f9f9',
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>
              {acc.owner} ({acc.username})
            </Text>
            <Text>PIN: {acc.pin}</Text>
            <Text>Balance: €{acc.balance}</Text>
            <Text>Transaction History:</Text>
            {acc.history && acc.history.length > 0 ? (
              acc.history.map((h, idx) => (
                <Text key={idx} style={{ fontSize: 12 }}>
                  [{h.date}] {h.type === 'withdraw' ? 'Withdrew' : h.type}: €{h.amount} (
                  {Object.entries(h.bills || {})
                    .filter(([k, v]) => v > 0)
                    .map(([k, v]) => `${v}x${k}`)
                    .join(', ')}
                  )
                </Text>
              ))
            ) : (
              <Text style={{ fontSize: 12 }}>No transactions</Text>
            )}
          </View>
        ))}
        <Button title="Logout" onPress={handleLogout} />
      </ScrollView>
    );
  }

  // User view
  return (
    <ScrollView>
      <Text>Welcome, {currentAccount.owner}</Text>
      <Text>Balance: €{currentAccount.balance}</Text>
      <Text>ATM Cash: {getATMString(atm)}</Text>
      <Text>Withdraw Money</Text>
      <TextInput
        placeholder="Amount (multiple of 5)"
        value={withdrawAmount}
        onChangeText={setWithdrawAmount}
        keyboardType="numeric"
      />
      <Button title="Withdraw" onPress={handleWithdraw} />

      {/* Change PIN Section */}

      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Change PIN</Text>
      <TextInput
        placeholder="Old PIN"
        value={oldPin}
        onChangeText={setOldPin} 
        secureTextEntry
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Confirm Old PIN"
        value={confirmOldPin}
        onChangeText={setConfirmOldPin}
        secureTextEntry
        keyboardType="numeric"
      />
      <TextInput
        placeholder="New PIN"
        value={newPin}
        onChangeText={setNewPin}
        secureTextEntry
        keyboardType="numeric" 
      />
      <Button title="Change PIN" onPress={handleChangePin} />

      <Button title="Logout" onPress={handleLogout} />
    </ScrollView>
  );
}





