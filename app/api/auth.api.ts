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
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    return api.post('/auth/reset-password', data);
  },

  verifyToken: async () => {
    return api.get('/auth/verify');
  },

  refreshToken: async (refreshToken: string) => {
    return api.post<AuthResponse>('/auth/refresh', { refreshToken });
  },
};