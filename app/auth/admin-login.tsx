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
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, EyeIcon, Input } from '../components/common';
import { Colors, Typography } from '../constants';
import { useAuth } from '../hooks';

export default function AdminLoginScreen() {
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

  const handleAdminLogin = async () => {
    clearError();

    if (!validateForm()) return;

    const result = await login({ email, password, role: 'admin' });

    if (result.success) {
      await AsyncStorage.setItem('userRole', 'admin');
      router.replace('/admin/dashboard');
    } else {
      Alert.alert('Đăng nhập không thành công', result.error || 'Vui lòng thử lại với tài khoản Admin');
    }
  };

  const handleBackToWelcome = () => {
    router.back();
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
            <Text style={styles.title}>Admin Portal</Text>
            <Text style={styles.subtitle}>Đăng nhập với tài khoản quản trị viên</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Admin Email"
              value={email}
              onChangeText={setEmail}
              placeholder="admin@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <Input
              label="Admin Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu admin"
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

            <Button
              title="Đăng nhập Admin"
              onPress={handleAdminLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
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
  loginButton: {
    marginTop: 24,
    backgroundColor: Colors.danger,
  },
  errorText: {
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