import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';
import { formatUtils } from '../../utils/formatUtils';
import { validationUtils } from '../../utils/validationUtils';

const TransactionModal = ({
  visible,
  transactionType,
  currentBalance,
  onConfirm,
  onCancel,
  account
}) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      setAmount('');
      setErrors({});
    }
  }, [visible]);

  const getTransactionTitle = () => {
    return formatUtils.getTransactionTitle(transactionType);
  };

  const getTransactionIcon = () => {
    switch (transactionType) {
      case 'withdrawal':
        return 'arrow-up-outline';
      case 'deposit':
        return 'arrow-down-outline';
      case 'transfer':
        return 'swap-horizontal-outline';
      default:
        return 'card-outline';
    }
  };

  const getTransactionColor = () => {
    switch (transactionType) {
      case 'withdrawal':
        return colors.error;
      case 'deposit':
        return colors.success;
      case 'transfer':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const validateAmount = () => {
    const validation = validationUtils.validateTransactionAmount(
      amount,
      currentBalance,
      transactionType
    );

    setErrors(validation.isValid ? {} : { amount: validation.errors });
    return validation.isValid;
  };

  const handleAmountChange = (text) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setAmount(cleaned);
    
    // Clear errors when user starts typing
    if (errors.amount) {
      setErrors({});
    }
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
    setErrors({});
  };

  const handleConfirm = async () => {
    if (!validateAmount()) {
      return;
    }

    const numAmount = parseFloat(amount);
    
    Alert.alert(
      'Confirm Transaction',
      `${getTransactionTitle()} of ${formatUtils.formatCurrency(numAmount)}?\n\nCurrent Balance: ${formatUtils.formatCurrency(currentBalance)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            setIsLoading(true);
            try {
              await onConfirm(amount);
            } catch (error) {
              Alert.alert('Error', 'Transaction failed. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const getQuickAmounts = () => {
    if (transactionType === 'withdrawal') {
      return [20, 50, 100, 200].filter(amt => amt <= currentBalance);
    } else if (transactionType === 'deposit') {
      return [20, 50, 100, 500];
    }
    return [];
  };

  const quickAmounts = getQuickAmounts();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: getTransactionColor() }]}>
                <Ionicons
                  name={getTransactionIcon()}
                  size={32}
                  color={colors.white}
                />
              </View>
              <Text style={styles.title}>{getTransactionTitle()}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCancel}
              >
                <Ionicons name="close" size={24} color={colors.gray} />
              </TouchableOpacity>
            </View>

            {/* Current Balance */}
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatUtils.formatCurrency(currentBalance)}
              </Text>
            </View>

            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Enter Amount {transactionType === 'withdrawal' && `(Max: ${formatUtils.formatCurrency(currentBalance)})`}
              </Text>
              <View style={[
                styles.amountInputContainer,
                errors.amount && styles.inputError
              ]}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="decimal-pad"
                  maxLength={10}
                  selectTextOnFocus={true}
                />
              </View>
              {errors.amount && (
                <View style={styles.errorContainer}>
                  {errors.amount.map((error, index) => (
                    <Text key={index} style={styles.errorText}>
                      • {error}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            {/* Quick Amount Buttons */}
            {quickAmounts.length > 0 && (
              <View style={styles.quickAmountsContainer}>
                <Text style={styles.quickAmountsLabel}>Quick Amounts</Text>
                <View style={styles.quickAmountsGrid}>
                  {quickAmounts.map((quickAmount) => (
                    <TouchableOpacity
                      key={quickAmount}
                      style={[
                        styles.quickAmountButton,
                        amount === quickAmount.toString() && styles.quickAmountButtonSelected
                      ]}
                      onPress={() => handleQuickAmount(quickAmount)}
                    >
                      <Text style={[
                        styles.quickAmountText,
                        amount === quickAmount.toString() && styles.quickAmountTextSelected
                      ]}>
                        {formatUtils.formatCurrency(quickAmount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Transaction Preview */}
            {amount && parseFloat(amount) > 0 && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Transaction Preview</Text>
                <View style={styles.previewItem}>
                  <Text style={styles.previewKey}>{getTransactionTitle()}</Text>
                  <Text style={[
                    styles.previewValue,
                    { color: getTransactionColor() }
                  ]}>
                    {formatUtils.formatTransactionAmount(parseFloat(amount), transactionType)}
                  </Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewKey}>New Balance</Text>
                  <Text style={styles.previewValue}>
                    {formatUtils.formatCurrency(
                      transactionType === 'withdrawal'
                        ? currentBalance - parseFloat(amount)
                        : currentBalance + parseFloat(amount)
                    )}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: getTransactionColor() },
                  (!amount || parseFloat(amount) <= 0 || isLoading) && styles.confirmButtonDisabled
                ]}
                onPress={handleConfirm}
                disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              >
                <Text style={styles.confirmButtonText}>
                  {isLoading ? 'Processing...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '90%',
    ...globalStyles.shadowLarge,
  },

  scrollContent: {
    padding: spacing[5],
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
    position: 'relative',
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  title: {
    ...typography.h4,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing[2],
  },

  balanceContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[5],
  },

  balanceLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },

  balanceAmount: {
    ...typography.atmBalance,
    color: colors.textPrimary,
    fontSize: 24,
  },

  inputContainer: {
    marginBottom: spacing[5],
  },

  inputLabel: {
    ...typography.inputLabel,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },

  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing[4],
  },

  currencySymbol: {
    ...typography.atmAmount,
    color: colors.textPrimary,
    marginRight: spacing[2],
  },

  amountInput: {
    flex: 1,
    ...typography.atmAmount,
    color: colors.textPrimary,
    paddingVertical: spacing[4],
    fontSize: 24,
  },

  inputError: {
    borderColor: colors.inputError,
  },

  errorContainer: {
    marginTop: spacing[1],
  },

  errorText: {
    ...typography.inputError,
    color: colors.error,
  },

  quickAmountsContainer: {
    marginBottom: spacing[5],
  },

  quickAmountsLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },

  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },

  quickAmountButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minWidth: 80,
    alignItems: 'center',
  },

  quickAmountButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  quickAmountText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  quickAmountTextSelected: {
    color: colors.white,
  },

  previewContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[5],
  },

  previewLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },

  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  previewKey: {
    ...typography.body,
    color: colors.textSecondary,
  },

  previewValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },

  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },

  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },

  confirmButton: {
    flex: 1,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },

  confirmButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
  },

  confirmButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default TransactionModal;