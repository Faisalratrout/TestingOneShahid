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
  Divider,
  HelperText,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../utils/theme';

interface SignupScreenProps {
  navigation: any;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUp, signInWithFacebook, signInWithGoogle, signInWithApple } = useAuth();

  const validateForm = () => {
    if (!displayName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signUp(email, password, displayName);
      Alert.alert(
        'Account Created',
        'Please check your email to verify your account before signing in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'facebook' | 'google' | 'apple') => {
    try {
      setLoading(true);
      switch (provider) {
        case 'facebook':
          await signInWithFacebook();
          break;
        case 'google':
          await signInWithGoogle();
          break;
        case 'apple':
          await signInWithApple();
          break;
      }
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = password === confirmPassword;
  const isPasswordValid = password.length >= 6;

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
            <Text variant="headlineLarge" style={styles.title}>
              Create Account
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Join us to start watching amazing content
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <TextInput
                label="Full Name"
                value={displayName}
                onChangeText={setDisplayName}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="name"
                style={styles.input}
                theme={{
                  colors: {
                    primary: colors.primary,
                    onSurfaceVariant: colors.textSecondary,
                  },
                }}
              />

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

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                theme={{
                  colors: {
                    primary: colors.primary,
                    onSurfaceVariant: colors.textSecondary,
                  },
                }}
              />
              <HelperText type="error" visible={password.length > 0 && !isPasswordValid}>
                Password must be at least 6 characters long
              </HelperText>

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                theme={{
                  colors: {
                    primary: colors.primary,
                    onSurfaceVariant: colors.textSecondary,
                  },
                }}
              />
              <HelperText type="error" visible={confirmPassword.length > 0 && !passwordsMatch}>
                Passwords do not match
              </HelperText>

              <Button
                mode="contained"
                onPress={handleSignup}
                loading={loading}
                disabled={loading}
                style={styles.signupButton}
                buttonColor={colors.primary}
                textColor={colors.background}
              >
                Create Account
              </Button>

              <Divider style={styles.divider} />

              <Text variant="bodyMedium" style={styles.socialText}>
                Or sign up with
              </Text>

              <View style={styles.socialButtons}>
                <IconButton
                  icon="facebook"
                  mode="contained"
                  onPress={() => handleSocialLogin('facebook')}
                  style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                  iconColor="white"
                />
                <IconButton
                  icon="google"
                  mode="contained"
                  onPress={() => handleSocialLogin('google')}
                  style={[styles.socialButton, { backgroundColor: '#DB4437' }]}
                  iconColor="white"
                />
                {Platform.OS === 'ios' && (
                  <IconButton
                    icon="apple"
                    mode="contained"
                    onPress={() => handleSocialLogin('apple')}
                    style={[styles.socialButton, { backgroundColor: '#000000' }]}
                    iconColor="white"
                  />
                )}
              </View>

              <View style={styles.loginPrompt}>
                <Text variant="bodyMedium" style={styles.loginText}>
                  Already have an account?{' '}
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
  title: {
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    elevation: 4,
  },
  cardContent: {
    padding: spacing.lg,
  },
  input: {
    marginBottom: spacing.xs,
    backgroundColor: colors.surfaceVariant,
  },
  signupButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  divider: {
    marginVertical: spacing.lg,
    backgroundColor: colors.textMuted,
  },
  socialText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  socialButton: {
    margin: spacing.xs,
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

export default SignupScreen;