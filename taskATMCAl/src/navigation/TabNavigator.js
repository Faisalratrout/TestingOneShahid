import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

// Import screens
import ATMScreen from '../screens/ATMScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import AccountManagementScreen from '../screens/AccountManagementScreen';

// Import styles
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { selectedAccount, transactions, events } = useData();
  const { user } = useAuth();

  // Get badge counts for notifications
  const getNotificationCount = (tabName) => {
    switch (tabName) {
      case 'ATM':
        // Show count if account has low balance
        if (selectedAccount && selectedAccount.balance < 100) {
          return 1;
        }
        return 0;

      case 'Calendar':
        // Show count of today's events
        const today = new Date().toISOString().split('T')[0];
        const todaysEvents = events.filter(event => event.date === today);
        return todaysEvents.length;

      case 'History':
        // Show count of recent transactions (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const recentTransactions = transactions.filter(
          transaction => new Date(transaction.timestamp) > yesterday
        );
        return recentTransactions.length;

      case 'Accounts':
        // Show count of inactive accounts
        const inactiveAccounts = selectedAccount ? 0 : 1;
        return inactiveAccounts;

      default:
        return 0;
    }
  };

  // Custom tab bar badge component
  const TabBadge = ({ count }) => {
    if (count === 0) return null;

    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {count > 99 ? '99+' : count.toString()}
        </Text>
      </View>
    );
  };

  // Custom tab icon component
  const TabIcon = ({ route, focused, color, size }) => {
    let iconName;
    let badgeCount = getNotificationCount(route.name);

    switch (route.name) {
      case 'ATMTab':
        iconName = focused ? 'card' : 'card-outline';
        break;
      case 'CalendarTab':
        iconName = focused ? 'calendar' : 'calendar-outline';
        break;
      case 'HistoryTab':
        iconName = focused ? 'time' : 'time-outline';
        break;
      case 'AccountsTab':
        iconName = focused ? 'wallet' : 'wallet-outline';
        break;
      default:
        iconName = 'circle-outline';
    }

    return (
      <View style={styles.tabIconContainer}>
        <Ionicons name={iconName} size={size} color={color} />
        <TabBadge count={badgeCount} />
      </View>
    );
  };

  // Custom tab label component
  const TabLabel = ({ route, focused, color }) => {
    let label;

    switch (route.name) {
      case 'ATMTab':
        label = 'ATM';
        break;
      case 'CalendarTab':
        label = 'Calendar';
        break;
      case 'HistoryTab':
        label = 'History';
        break;
      case 'AccountsTab':
        label = 'Accounts';
        break;
      default:
        label = route.name;
    }

    return (
      <Text
        style={[
          styles.tabLabel,
          { color },
          focused && styles.focusedTabLabel,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Custom tab bar icon
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            route={route}
            focused={focused}
            color={color}
            size={size}
          />
        ),

        // Custom tab bar label
        tabBarLabel: ({ focused, color }) => (
          <TabLabel
            route={route}
            focused={focused}
            color={color}
          />
        ),

        // Tab bar styling
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingBottom: spacing[2],
          paddingTop: spacing[2],
          height: 70,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },

        tabBarItemStyle: {
          paddingVertical: spacing[1],
        },

        tabBarLabelStyle: {
          fontSize: 0, // Hide default label since we use custom
        },

        // Hide header (we use custom headers in screens)
        headerShown: false,

        // Animation
        tabBarHideOnKeyboard: true,
        
        // Accessibility
        tabBarAccessibilityLabel: `${route.name} tab`,
      })}

      // Tab bar animations
      screenOptions={{
        ...Tab.Navigator.defaultScreenOptions,
        tabBarShowLabel: false, // We use custom labels
        
      }}

      // Initial route
      initialRouteName="ATMTab"
    >
      {/* ATM Services Tab */}
      <Tab.Screen
        name="ATMTab"
        component={ATMScreen}
        options={{
          title: 'ATM Services',
          tabBarTestID: 'ATMTab',
          tabBarAccessibilityLabel: 'ATM Services Tab',
          tabBarAccessibilityHint: 'Navigate to ATM services screen',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // Custom tab press handling if needed
            // e.preventDefault(); // Prevent default action
            // navigation.navigate('ATMTab');
          },
        })}
      />

      {/* Calendar Tab */}
      <Tab.Screen
        name="CalendarTab"
        component={CalendarScreen}
        options={{
          title: 'Calendar',
          tabBarTestID: 'CalendarTab',
          tabBarAccessibilityLabel: 'Calendar Tab',
          tabBarAccessibilityHint: 'Navigate to calendar screen',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // You can add analytics tracking here
            // Analytics.track('Calendar Tab Pressed');
          },
        })}
      />

      {/* Transaction History Tab */}
      <Tab.Screen
        name="HistoryTab"
        component={TransactionHistoryScreen}
        options={{
          title: 'Transaction History',
          tabBarTestID: 'HistoryTab',
          tabBarAccessibilityLabel: 'History Tab',
          tabBarAccessibilityHint: 'Navigate to transaction history screen',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // Refresh transactions when tab is pressed

            // You can dispatch a refresh action here
          },
        })}
      />

      {/* Account Management Tab */}
      <Tab.Screen
        name="AccountsTab"
        component={AccountManagementScreen}
        options={{
          title: 'Account Management',
          tabBarTestID: 'AccountsTab',
          tabBarAccessibilityLabel: 'Accounts Tab',
          tabBarAccessibilityHint: 'Navigate to account management screen',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // Check if user has accounts
            // if (!selectedAccount) {
            //   Alert.alert('No Account', 'Please add an account first');
            //   e.preventDefault();
            //   return;
            // }
          },
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 32,
    height: 32,
  },

  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  badgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 16,
  },

  tabLabel: {
    ...typography.captionSmall,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },

  focusedTabLabel: {
    fontWeight: '600',
  },
});

export default TabNavigator;