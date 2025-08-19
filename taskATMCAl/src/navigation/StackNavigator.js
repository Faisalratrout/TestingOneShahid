import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useData } from '../context/DataContext';

// Tab Navigator
import TabNavigator from './TabNavigator';

// Import styles
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { selectedAccount, accounts } = useData();

  // Custom screen options
  const defaultScreenOptions = {
    headerShown: false, // We use custom headers
    animation: 'slide_from_right',
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    
    // Header styling for screens that need it
    headerStyle: {
      backgroundColor: colors.surface,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    headerTitleStyle: {
      ...typography.h6,
      color: colors.textPrimary,
      fontWeight: 'bold',
    },
    headerTintColor: colors.primary,
    headerBackTitleVisible: false,
  };

  const modalScreenOptions = {
    ...defaultScreenOptions,
    presentation: 'modal',
    animation: 'slide_from_bottom',
    gestureEnabled: true,
    gestureDirection: 'vertical',
    gestureResponseDistance: 300,
  };

  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
      initialRouteName="MainTabs"
    >
      {/* Main Tab Navigator - Root Screen */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          title: 'ATM & Calendar App',
          gestureEnabled: false, // Disable swipe back on root
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;