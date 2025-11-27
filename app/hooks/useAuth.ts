import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { AuthAPI, type LoginRequest, type RegisterRequest, type User } from '../api/auth.api';
import { StorageKeys } from '../constants';


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
      console.log('🔍 Checking auth status...');
      const token = await AsyncStorage.getItem(StorageKeys.AUTH.TOKEN);
      const userDataString = await AsyncStorage.getItem(StorageKeys.AUTH.USER_DATA);
      
      console.log('📱 Token exists:', !!token);
      console.log('📱 User data exists:', !!userDataString);
      
      if (token && userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('👤 Stored user data:', userData.id);
        
        try {
          console.log('🔐 Verifying token...');
          await AuthAPI.verifyToken();
          console.log('✅ Token verified successfully');
          setState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.log('❌ Token verification failed:', error);
          await logout();
        }
      } else {
        console.log('❌ No token or user data found');
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.log('❌ Error checking auth status:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check authentication status',
      }));
    }
  };

  const login = async (credentials: LoginRequest & { role?: string }) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await AuthAPI.login(credentials);
      
      // Log the login response for debugging
      console.log('🔐 Login Response:', JSON.stringify(response.data, null, 2));
      console.log('👤 User Data:', JSON.stringify(response.data.data.user, null, 2));
      console.log('🆔 User ID:', response.data.data.user.id);
      
      // Verify that the token was stored properly after AuthAPI.login call
      const storedToken = await AsyncStorage.getItem(StorageKeys.AUTH.TOKEN);
      const storedUserData = await AsyncStorage.getItem(StorageKeys.AUTH.USER_DATA);
      console.log('💾 Token stored after login:', !!storedToken);
      console.log('💾 User data stored after login:', !!storedUserData);
      
      // Store user role if provided
      if (credentials.role) {
        await AsyncStorage.setItem('userRole', credentials.role);
      }
      
      setState({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('✅ Login state updated - isAuthenticated:', true);
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
        user: response.data.data.user,
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