import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import styles from '../styles/styles'; 

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');

  const handleLogin = () => {
    if (!username || !pin) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
    // Navigate to ATM screen with login credentials
    navigation.navigate('ATM', { username, pin });
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>ATM Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="PIN"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSignup}>
          <Text style={styles.secondaryButtonText}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
 