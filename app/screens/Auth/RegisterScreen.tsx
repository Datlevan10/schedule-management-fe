import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { ProfessionsAPI, type Profession } from '../../api/professions.api';
import { Button, Input, Select } from '../../components/common';
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../hooks';

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

  const { register, isLoading, error, clearError } = useAuth();

  const professionLevelOptions = [
    { label: 'Student', value: 'student' },
    { label: 'Resident', value: 'resident' },
    { label: 'Junior', value: 'junior' },
    { label: 'Senior', value: 'senior' },
    { label: 'Expert', value: 'expert' },
  ];

  useEffect(() => {
    fetchProfessions();
  }, []);

  const fetchProfessions = async () => {
    try {
      setLoadingProfessions(true);
      const response = await ProfessionsAPI.getAll();
      setProfessions(response.data);
    } catch (error) {
      console.error('Failed to fetch professions:', error);
      Alert.alert('Error', 'Failed to load professions. Please try again.');
    } finally {
      setLoadingProfessions(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
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
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!formData.professionId) {
      newErrors.professionId = 'Profession is required';
      isValid = false;
    }

    if (!formData.professionLevel) {
      newErrors.professionLevel = 'Profession level is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async () => {
    clearError();

    if (!validateForm()) return;

    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      profession_id: formData.professionId,
      profession_level: formData.professionLevel,
      workplace: formData.workplace || undefined,
      department: formData.department || undefined,
    };

    const result = await register(registrationData);

    if (result.success) {
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/schedule'),
          },
        ]
      );
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again');
    }
  };

  const handleSignIn = () => {
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to manage your schedule</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={errors.name}
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Create a strong password"
              secureTextEntry={!showPassword}
              error={errors.password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '🙈' : '👁'}
                  </Text>
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              error={errors.confirmPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? '🙈' : '👁'}
                  </Text>
                </TouchableOpacity>
              }
            />

            <Select
              label="Profession"
              placeholder="Select your profession"
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
              label="Profession Level"
              placeholder="Select your level"
              options={professionLevelOptions}
              value={formData.professionLevel}
              onValueChange={(value) => handleInputChange('professionLevel', value as ProfessionLevel)}
              error={errors.professionLevel}
            />

            <Input
              label="Workplace (Optional)"
              value={formData.workplace}
              onChangeText={(value) => handleInputChange('workplace', value)}
              placeholder="Enter your workplace"
              autoCapitalize="words"
              error={errors.workplace}
            />

            <Input
              label="Department (Optional)"
              value={formData.department}
              onChangeText={(value) => handleInputChange('department', value)}
              placeholder="Enter your department"
              autoCapitalize="words"
              error={errors.department}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInText}>Sign In</Text>
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
  },
  form: {
    flex: 1,
  },
  registerButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  signInText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
  },
  eyeIcon: {
    fontSize: 20,
  },
});