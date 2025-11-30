import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/common';
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../hooks';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    email: typeof params.email === 'string' ? params.email : '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { resetPassword, isLoading, error, clearError } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.code) {
      newErrors.code = 'Verification code is required';
      isValid = false;
    } else if (formData.code.length < 4) {
      newErrors.code = 'Please enter the complete verification code';
      isValid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleResetPassword = async () => {
    clearError();

    if (!validateForm()) return;

    console.log('🔐 Attempting password reset for:', formData.email);
    
    const result = await resetPassword(
      formData.email,
      formData.code,
      formData.newPassword
    );

    if (result.success) {
      console.log('✅ Password reset successful:', result.data);
      
      Alert.alert(
        'Password Reset Successful! 🎉',
        result.message || 'Your password has been updated successfully. You can now login with your new password.',
        [
          {
            text: 'Go to Login',
            style: 'default',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } else {
      console.error('❌ Password reset failed:', result.error);
      
      // More specific error handling
      let title = 'Reset Failed';
      let message = result.error || 'Please try again';
      
      if (result.error?.includes('Invalid') || result.error?.includes('expired')) {
        title = 'Invalid Reset Code';
        message = 'The reset code you entered is invalid or has expired. Please request a new password reset email.';
      } else if (result.error?.includes('User not found')) {
        title = 'Account Not Found';
        message = 'No account found with this email address. Please check your email or create a new account.';
      } else if (result.error?.includes('weak') || result.error?.includes('password')) {
        title = 'Password Requirements';
        message = 'Your password doesn\'t meet the security requirements. Please ensure it has uppercase, lowercase, numbers, and is at least 8 characters.';
      }
      
      Alert.alert(title, message, [
        {
          text: 'Try Again',
          style: 'default'
        },
        {
          text: 'Request New Code',
          style: 'cancel',
          onPress: () => router.push('/auth/forgot-password')
        }
      ]);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập mã xác minh và tạo mật khẩu mới
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>
              {errors.email && <Text style={styles.fieldErrorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mã xác minh</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, errors.code && styles.inputError]}
                  value={formData.code}
                  onChangeText={(value) => handleInputChange('code', value)}
                  placeholder="Nhập mã từ email của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  keyboardType="default"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              {errors.code && <Text style={styles.fieldErrorText}>{errors.code}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <View style={[styles.inputContainer, styles.passwordContainer]}>
                <TextInput
                  style={[styles.textInput, styles.passwordInput, errors.newPassword && styles.inputError]}
                  value={formData.newPassword}
                  onChangeText={(value) => handleInputChange('newPassword', value)}
                  placeholder="Nhập mật khẩu mới của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="newPassword"
                />
                <TouchableOpacity 
                  style={styles.eyeIconContainer}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.newPassword && <Text style={styles.fieldErrorText}>{errors.newPassword}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
              <View style={[styles.inputContainer, styles.passwordContainer]}>
                <TextInput
                  style={[styles.textInput, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  placeholder="Xác nhận mật khẩu mới của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="newPassword"
                />
                <TouchableOpacity 
                  style={styles.eyeIconContainer}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>}
            </View>

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Yêu cầu về mật khẩu:</Text>
              <Text style={styles.requirementText}>• Ít nhất 8 ký tự</Text>
              <Text style={styles.requirementText}>• Một chữ cái viết hoa</Text>
              <Text style={styles.requirementText}>• Một chữ cái thường</Text>
              <Text style={styles.requirementText}>• Một số</Text>
            </View>

            <Button
              title="Đặt lại mật khẩu"
              onPress={handleResetPassword}
              loading={isLoading}
              style={styles.resetButton}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.backToLoginText}>← Quay lại Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: 8,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIconContainer: {
    padding: 12,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  fieldErrorText: {
    ...Typography.body2,
    color: Colors.danger,
    textAlign: 'left',
    marginTop: 8,
    fontSize: 14,
  },
  passwordRequirements: {
    backgroundColor: Colors.background.secondary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  requirementsTitle: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  requirementText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  resetButton: {
    marginBottom: 16,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '500',
  },
  eyeIcon: {
    fontSize: 20,
  },
});