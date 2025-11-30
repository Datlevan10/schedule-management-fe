import api from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  profession_id: number;
  profession_level: 'student' | 'resident' | 'junior' | 'senior' | 'expert';
  workplace?: string;
  department?: string;
  work_schedule?: any;
  work_habits?: any;
}

export interface Profession {
  id: number;
  name: string;
  display_name: string;
  level?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  reminder_advance_minutes: number[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  email_verified_at: string | null;
  profession?: Profession;
  workplace?: string;
  department?: string;
  work_schedule?: string[];
  work_habits?: string[];
  notification_preferences?: NotificationPreferences;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member_since?: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    expires_in: number;
    sent_at: string;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      name: string;
    };
    reset_at: string;
  };
}

export const AuthAPI = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.data.token) {
      await AsyncStorage.setItem('@auth_token', response.data.data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.data.user));
    }
    return response;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.data.token) {
      await AsyncStorage.setItem('@auth_token', response.data.data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.data.user));
    }
    return response;
  },

  logout: async () => {
    await api.post('/auth/logout');
    await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('ForgotPassword API Error:', error);
      throw {
        response: {
          data: {
            success: false,
            message: error.response?.data?.message || 'Failed to send reset email. Please try again.',
            error: error.response?.data?.error || 'NETWORK_ERROR'
          }
        }
      };
    }
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    try {
      const response = await api.post<ResetPasswordResponse>('/auth/reset-password', {
        email: data.email,
        token: data.code, // Backend might expect 'token' instead of 'code'
        password: data.newPassword,
        password_confirmation: data.newPassword
      });
      return response.data;
    } catch (error: any) {
      console.error('ResetPassword API Error:', error);
      throw {
        response: {
          data: {
            success: false,
            message: error.response?.data?.message || 'Failed to reset password. Please try again.',
            error: error.response?.data?.error || 'NETWORK_ERROR'
          }
        }
      };
    }
  },

  verifyToken: async () => {
    return api.get('/auth/verify');
  },

  refreshToken: async (refreshToken: string) => {
    return api.post<AuthResponse>('/auth/refresh', { refreshToken });
  },
};