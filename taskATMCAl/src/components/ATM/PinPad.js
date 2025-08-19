import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';
import { formatUtils } from '../../utils/formatUtils';
import { validationUtils } from '../../utils/validationUtils';

const PinPad = ({ onSubmit, maxLength = 6, title = "Enter PIN", showPin = false }) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const handleNumberPress = (number) => {
    if (pin.length < maxLength) {
      const newPin = pin + number.toString();
      setPin(newPin);
      
      // Haptic feedback
      if (Vibration) {
        Vibration.vibrate(50);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      
      if (Vibration) {
        Vibration.vibrate(50);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    
    if (Vibration) {
      Vibration.vibrate(100);
    }
  };

  const handleSubmit = async () => {
    if (pin.length === 0) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    const validation = validationUtils.validatePIN(pin);
    if (!validation.isValid) {
      Alert.alert('Invalid PIN', validation.errors[0]);
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await onSubmit(pin);
      
      if (!success) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          Alert.alert(
            'Account Locked',
            'Too many incorrect attempts. Please contact your bank.',
            [{ text: 'OK', onPress: () => setPin('') }]
          );
        } else {
          Alert.alert(
            'Incorrect PIN',
            `Please try again. ${maxAttempts - newAttempts} attempts remaining.`,
            [{ text: 'OK', onPress: () => setPin('') }]
          );
        }
        
        if (Vibration) {
          Vibration.vibrate([100, 50, 100]);
        }
      } else {
        setAttempts(0);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPinDisplay = () => {
    const displayChars = Array.from({ length: maxLength }, (_, index) => {
      if (index < pin.length) {
        return showPin ? pin[index] : '•';
      }
      return '';
    });

    return (
      <View style={styles.pinDisplay}>
        {displayChars.map((char, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length && styles.pinDotFilled
            ]}
          >
            {showPin && char && (
              <Text style={styles.pinChar}>{char}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderNumberButton = (number) => (
    <TouchableOpacity
      key={number}
      style={[
        styles.numberButton,
        isLoading && styles.buttonDisabled
      ]}
      onPress={() => handleNumberPress(number)}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <Text style={styles.numberButtonText}>{number}</Text>
    </TouchableOpacity>
  );

  const numbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['clear', 0, 'backspace']
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {attempts > 0 && (
            <Text style={styles.attemptsText}>
              {maxAttempts - attempts} attempts remaining
            </Text>
          )}
        </Text>
      </View>

      {/* PIN Display */}
      {renderPinDisplay()}

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, colIndex) => {
              if (item === 'clear') {
                return (
                  <TouchableOpacity
                    key="clear"
                    style={[
                      styles.actionButton,
                      isLoading && styles.buttonDisabled
                    ]}
                    onPress={handleClear}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>CLEAR</Text>
                  </TouchableOpacity>
                );
              } else if (item === 'backspace') {
                return (
                  <TouchableOpacity
                    key="backspace"
                    style={[
                      styles.actionButton,
                      isLoading && styles.buttonDisabled
                    ]}
                    onPress={handleBackspace}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                );
              } else {
                return renderNumberButton(item);
              }
            })}
          </View>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          pin.length === 0 && styles.submitButtonDisabled,
          isLoading && styles.buttonDisabled
        ]}
        onPress={handleSubmit}
        disabled={pin.length === 0 || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Ionicons
              name="hourglass-outline"
              size={20}
              color={colors.white}
            />
            <Text style={styles.submitButtonText}>Verifying...</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>ENTER</Text>
        )}
      </TouchableOpacity>

      {/* Security Note */}
      <View style={styles.securityNote}>
        <Ionicons
          name="shield-checkmark-outline"
          size={16}
          color={colors.textSecondary}
        />
        <Text style={styles.securityText}>
          Your PIN is encrypted and secure
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    margin: spacing[4],
    ...globalStyles.shadow,
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },

  title: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },

  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  attemptsText: {
    color: colors.error,
    fontWeight: '500',
  },

  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
    gap: spacing[3],
  },

  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.borderMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  pinChar: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },

  numberPad: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },

  numberRow: {
    flexDirection: 'row',
    marginBottom: spacing[2],
    gap: spacing[3],
  },

  numberButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...globalStyles.shadowSmall,
  },

  numberButtonText: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },

  actionButtonText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 10,
  },

  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    minHeight: 50,
  },

  submitButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
  },

  submitButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },

  securityText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default PinPad;