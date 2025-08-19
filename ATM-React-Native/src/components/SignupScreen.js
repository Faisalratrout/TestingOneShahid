import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { createUsername } from '../utils/atmLogic'; 
import styles from '../styles/styles'; 

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createUsername } from '../utils/atmLogic';
import styles from '../styles/styles';

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSignup = () => {
    if (!fullName || !pin || !confirmPin) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }
    
    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }
    
    const username = createUsername(fullName);
    
    Alert.alert(
      'Account Created!',
      `Your account has been created successfully!\n\nUsername: ${username}\nPIN: ${pin}\n\nPlease remember these credentials for login.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Create Account</Text>
        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
        <TextInput
          placeholder="4-Digit PIN"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          style={styles.input}
        />
        <TextInput
          placeholder="Confirm PIN"
          value={confirmPin}
          onChangeText={setConfirmPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          style={styles.input}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSignup}>
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={goToLogin}>
          <Text style={styles.secondaryButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignupScreen;