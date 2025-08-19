import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';

const FormButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger', 'success'
  size = 'medium', // 'small', 'medium', 'large'
  fullWidth = true,
  icon = null,
  iconPosition = 'left', // 'left', 'right'
  loadingText = 'Please wait...',
  style,
  textStyle,
  testID,
  accessibilityLabel,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostButton);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButton);
        break;
      case 'success':
        baseStyle.push(styles.successButton);
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'medium':
        baseStyle.push(styles.mediumButton);
        break;
      case 'large':
        baseStyle.push(styles.largeButton);
        break;
    }

    // State styles
    if (disabled || loading) {
      baseStyle.push(styles.disabledButton);
    }

    if (fullWidth) {
      baseStyle.push(styles.fullWidthButton);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];
    
    // Variant text styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButtonText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButtonText);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButtonText);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostButtonText);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButtonText);
        break;
      case 'success':
        baseStyle.push(styles.successButtonText);
        break;
    }

    // Size text styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButtonText);
        break;
      case 'medium':
        baseStyle.push(styles.mediumButtonText);
        break;
      case 'large':
        baseStyle.push(styles.largeButtonText);
        break;
    }

    // State text styles
    if (disabled || loading) {
      baseStyle.push(styles.disabledButtonText);
    }

    return baseStyle;
  };

  const getIconColor = () => {
    if (disabled || loading) return colors.textDisabled;
    
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'success':
      case 'secondary':
        return colors.white;
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.white;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const renderIcon = () => {
    if (!icon || loading) return null;
    
    return (
      <Ionicons
        name={icon}
        size={getIconSize()}
        color={getIconColor()}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size={size === 'large' ? 'small' : 'small'}
            color={getIconColor()}
            style={styles.loadingSpinner}
          />
          <Text style={[getTextStyle(), textStyle]}>
            {loadingText}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {iconPosition === 'left' && renderIcon()}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        {iconPosition === 'right' && renderIcon()}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
      }}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...globalStyles.shadowSmall,
  },

  // Variant styles
  primaryButton: {
    backgroundColor: colors.primary,
  },

  secondaryButton: {
    backgroundColor: colors.secondary,
  },

  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },

  ghostButton: {
    backgroundColor: 'transparent',
  },

  dangerButton: {
    backgroundColor: colors.error,
  },

  successButton: {
    backgroundColor: colors.success,
  },

  // Size styles
  smallButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minHeight: 36,
  },

  mediumButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    minHeight: 48,
  },

  largeButton: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    minHeight: 56,
  },

  // State styles
  disabledButton: {
    backgroundColor: colors.buttonDisabled,
    borderColor: colors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },

  fullWidthButton: {
    width: '100%',
  },

  // Text styles
  buttonText: {
    ...typography.button,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  primaryButtonText: {
    color: colors.white,
  },

  secondaryButtonText: {
    color: colors.white,
  },

  outlineButtonText: {
    color: colors.primary,
  },

  ghostButtonText: {
    color: colors.primary,
  },

  dangerButtonText: {
    color: colors.white,
  },

  successButtonText: {
    color: colors.white,
  },

  // Size text styles
  smallButtonText: {
    fontSize: 14,
  },

  mediumButtonText: {
    fontSize: 16,
  },

  largeButtonText: {
    fontSize: 18,
  },

  // State text styles
  disabledButtonText: {
    color: colors.textDisabled,
  },

  // Content layout
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingSpinner: {
    marginRight: spacing[2],
  },

  iconLeft: {
    marginRight: spacing[2],
  },

  iconRight: {
    marginLeft: spacing[2],
  },
});

export default FormButton;