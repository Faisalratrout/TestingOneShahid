import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { colors, spacing } from '../utils/theme';

interface SocialButtonProps {
  provider: 'facebook' | 'google' | 'apple';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  loading = false,
  disabled = false,
  style,
}) => {
  const getButtonConfig = () => {
    switch (provider) {
      case 'facebook':
        return {
          icon: 'facebook',
          backgroundColor: '#1877F2',
          label: 'Continue with Facebook',
        };
      case 'google':
        return {
          icon: 'google',
          backgroundColor: '#DB4437',
          label: 'Continue with Google',
        };
      case 'apple':
        return {
          icon: 'apple',
          backgroundColor: '#000000',
          label: 'Continue with Apple',
        };
      default:
        return {
          icon: 'account',
          backgroundColor: colors.primary,
          label: 'Continue',
        };
    }
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <IconButton
        icon={config.icon}
        size={20}
        iconColor="white"
        style={styles.icon}
      />
      <Text variant="bodyMedium" style={styles.label}>
        {loading ? 'Please wait...' : config.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.xs,
    minHeight: 48,
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    margin: 0,
    marginRight: spacing.sm,
  },
  label: {
    color: 'white',
    fontWeight: '500',
  },
});

export default SocialButton;