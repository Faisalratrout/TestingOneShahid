import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ATMApp from './src/components/ATMApp';
import LoginScreen from './src/components/LoginScreen';
import SignupScreen from './src/components/SignupScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1e3a8a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'ATM Login' }}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen}
          options={{ title: 'Create Account' }}
        />
        <Stack.Screen 
          name="ATM" 
          component={ATMApp}
          options={{ 
            title: 'ATM System',
            headerLeft: null, // Disable back button
            gestureEnabled: false, // Disable swipe back on iOS
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}