import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';

const FormInput = forwardRef(({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  autoComplete = 'off',
  disabled = false,
  required = false,
  variant = 'default', // 'default', 'outlined', 'filled'
  size = 'medium', // 'small', 'medium', 'large'
  floatingLabel = false,
  style,
  inputStyle,
  containerStyle,
  testID,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [labelAnimation] = useState(new Animated.Value(value ? 1 : 0));

  React.useEffect(() => {
    if (floatingLabel) {
      Animated.timing(labelAnimation, {
        toValue: isFocused || value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, value, floatingLabel]);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    if (containerStyle) {
      baseStyle.push(containerStyle);
    }

    return baseStyle;
  };

  const getInputContainerStyle = () => {
    const baseStyle = [styles.inputContainer];

    // Variant styles
    switch (variant) {
      case 'outlined':
        baseStyle.push(styles.outlinedInput);
        break;
      case 'filled':
        baseStyle.push(styles.filledInput);
        break;
      default:
        baseStyle.push(styles.defaultInput);
    }

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallInput);
        break;
      case 'medium':
        baseStyle.push(styles.mediumInput);
        break;
      case 'large':
        baseStyle.push(styles.largeInput);
        break;
    }

    // State styles
    if (isFocused) {
      baseStyle.push(styles.focusedInput);
    }

    if (error) {
      baseStyle.push(styles.errorInput);
    }

    if (disabled) {
      baseStyle.push(styles.disabledInput);
    }

    return baseStyle;
  };

  const getTextInputStyle = () => {
    const baseStyle = [styles.textInput];

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallTextInput);
        break;
      case 'medium':
        baseStyle.push(styles.mediumTextInput);
        break;
      case 'large':
        baseStyle.push(styles.largeTextInput);
        break;
    }

    if (multiline) {
      baseStyle.push(styles.multilineTextInput);
    }

    if (floatingLabel && (isFocused || value)) {
      baseStyle.push(styles.floatingLabelInput);
    }

    if (inputStyle) {
      baseStyle.push(inputStyle);
    }

    return baseStyle;
  };

  const renderFloatingLabel = () => {
    if (!floatingLabel) return null;

    const labelStyle = {
      position: 'absolute',
      left: leftIcon ? 48 : spacing[3],
      fontSize: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),
      top: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [size === 'large' ? 20 : size === 'small' ? 12 : 16, 8],
      }),
      color: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.inputPlaceholder, isFocused ? colors.inputFocus : colors.textSecondary],
      }),
    };

    return (
      <Animated.Text style={labelStyle}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Animated.Text>
    );
  };

  const renderStaticLabel = () => {
    if (floatingLabel) return null;

    return (
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    );
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={rightIcon}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {/* Static Label */}
      {label && renderStaticLabel()}

      {/* Input Container */}
      <View style={getInputContainerStyle()}>
        {/* Floating Label */}
        {renderFloatingLabel()}

        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons
              name={leftIcon}
              size={20}
              color={colors.textSecondary}
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={ref}
          style={getTextInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={floatingLabel ? undefined : placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
          {...props}
        />

        {/* Right Icon */}
        {renderRightIcon()}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={colors.error}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}

      {/* Character Count */}
      {maxLength && value && (
        <Text style={[
          styles.characterCount,
          value.length > maxLength * 0.9 && styles.characterCountWarning,
          value.length >= maxLength && styles.characterCountError,
        ]}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },

  label: {
    ...typography.inputLabel,
    color: colors.textPrimary,
    marginBottom: spacing[1],
    fontWeight: '500',
  },

  required: {
    color: colors.error,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.input,
    position: 'relative',
  },

  // Variant styles
  defaultInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },

  outlinedInput: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.inputBorder,
  },

  filledInput: {
    backgroundColor: colors.surface,
    borderWidth: 0,
  },

  // Size styles
  smallInput: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    minHeight: 36,
  },

  mediumInput: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    minHeight: 48,
  },

  largeInput: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    minHeight: 56,
  },

  // State styles
  focusedInput: {
    borderColor: colors.inputFocus,
    borderWidth: 2,
  },

  errorInput: {
    borderColor: colors.inputError,
    borderWidth: 2,
  },

  disabledInput: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },

  // Text Input
  textInput: {
    flex: 1,
    ...typography.input,
    color: colors.textPrimary,
    paddingVertical: 0,
  },

  smallTextInput: {
    fontSize: typography.bodySmall.fontSize,
  },

  mediumTextInput: {
    fontSize: typography.body.fontSize,
  },

  largeTextInput: {
    fontSize: typography.bodyLarge.fontSize,
  },

  multilineTextInput: {
    textAlignVertical: 'top',
    paddingTop: spacing[1],
  },

  floatingLabelInput: {
    paddingTop: spacing[3],
  },

  // Icons
  leftIconContainer: {
    marginRight: spacing[2],
  },

  iconButton: {
    padding: spacing[1],
    marginLeft: spacing[2],
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },

  errorIcon: {
    marginRight: spacing[1],
  },

  errorText: {
    ...typography.captionSmall,
    color: colors.error,
    flex: 1,
  },

  // Helper Text
  helperText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },

  // Character Count
  characterCount: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing[1] / 2,
  },

  characterCountWarning: {
    color: colors.warning,
  },

  characterCountError: {
    color: colors.error,
  },
});

FormInput.displayName = 'FormInput';

export default FormInput;