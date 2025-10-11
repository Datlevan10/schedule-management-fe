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
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  token: string;
  refreshToken?: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export const AuthAPI = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
    }
    return response;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
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