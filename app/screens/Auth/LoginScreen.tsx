import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, EyeIcon, Input } from '../../components/common';
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../hooks';
import { 
  scale, 
  verticalScale, 
  moderateScale,
  responsiveFontSize,
  spacing,
  getSafeAreaInsets,
  isSmallDevice,
} from '../../utils/responsive';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, isLoading, error, clearError } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError('Email là bắt buộc');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Vui lòng nhập email hợp lệ');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Mật khẩu là bắt buộc');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    clearError();

    if (!validateForm()) return;

    const result = await login({ email, password });

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Đăng nhập không thành công', result.error || 'Vui lòng thử lại');
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập vào tài khoản của bạn</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập email của bạn"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu của bạn"
              secureTextEntry={!showPassword}
              error={passwordError}
              rightIcon={
                <EyeIcon
                  isVisible={showPassword}
                  color={Colors.text.secondary}
                />
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

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
    textAlign: 'center',
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