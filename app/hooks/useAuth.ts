import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { AuthAPI, type LoginRequest, type RegisterRequest } from '../api/auth.api';
import { StorageKeys } from '../constants';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem(StorageKeys.AUTH.TOKEN);
      const userDataString = await AsyncStorage.getItem(StorageKeys.AUTH.USER_DATA);
      
      if (token && userDataString) {
        const userData = JSON.parse(userDataString);
        
        try {
          await AuthAPI.verifyToken();
          setState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          await logout();
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check authentication status',
      }));
    }
  };

  const login = async (credentials: LoginRequest) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await AuthAPI.login(credentials);
      
      setState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: RegisterRequest) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await AuthAPI.register(userData);
      
      setState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
    }));

    try {
      await AuthAPI.logout();
    } catch (error) {
      console.warn('Logout API call failed, but proceeding with local logout');
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const forgotPassword = async (email: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      await AuthAPI.forgotPassword(email);
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      await AuthAPI.resetPassword({ email, code, newPassword });
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  };

  return {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
    refresh: checkAuthStatus,
  };
};