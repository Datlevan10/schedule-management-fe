import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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
import { Button, EyeIcon } from '../../components/common';
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../hooks';
import { useDebouncedValidation, validationFunctions } from '../../hooks/useDebouncedValidation';
import {
  getSafeAreaInsets,
  isSmallDevice,
  moderateScale,
  responsiveFontSize,
  scale,
  spacing,
  verticalScale,
} from '../../utils/responsive';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, isLoading, error, clearError } = useAuth();

  // Setup debounced validation
  const { debouncedValidate: debouncedEmailValidate, clearValidation: clearEmailValidation } =
    useDebouncedValidation(validationFunctions.email, 500);
  const { debouncedValidate: debouncedPasswordValidate, clearValidation: clearPasswordValidation } =
    useDebouncedValidation(validationFunctions.password, 300);

  // Memoized handlers to prevent recreation on every render
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    // Clear error immediately if user starts typing
    if (emailError && text.length > 0) {
      setEmailError('');
    }
    // Debounced validation
    debouncedEmailValidate(text, setEmailError);
  }, [emailError, debouncedEmailValidate]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    // Clear error immediately if user starts typing
    if (passwordError && text.length > 0) {
      setPasswordError('');
    }
    // Debounced validation
    debouncedPasswordValidate(text, setPasswordError);
  }, [passwordError, debouncedPasswordValidate]);

  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Final validation for form submission
  const validateForm = useCallback(() => {
    // Clear any pending validations
    clearEmailValidation();
    clearPasswordValidation();

    const emailErr = validationFunctions.email(email);
    const passwordErr = validationFunctions.password(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    return !emailErr && !passwordErr;
  }, [email, password, clearEmailValidation, clearPasswordValidation]);

  const handleLogin = useCallback(async () => {
    clearError();

    if (!validateForm()) return;

    const result = await login({ email, password });

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Đăng nhập không thành công', result.error || 'Vui lòng thử lại');
    }
  }, [clearError, validateForm, login, email, password, router]);

  const handleForgotPassword = useCallback(() => {
    router.push('/auth/forgot-password');
  }, [router]);

  const handleSignUp = useCallback(() => {
    router.push('/auth/register');
  }, [router]);

  // Memoize style objects to prevent recreation
  const keyboardAvoidingViewStyle = useMemo(() => styles.container, []);
  const scrollViewContentStyle = useMemo(() => styles.scrollContent, []);

  return (
    <KeyboardAvoidingView
      style={keyboardAvoidingViewStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={scrollViewContentStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập vào tài khoản của bạn</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, emailError && styles.inputError]}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={[styles.inputContainer, styles.passwordContainer]}>
                <TextInput
                  style={[styles.textInput, styles.passwordInput, passwordError && styles.inputError]}
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="Nhập mật khẩu của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={handleTogglePassword}
                >
                  <EyeIcon
                    isVisible={showPassword}
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const safeAreaInsets = getSafeAreaInsets();

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
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
    paddingTop: safeAreaInsets.top + verticalScale(40),
    paddingBottom: verticalScale(40),
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  title: {
    fontSize: responsiveFontSize['4xl'],
    fontWeight: Typography.h1.fontWeight,
    lineHeight: moderateScale(Typography.h1.lineHeight),
    color: Colors.text.primary,
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: responsiveFontSize.lg,
    fontWeight: Typography.body1.fontWeight,
    lineHeight: moderateScale(Typography.body1.lineHeight),
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: responsiveFontSize.base,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: verticalScale(8),
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: scale(8),
    backgroundColor: Colors.white,
  },
  textInput: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.primary,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    minHeight: scale(48),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: scale(12),
  },
  inputError: {
    borderColor: Colors.danger,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: verticalScale(32),
    padding: scale(8),
  },
  forgotPasswordText: {
    fontSize: responsiveFontSize.base,
    fontWeight: Typography.body2.fontWeight,
    color: Colors.primary,
  },
  loginButton: {
    marginBottom: verticalScale(16),
    height: scale(48),
  },
  errorText: {
    fontSize: responsiveFontSize.sm,
    fontWeight: Typography.body2.fontWeight,
    color: Colors.danger,
    textAlign: 'left',
    marginTop: verticalScale(8),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(32),
  },
  footerText: {
    fontSize: responsiveFontSize.base,
    fontWeight: Typography.body2.fontWeight,
    color: Colors.text.secondary,
  },
  signUpText: {
    fontSize: responsiveFontSize.base,
    color: Colors.primary,
    fontWeight: '600',
  },
});