import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Main App Screens
import ATMScreen from '../screens/ATMScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import AccountManagementScreen from '../screens/AccountManagementScreen';

// Additional Screens
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddEventScreen from '../screens/AddEventScreen';
import EditEventScreen from '../screens/EditEventScreen';
import TransactionDetailsScreen from '../screens/TransactionDetailsScreen';
import TransactionReceiptScreen from '../screens/TransactionReceiptScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Main App Stack Navigator
const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MainTabs" 
      component={TabNavigator}  // Use this instead of inline component
    />
    
    {/* Modal/Stack Screens */}
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
    />
    <Stack.Screen 
      name="AddEvent" 
      component={AddEventScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen 
      name="EditEvent" 
      component={EditEventScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen 
      name="TransactionDetails" 
      component={TransactionDetailsScreen}
    />
    <Stack.Screen 
      name="TransactionReceipt" 
      component={TransactionReceiptScreen}
      options={{ presentation: 'modal' }}
    />
  </Stack.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <StackNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
