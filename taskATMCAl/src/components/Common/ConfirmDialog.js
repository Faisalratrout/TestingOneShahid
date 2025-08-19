import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';

const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonColor = colors.primary,
  cancelButtonColor = colors.gray,
  onConfirm,
  onCancel,
  type = 'default', // 'default', 'danger', 'warning', 'success'
  icon = null,
  showIcon = true,
}) => {
  const getDialogColor = () => {
    switch (type) {
      case 'danger':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'success':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  const getDialogIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'danger':
        return 'warning-outline';
      case 'warning':
        return 'alert-circle-outline';
      case 'success':
        return 'checkmark-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const dialogColor = getDialogColor();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Icon */}
          {showIcon && (
            <View style={[styles.iconContainer, { backgroundColor: dialogColor }]}>
              <Ionicons
                name={getDialogIcon()}
                size={32}
                color={colors.white}
              />
            </View>
          )}

          {/* Title */}
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}

          {/* Message */}
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { borderColor: cancelButtonColor }
                ]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: cancelButtonColor }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: confirmButtonColor }
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },

  dialog: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    minWidth: 280,
    maxWidth: '100%',
    ...globalStyles.shadowLarge,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },

  title: {
    ...typography.h5,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },

  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[6],
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
  },

  button: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },

  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },

  confirmButton: {
    // Background color set dynamically
  },

  buttonText: {
    ...typography.button,
    fontWeight: '600',
  },

  confirmButtonText: {
    color: colors.white,
  },
});

export default ConfirmDialog;