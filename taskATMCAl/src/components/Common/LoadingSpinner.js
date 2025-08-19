import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing, borderRadius } from '../../styles/spacing';
import { globalStyles } from '../../styles/globalStyles';

const LoadingSpinner = ({
  visible = false,
  message = 'Loading...',
  size = 'large', // 'small', 'large'
  color = colors.primary,
  overlay = false,
  transparent = false,
  style,
  containerStyle,
}) => {
  // If overlay mode, render as modal
  if (overlay) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.overlayContainer}>
          <View style={[
            styles.overlayContent,
            transparent && styles.transparentOverlay
          ]}>
            <ActivityIndicator
              size={size}
              color={color}
              style={styles.spinner}
            />
            {message && (
              <Text style={[
                styles.overlayMessage,
                transparent && styles.transparentMessage
              ]}>
                {message}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  // Regular inline spinner
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.content, style]}>
        <ActivityIndicator
          size={size}
          color={color}
          style={styles.spinner}
        />
        {message && (
          <Text style={styles.message}>{message}</Text>
        )}
      </View>
    </View>
  );
};

// Loading component for full screen loading
const FullScreenLoader = ({ visible, message }) => (
  <LoadingSpinner
    visible={visible}
    message={message}
    overlay={true}
    size="large"
  />
);

// Loading component for inline/card loading
const InlineLoader = ({ visible, message, size = 'small' }) => (
  <LoadingSpinner
    visible={visible}
    message={message}
    overlay={false}
    size={size}
  />
);

// Loading component for transparent overlay
const TransparentLoader = ({ visible, message }) => (
  <LoadingSpinner
    visible={visible}
    message={message}
    overlay={true}
    transparent={true}
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  overlayContainer: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },

  overlayContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    minWidth: 120,
    maxWidth: '80%',
    ...globalStyles.shadowLarge,
  },

  transparentOverlay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },

  spinner: {
    marginBottom: spacing[3],
  },

  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing[2],
  },

  overlayMessage: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },

  transparentMessage: {
    color: colors.white,
    textShadowColor: colors.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontWeight: 'bold',
  },
});

// Export additional variants
LoadingSpinner.FullScreen = FullScreenLoader;
LoadingSpinner.Inline = InlineLoader;
LoadingSpinner.Transparent = TransparentLoader;

export default LoadingSpinner;