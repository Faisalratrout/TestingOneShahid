import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import CalendarScreen from './screens/CalendarScreen';
import EventsScreen from './screens/EventsScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import utilities
import DataUtils from './dataUtils';

const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6466f0ff',
    accent: '#f59e0b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1f2937',
  },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userSettings, setUserSettings] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const dataUtils = new DataUtils();
      const settings = await dataUtils.loadSettings();
      setUserSettings(settings);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.loadingContent}>
        {/* Splash screen with app logo, app name, and loading spinner */}
        <View style={{
        backgroundColor: '#fff',
        borderRadius: 48,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 24,
        }}>
        <Icon name="calendar-today" size={64} color={theme.colors.primary} />
        </View>
        <View style={{ height: 16 }} />
        <View>
        <Icon name="event-note" size={32} color={theme.colors.accent} />
        </View>
        <View style={{ height: 24 }} />
        <View>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#fff',
          letterSpacing: 1,
          textAlign: 'center',
        }}>
          My Calendar
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#f3f4f6',
          marginTop: 8,
          textAlign: 'center',
        }}>
          Organize your events with ease
        </Text>
        </View>
        <View style={{ height: 32 }} />
        <View>
        <Icon name="hourglass-empty" size={36} color="#fff" style={{ opacity: 0.7 }} />
        </View>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={userSettings?.darkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.primary}
        />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Calendar') {
                  iconName = 'calendar-today';
                } else if (route.name === 'Events') {
                  iconName = 'event-note';
                } else if (route.name === 'Settings') {
                  iconName = 'settings';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: '#9ca3af',
              tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopWidth: 1,
                borderTopColor: '#e5e7eb',
                paddingBottom: Platform.OS === 'ios' ? 20 : 5,
                height: Platform.OS === 'ios' ? 80 : 60,
              },
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#ffffff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            <Tab.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{
                title: 'Calendar',
                headerTitle: 'My Calendar',
              }}
            />
            <Tab.Screen
              name="Events"
              component={EventsScreen}
              options={{
                title: 'Events',
                headerTitle: 'All Events',
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: 'Settings',
                headerTitle: 'Settings',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
