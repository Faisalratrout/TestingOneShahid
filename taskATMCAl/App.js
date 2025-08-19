import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

// Import screens
import ATMScreen from './src/screens/ATMScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';
import AccountManagementScreen from './src/screens/AccountManagementScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main app sections
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#f8f9fa',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
        },
        headerStyle: {
          backgroundColor: '#1e3a8a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="ATM" 
        component={ATMScreen}
        options={{
          title: 'ATM Services',
          tabBarLabel: 'ATM',
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          title: 'Financial Calendar',
          tabBarLabel: 'Calendar',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={TransactionHistoryScreen}
        options={{
          title: 'Transaction History',
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountManagementScreen}
        options={{
          title: 'Account Management',
          tabBarLabel: 'Account',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false, // Hide header for tab navigator
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});