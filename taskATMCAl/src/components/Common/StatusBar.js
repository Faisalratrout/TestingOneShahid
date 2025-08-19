import React from 'react';
import { StatusBar as RNStatusBar, Platform } from 'react-native';
import { colors } from '../../styles/colors';

const StatusBar = ({
  backgroundColor = colors.white,
  barStyle = 'dark-content', // 'dark-content', 'light-content', 'default'
  translucent = false,
  hidden = false,
  animated = true,
  networkActivityIndicatorVisible = false, // iOS only
}) => {
  // Auto-determine bar style based on background color
  const getBarStyle = () => {
    if (barStyle !== 'dark-content' && barStyle !== 'light-content') {
      // Auto-detect based on background color brightness
      const isDark = isColorDark(backgroundColor);
      return isDark ? 'light-content' : 'dark-content';
    }
    return barStyle;
  };

  // Helper function to determine if a color is dark
  const isColorDark = (color) => {
    // Simple brightness check - you might want to enhance this
    const hexColor = color.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  return (
    <RNStatusBar
      backgroundColor={Platform.OS === 'android' ? backgroundColor : undefined}
      barStyle={getBarStyle()}
      translucent={translucent}
      hidden={hidden}
      animated={animated}
      networkActivityIndicatorVisible={Platform.OS === 'ios' ? networkActivityIndicatorVisible : undefined}
    />
  );
};

// Predefined status bar configurations
const StatusBarConfigs = {
  // Light theme - dark content on light background
  light: {
    backgroundColor: colors.white,
    barStyle: 'dark-content',
  },

  // Dark theme - light content on dark background
  dark: {
    backgroundColor: colors.black,
    barStyle: 'light-content',
  },

  // Primary theme - light content on primary background
  primary: {
    backgroundColor: colors.primary,
    barStyle: 'light-content',
  },

  // Success theme
  success: {
    backgroundColor: colors.success,
    barStyle: 'light-content',
  },

  // Warning theme
  warning: {
    backgroundColor: colors.warning,
    barStyle: 'dark-content',
  },

  // Error theme
  error: {
    backgroundColor: colors.error,
    barStyle: 'light-content',
  },

  // Transparent - for overlay screens
  transparent: {
    backgroundColor: 'transparent',
    barStyle: 'light-content',
    translucent: true,
  },
};

// Convenient preset components
const LightStatusBar = (props) => (
  <StatusBar {...StatusBarConfigs.light} {...props} />
);

const DarkStatusBar = (props) => (
  <StatusBar {...StatusBarConfigs.dark} {...props} />
);

const PrimaryStatusBar = (props) => (
  <StatusBar {...StatusBarConfigs.primary} {...props} />
);

const TransparentStatusBar = (props) => (
  <StatusBar {...StatusBarConfigs.transparent} {...props} />
);

// Hook to manage status bar dynamically
export const useStatusBar = (config) => {
  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      // iOS status bar changes are handled by the StatusBar component
      return;
    }

    // Android status bar changes
    if (config.backgroundColor) {
      RNStatusBar.setBackgroundColor(config.backgroundColor, config.animated !== false);
    }
    if (config.barStyle) {
      RNStatusBar.setBarStyle(config.barStyle, config.animated !== false);
    }
    if (typeof config.translucent === 'boolean') {
      RNStatusBar.setTranslucent(config.translucent);
    }
    if (typeof config.hidden === 'boolean') {
      RNStatusBar.setHidden(config.hidden, config.animated ? 'slide' : 'none');
    }
  }, [config]);
};

// Custom hook for screen-specific status bars
export const useScreenStatusBar = (screenType = 'light') => {
  const config = StatusBarConfigs[screenType] || StatusBarConfigs.light;
  useStatusBar(config);
};

// Export preset components
StatusBar.Light = LightStatusBar;
StatusBar.Dark = DarkStatusBar;
StatusBar.Primary = PrimaryStatusBar;
StatusBar.Transparent = TransparentStatusBar;
StatusBar.Configs = StatusBarConfigs;

export default StatusBar;