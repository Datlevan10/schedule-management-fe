import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
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
import { AdminAPI } from '../api/admin.api';
import { Button, EyeIcon } from '../components/common';
import { Colors, Typography } from '../constants';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleAdminLogin = async () => {
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('🔐 Attempting admin login with:', email);
      const result = await AdminAPI.login({ email, password });

      if (result.success) {
        console.log('✅ Admin login successful:', result.data.admin.name);

        // Store admin role for app state
        await AsyncStorage.setItem('userRole', 'admin');

        // For web, navigate directly without alert for better UX
        if (Platform.OS === 'web') {
          console.log('🌐 Web platform detected, navigating directly to dashboard...');
          console.log('🔄 Current URL:', window.location.href);
          
          // Add a small delay to ensure storage is set
          setTimeout(() => {
            console.log('📍 Navigating to /admin/dashboard...');
            try {
              // Try using push for debugging
              router.push('/admin/dashboard');
              console.log('✅ Navigation command sent');
            } catch (navError) {
              console.error('❌ Navigation error:', navError);
              // Fallback: try direct window navigation for web
              if (typeof window !== 'undefined') {
                console.log('🔄 Fallback: Using window.location');
                window.location.href = '/admin/dashboard';
              }
            }
          }, 100);
        } else {
          Alert.alert(
            'Đăng nhập thành công',
            `Chào mừng ${result.data.admin.name}!`,
            [{ text: 'OK', onPress: () => router.replace('/admin/dashboard') }]
          );
        }
      } else {
        setError('Đăng nhập không thành công');
      }
    } catch (error: any) {
      console.error('❌ Admin login failed:', error);

      let errorMessage = 'Đăng nhập không thành công';

      if (error.response?.status === 401) {
        errorMessage = 'Email hoặc mật khẩu không đúng';
      } else if (error.response?.status === 403) {
        errorMessage = 'Tài khoản không có quyền admin';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Không thể kết nối đến máy chủ';
      }

      setError(errorMessage);
      Alert.alert('Lỗi đăng nhập', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    router.replace('/welcome');
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
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
            <Text style={styles.title}>Cổng thông tin quản trị</Text>
            <Text style={styles.subtitle}>Đăng nhập với tài khoản quản trị viên</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Admin Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, emailError && styles.inputError]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="admin@example.com"
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
              <Text style={styles.label}>Mật khẩu quản trị viên</Text>
              <View style={[styles.inputContainer, styles.passwordContainer]}>
                <TextInput
                  style={[styles.textInput, styles.passwordInput, passwordError && styles.inputError]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Nhập mật khẩu admin"
                  placeholderTextColor={Colors.text.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon
                    isVisible={showPassword}
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
            </View>

            <Button
              title="Đăng nhập Admin"
              onPress={handleAdminLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            {error && (
              <Text style={styles.generalErrorText}>{error}</Text>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleBackToWelcome}>
              <Text style={styles.backText}>← Quay lại màn hình chính</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Khu vực này chỉ dành cho quản trị viên được ủy quyền
            </Text>
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
    marginBottom: 40,
  },
  adminBadge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  adminBadgeText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
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
  eyeIcon: {
    padding: 12,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: Colors.danger,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.danger,
    textAlign: 'left',
    marginTop: 8,
    fontSize: 14,
  },
  generalErrorText: {
    ...Typography.body2,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  backText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});