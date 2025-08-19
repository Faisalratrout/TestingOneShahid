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
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../utils/theme';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signInWithFacebook, signInWithGoogle, signInWithApple } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      // Navigation is handled automatically by the auth state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
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
      Alert.alert('Login Failed', error.message);
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
            <Text variant="headlineLarge" style={styles.title}>
              Welcome Back
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Sign in to continue watching
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
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

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                buttonColor={colors.primary}
                textColor={colors.background}
              >
                Sign In
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotButton}
                textColor={colors.primary}
              >
                Forgot Password?
              </Button>

              <Divider style={styles.divider} />

              <Text variant="bodyMedium" style={styles.socialText}>
                Or continue with
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

              <View style={styles.signupPrompt}>
                <Text variant="bodyMedium" style={styles.signupText}>
                  Don't have an account?{' '}
                </Text>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Signup')}
                  textColor={colors.primary}
                  compact
                >
                  Sign Up
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
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  loginButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  forgotButton: {
    alignSelf: 'center',
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
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: colors.textSecondary,
  },
});

export default LoginScreen;