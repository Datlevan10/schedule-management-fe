import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/common';
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
      setEmailError('Email là bắt buộc');
      return false;
    }

    if (!validateEmail(email)) {
      setEmailError('Vui lòng nhập email hợp lệ');
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
      console.log('📧 Đã gửi email đặt lại thành công:', result.data);

      const message = result.message || `Liên kết đặt lại mật khẩu đã được gửi đến ${email}. Vui lòng kiểm tra email của bạn và làm theo hướng dẫn.`;

      Alert.alert(
        'Đã gửi liên kết đặt lại',
        message,
        [
          {
            text: 'Kiểm tra Email',
            style: 'default',
            onPress: () => {
              // User can check email, keep them on this screen
            },
          },
          {
            text: 'Nhập mã đặt lại',
            onPress: () => router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`),
          },
        ]
      );
    } else {
      console.error('❌ Failed to send reset email:', result.error);

      // More specific error handling
      let title = 'Gửi email không thành công';
      let message = result.error || 'Không gửi được liên kết đặt lại';

      if (result.error?.includes('not found') || result.error?.includes('User not found')) {
        title = 'Không tìm thấy email';
        message = 'Không tìm thấy tài khoản nào có địa chỉ email này. Vui lòng kiểm tra email hoặc tạo tài khoản mới.';
      } else if (result.error?.includes('too many') || result.error?.includes('rate limit')) {
        title = 'Quá nhiều yêu cầu';
        message = 'Bạn đã yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng đợi vài phút trước khi thử lại.';
      }

      Alert.alert(title, message);
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
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>
            {isEmailSent
              ? 'Kiểm tra email của bạn để biết hướng dẫn thiết lập lại'
              : 'Nhập email của bạn để nhận liên kết đặt lại'}
          </Text>
        </View>

        {!isEmailSent ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, emailError && styles.inputError]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Nhập địa chỉ email của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>
              {emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}
            </View>

            <Button
              title="Gửi liên kết đặt lại"
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
              Chúng tôi đã gửi mã xác nhận đặt lại mật khẩu tới{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            <Text style={styles.instructionText}>
              Vui lòng kiểm tra email của bạn và sử dụng mã xác nhận để đặt lại mật khẩu. Mã sẽ hết hạn sau 15 phút.
            </Text>

            <View style={styles.resendContainer}>
              <Button
                title="Resend Code"
                onPress={handleResendLink}
                variant="outline"
                style={styles.resendButton}
              />
              <Button
                title="Enter Reset Code"
                onPress={() => router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)}
                style={styles.enterCodeButton}
              />
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.backToLoginText}>← Quay lại Đăng nhập</Text>
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  textInput: {
    fontSize: 16,
    color: Colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  fieldErrorText: {
    ...Typography.body2,
    color: Colors.danger,
    textAlign: 'left',
    marginTop: 8,
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
  resendContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  resendButton: {
    flex: 1,
  },
  enterCodeButton: {
    flex: 1,
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