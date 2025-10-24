import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Input } from '../../components/common';
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../hooks';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleSendResetLink = async () => {
    clearError();
    
    if (!validateForm()) return;

    const result = await forgotPassword(email);
    
    if (result.success) {
      setIsEmailSent(true);
      Alert.alert(
        'Reset Link Sent',
        `A password reset link has been sent to ${email}. Please check your email and follow the instructions.`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/auth/reset-password'),
          },
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to send reset link');
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const handleResendLink = () => {
    setIsEmailSent(false);
    clearError();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {isEmailSent
              ? 'Check your email for reset instructions'
              : 'Enter your email to receive a reset link'}
          </Text>
        </View>

        {!isEmailSent ? (
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <Button
              title="Send Reset Link"
              onPress={handleSendResetLink}
              loading={isLoading}
              style={styles.sendButton}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.successIcon}>📧</Text>
            </View>
            
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successMessage}>
              We&apos;ve sent a password reset link to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            
            <Text style={styles.instructionText}>
              Please check your email and click the link to reset your password.
            </Text>

            <Button
              title="Resend Link"
              onPress={handleResendLink}
              variant="outline"
              style={styles.resendButton}
            />
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.backToLoginText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  sendButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.success + '20',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  successMessage: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  instructionText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  resendButton: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  backToLoginText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '500',
  },
});