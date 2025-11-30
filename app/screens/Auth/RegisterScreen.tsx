import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { ProfessionsAPI, type Profession } from '../../api/professions.api';
import { Button, EyeIcon, Select } from '../../components/common';
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

type ProfessionLevel = 'student' | 'resident' | 'junior' | 'senior' | 'expert';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    professionId: 0,
    professionLevel: '' as ProfessionLevel,
    workplace: '',
    department: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loadingProfessions, setLoadingProfessions] = useState(true);

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    professionId: '',
    professionLevel: '',
    workplace: '',
    department: '',
  });

  // Setup debounced validation
  const { debouncedValidate: debouncedNameValidate } =
    useDebouncedValidation(validationFunctions.name, 300);
  const { debouncedValidate: debouncedEmailValidate } =
    useDebouncedValidation(validationFunctions.email, 500);
  const { debouncedValidate: debouncedPasswordValidate } =
    useDebouncedValidation(validationFunctions.password, 300);

  const { register, isLoading, error, clearError } = useAuth();

  const professionLevelOptions = [
    { label: 'Student', value: 'student' },
    { label: 'Resident', value: 'resident' },
    { label: 'Junior', value: 'junior' },
    { label: 'Senior', value: 'senior' },
    { label: 'Expert', value: 'expert' },
  ];

  const fetchProfessions = useCallback(async () => {
    try {
      setLoadingProfessions(true);
      const response = await ProfessionsAPI.getAll();
      setProfessions(response.data);
    } catch (error) {
      console.error('Failed to fetch professions:', error);

      // Provide fallback professions if API fails - matching real API structure
      const fallbackProfessions: Profession[] = [
        {
          id: 1,
          name: 'student',
          display_name: 'Student',
          description: 'Academic students from all levels',
          default_categories: ['Exams', 'Assignments', 'Classes', 'Study Groups', 'Projects'],
          default_priorities: { exam: 5, assignment: 4, class: 3, study: 2, social: 1 },
          ai_keywords: ['exam', 'test', 'assignment', 'homework', 'class', 'lecture', 'study'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'doctor',
          display_name: 'Doctor / Medical Professional',
          description: 'Medical doctors and healthcare professionals',
          default_categories: ['Surgery', 'Consultations', 'Rounds', 'Emergency', 'Research'],
          default_priorities: { emergency: 5, surgery: 5, consultation: 4, rounds: 3, research: 2 },
          ai_keywords: ['surgery', 'patient', 'consultation', 'emergency', 'rounds', 'appointment'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: 'teacher',
          display_name: 'Teacher / Educator',
          description: 'Teachers and educational professionals',
          default_categories: ['Classes', 'Lesson Planning', 'Grading', 'Meetings', 'Training'],
          default_priorities: { class: 5, meeting: 4, grading: 3, planning: 2, training: 2 },
          ai_keywords: ['class', 'lesson', 'grade', 'meeting', 'parent', 'student', 'curriculum'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 4,
          name: 'engineer',
          display_name: 'Engineer / Technical Professional',
          description: 'Engineers and technical professionals',
          default_categories: ['Development', 'Meetings', 'Testing', 'Documentation', 'Research'],
          default_priorities: { deadline: 5, meeting: 4, development: 3, testing: 3, documentation: 2 },
          ai_keywords: ['code', 'development', 'meeting', 'deadline', 'testing', 'review'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 5,
          name: 'business',
          display_name: 'Business Professional',
          description: 'Business professionals and managers',
          default_categories: ['Meetings', 'Presentations', 'Negotiations', 'Planning', 'Travel'],
          default_priorities: { client: 5, presentation: 4, meeting: 3, planning: 2, travel: 2 },
          ai_keywords: ['meeting', 'client', 'presentation', 'negotiation', 'deal', 'proposal'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      setProfessions(fallbackProfessions);

      // Show a more user-friendly error message with retry option
      Alert.alert(
        'Connection Issue',
        'Unable to connect to server. Using offline profession list. Please check your internet connection.',
        [
          { text: 'Use Offline List', style: 'cancel' },
          { text: 'Retry', onPress: () => fetchProfessions() }
        ]
      );
    } finally {
      setLoadingProfessions(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessions();
  }, [fetchProfessions]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    console.log('🔍 Starting form validation');
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      professionId: '',
      professionLevel: '',
      workplace: '',
      department: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Tên là bắt buộc';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Vui lòng nhập email hợp lệ';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu của bạn';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
      isValid = false;
    }

    if (!formData.professionId) {
      newErrors.professionId = 'Nghề nghiệp là bắt buộc';
      isValid = false;
    }

    if (!formData.professionLevel) {
      newErrors.professionLevel = 'Trình độ chuyên môn là bắt buộc';
      isValid = false;
    }

    setErrors(newErrors);
    console.log('🔍 Validation errors:', newErrors);
    console.log('🔍 Validation result:', isValid);
    return isValid;
  };

  // Memoized handlers for better performance
  const handleNameChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, name: text }));
    if (errors.name && text.length > 0) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
    debouncedNameValidate(text, (error) => {
      setErrors(prev => ({ ...prev, name: error }));
    });
  }, [errors.name, debouncedNameValidate]);

  const handleEmailChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, email: text }));
    if (errors.email && text.length > 0) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    debouncedEmailValidate(text, (error) => {
      setErrors(prev => ({ ...prev, email: error }));
    });
  }, [errors.email, debouncedEmailValidate]);

  const handlePasswordChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, password: text }));
    if (errors.password && text.length > 0) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    debouncedPasswordValidate(text, (error) => {
      setErrors(prev => ({ ...prev, password: error }));
    });
  }, [errors.password, debouncedPasswordValidate]);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, confirmPassword: text }));
    if (errors.confirmPassword && text.length > 0) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
    // Validate confirm password immediately when it changes
    if (text && formData.password) {
      const error = validationFunctions.confirmPassword(formData.password, text);
      setErrors(prev => ({ ...prev, confirmPassword: error }));
    }
  }, [errors.confirmPassword, formData.password]);

  const handleInputChange = useCallback((field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleToggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const handleRegister = async () => {
    console.log('📝 Register button clicked');
    console.log('📝 Form data:', formData);
    
    clearError();

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed');

    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      profession_id: formData.professionId,
      profession_level: formData.professionLevel,
      workplace: formData.workplace || undefined,
      department: formData.department || undefined,
      work_schedule: ["morning", "evening"],
      work_habits: ["teamwork", "punctual"],
      notification_preferences: {
        email_notifications: true,
        push_notifications: true,
        reminder_advance_minutes: [15, 60, 1440]
      }
    };

    console.log('🚀 Calling register API with data:', registrationData);
    const result = await register(registrationData);
    console.log('📥 Register API result:', result);

    if (result.success) {
      Alert.alert(
        'Đăng ký thành công',
        'Tài khoản của bạn đã được tạo thành công!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } else {
      Alert.alert('Đăng ký không thành công', result.error || 'Vui lòng thử lại');
    }
  };

  const handleSignIn = useCallback(() => {
    router.push('/auth/login');
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
        nestedScrollEnabled={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Tham gia cùng chúng tôi để quản lý lịch trình của bạn</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên đầy đủ</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={handleNameChange}
                  placeholder="Nhập tên đầy đủ của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  textContentType="name"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, errors.email && styles.inputError]}
                  value={formData.email}
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
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, styles.passwordContainer]}>
                <TextInput
                  style={[styles.textInput, styles.passwordInput, errors.password && styles.inputError]}
                  value={formData.password}
                  onChangeText={handlePasswordChange}
                  placeholder="Tạo mật khẩu mạnh"
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
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View style={[styles.inputContainer, styles.passwordContainer]}>
                <TextInput
                  style={[styles.textInput, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                  value={formData.confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  placeholder="Xác nhận mật khẩu của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={handleToggleConfirmPassword}
                >
                  <EyeIcon
                    isVisible={showConfirmPassword}
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <Select
              label="Nghề nghiệp"
              placeholder="Chọn nghề nghiệp của bạn"
              options={professions.map(p => ({
                label: p.display_name,
                value: p.id
              }))}
              value={formData.professionId}
              onValueChange={(value) => handleInputChange('professionId', value)}
              error={errors.professionId}
              disabled={loadingProfessions}
            />

            <Select
              label="Trình độ nghề nghiệp"
              placeholder="Chọn cấp độ của bạn"
              options={professionLevelOptions}
              value={formData.professionLevel}
              onValueChange={(value) => handleInputChange('professionLevel', value as ProfessionLevel)}
              error={errors.professionLevel}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nơi làm việc (Tùy chọn)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, errors.workplace && styles.inputError]}
                  value={formData.workplace}
                  onChangeText={(value) => handleInputChange('workplace', value)}
                  placeholder="Nhập nơi làm việc của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  autoCapitalize="words"
                />
              </View>
              {errors.workplace && <Text style={styles.errorText}>{errors.workplace}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Khoa (Tùy chọn)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, errors.department && styles.inputError]}
                  value={formData.department}
                  onChangeText={(value) => handleInputChange('department', value)}
                  placeholder="Nhập khoa của bạn"
                  placeholderTextColor={Colors.text.placeholder}
                  autoCapitalize="words"
                />
              </View>
              {errors.department && <Text style={styles.errorText}>{errors.department}</Text>}
            </View>

            <Button
              title="Tạo tài khoản"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInText}>Đăng nhập</Text>
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
    marginBottom: verticalScale(32),
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
  registerButton: {
    marginTop: verticalScale(24),
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
    marginTop: verticalScale(24),
  },
  footerText: {
    fontSize: responsiveFontSize.base,
    fontWeight: Typography.body2.fontWeight,
    color: Colors.text.secondary,
  },
  signInText: {
    fontSize: responsiveFontSize.base,
    color: Colors.primary,
    fontWeight: '600',
  },
});