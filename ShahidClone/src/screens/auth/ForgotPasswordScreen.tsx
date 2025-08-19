import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  IconButton,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../utils/theme';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setEmailSent(true);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              iconColor={colors.primary}
            />
            <Text variant="headlineLarge" style={styles.title}>
              Reset Password
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              {!emailSent ? (
                <>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={styles.input}
                    theme={{
                      colors: {
                        primary: colors.primary,
                        onSurfaceVariant: colors.textSecondary,
                      },
                    }}
                  />

                  <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    loading={loading}
                    disabled={loading}
                    style={styles.resetButton}
                    buttonColor={colors.primary}
                    textColor={colors.background}
                  >
                    Send Reset Email
                  </Button>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <IconButton
                    icon="email-check"
                    size={64}
                    iconColor={colors.success}
                    style={styles.successIcon}
                  />
                  <Text variant="headlineSmall" style={styles.successTitle}>
                    Email Sent!
                  </Text>
                  <Text variant="bodyLarge" style={styles.successText}>
                    We've sent a password reset link to {email}
                  </Text>
                </View>
              )}

              <View style={styles.loginPrompt}>
                <Text variant="bodyMedium" style={styles.loginText}>
                  Remember your password?{' '}
                </Text>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Login')}
                  textColor={colors.primary}
                  compact
                >
                  Sign In
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    elevation: 4,
  },
  cardContent: {
    padding: spacing.lg,
  },
  input: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceVariant,
  },
  resetButton: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  successText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.textSecondary,
  },
});

export default ForgotPasswordScreen;