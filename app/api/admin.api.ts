import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './index';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: AdminUser;
    token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface AdminProfileResponse {
  success: boolean;
  data: AdminUser;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email_verified?: boolean;
  profession?: {
    id: number;
    name: string;
    display_name: string;
    level: string;
  };
  workplace?: string;
  department?: string;
}

export interface FeatureHighlight {
  id: number;
  title: string;
  description: string;
  icon_url: string | null;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleTemplate {
  id: number;
  name: string;
  description: string;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerReport {
  id: number;
  subject: string;
  description: string;
  user_name: string;
  user_email: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  total_users: number;
  active_users: number;
  new_users_this_period: number;
  total_schedules: number;
  new_schedules_this_period: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  customer_reports: number;
  unresolved_reports: number;
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  popular_features: {
    name: string;
    usage_count: number;
    usage_percentage: number;
  }[];
}

export interface SystemSettings {
  allow_user_registration: boolean;
  require_email_verification: boolean;
  enable_email_notifications: boolean;
  enable_push_notifications: boolean;
  enable_sms_notifications: boolean;
  require_2fa: boolean;
  enable_session_timeout: boolean;
  session_timeout_minutes: number;
  enable_data_backup: boolean;
  enable_analytics: boolean;
  max_file_upload_size: number;
  maintenance_mode: boolean;
  maintenance_message: string;
  support_email: string;
  support_phone: string;
}

export interface WelcomeScreen {
  id: number;
  title: string;
  subtitle: string;
  background_type: 'image' | 'color' | 'gradient';
  background_value: string;
  duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface StandardApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const AdminAPI = {
  login: async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
    try {
      console.log('🔐 Admin login attempt:', credentials.email);
      console.log('🔗 Admin API endpoint: /admin/auth/login');
      const response = await api.post<AdminLoginResponse>('/admin/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        // Store admin token and data
        await AsyncStorage.setItem('@admin_token', response.data.data.token);
        await AsyncStorage.setItem('@admin_data', JSON.stringify(response.data.data.admin));
        console.log('✅ Admin login successful, token stored');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Admin login failed:', error);
      throw error;
    }
  },

  getProfile: async (): Promise<AdminProfileResponse> => {
    try {
      const response = await api.get<AdminProfileResponse>('/admin/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/admin/auth/logout');
    } catch (error) {
      console.warn('Admin logout API call failed, but proceeding with local logout');
    } finally {
      await AsyncStorage.multiRemove(['@admin_token', '@admin_data']);
    }
  },

  refreshToken: async (): Promise<AdminLoginResponse> => {
    try {
      const response = await api.post<AdminLoginResponse>('/admin/auth/refresh');
      if (response.data.data.token) {
        await AsyncStorage.setItem('@admin_token', response.data.data.token);
        await AsyncStorage.setItem('@admin_data', JSON.stringify(response.data.data.admin));
      }
      return response.data;
    } catch (error) {
      console.error('Error refreshing admin token:', error);
      throw error;
    }
  },

  verifyToken: async (): Promise<void> => {
    try {
      await api.get('/admin/auth/verify');
    } catch (error) {
      console.error('Error verifying admin token:', error);
      throw error;
    }
  },

  createAdmin: async (adminData: Partial<AdminUser>): Promise<AdminProfileResponse> => {
    try {
      const response = await api.post<AdminProfileResponse>('/admin/auth/create', adminData);
      return response.data;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  getAdmins: async (): Promise<{ success: boolean; data: AdminUser[] }> => {
    try {
      const response = await api.get<{ success: boolean; data: AdminUser[] }>('/admin/auth/admins');
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  // User Management
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await api.get<ApiResponse<User[]>>('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  createUser: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post<ApiResponse<User>>('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (userId: number, userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Feature Highlights Management
  getFeatureHighlights: async (): Promise<StandardApiResponse<FeatureHighlight[]>> => {
    try {
      const response = await api.get<StandardApiResponse<FeatureHighlight[]>>('/feature-highlights');
      return response.data;
    } catch (error) {
      console.error('Error fetching feature highlights:', error);
      throw error;
    }
  },

  getFeatureHighlight: async (id: number): Promise<StandardApiResponse<FeatureHighlight>> => {
    try {
      const response = await api.get<StandardApiResponse<FeatureHighlight>>(`/feature-highlights/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feature highlight:', error);
      throw error;
    }
  },

  createFeatureHighlight: async (data: Partial<FeatureHighlight>): Promise<StandardApiResponse<FeatureHighlight>> => {
    try {
      const response = await api.post<StandardApiResponse<FeatureHighlight>>('/feature-highlights', data);
      return response.data;
    } catch (error) {
      console.error('Error creating feature highlight:', error);
      throw error;
    }
  },

  updateFeatureHighlight: async (id: number, data: Partial<FeatureHighlight>): Promise<StandardApiResponse<FeatureHighlight>> => {
    try {
      const response = await api.put<StandardApiResponse<FeatureHighlight>>(`/feature-highlights/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating feature highlight:', error);
      throw error;
    }
  },

  deleteFeatureHighlight: async (id: number): Promise<StandardApiResponse<null>> => {
    try {
      const response = await api.delete<StandardApiResponse<null>>(`/feature-highlights/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting feature highlight:', error);
      throw error;
    }
  },

  // Welcome Screen Management
  getWelcomeScreens: async (): Promise<StandardApiResponse<WelcomeScreen[]>> => {
    try {
      const response = await api.get<StandardApiResponse<WelcomeScreen[]>>('/welcome-screen');
      return response.data;
    } catch (error) {
      console.error('Error fetching welcome screens:', error);
      throw error;
    }
  },

  getWelcomeScreen: async (id: number): Promise<StandardApiResponse<WelcomeScreen>> => {
    try {
      const response = await api.get<StandardApiResponse<WelcomeScreen>>(`/welcome-screen/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching welcome screen:', error);
      throw error;
    }
  },

  createWelcomeScreen: async (data: Partial<WelcomeScreen>): Promise<StandardApiResponse<WelcomeScreen>> => {
    try {
      const response = await api.post<StandardApiResponse<WelcomeScreen>>('/welcome-screen', data);
      return response.data;
    } catch (error) {
      console.error('Error creating welcome screen:', error);
      throw error;
    }
  },

  updateWelcomeScreen: async (id: number, data: Partial<WelcomeScreen>): Promise<StandardApiResponse<WelcomeScreen>> => {
    try {
      const response = await api.put<StandardApiResponse<WelcomeScreen>>(`/welcome-screen/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating welcome screen:', error);
      throw error;
    }
  },

  deleteWelcomeScreen: async (id: number): Promise<StandardApiResponse<null>> => {
    try {
      const response = await api.delete<StandardApiResponse<null>>(`/welcome-screen/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting welcome screen:', error);
      throw error;
    }
  },

  // Schedule Templates
  getScheduleTemplates: async (): Promise<ApiResponse<ScheduleTemplate[]>> => {
    try {
      const response = await api.get<ApiResponse<ScheduleTemplate[]>>('/schedule-import-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule templates:', error);
      throw error;
    }
  },

  updateScheduleTemplate: async (id: number, data: Partial<ScheduleTemplate>): Promise<ApiResponse<ScheduleTemplate>> => {
    try {
      const response = await api.put<ApiResponse<ScheduleTemplate>>(`/schedule-import-templates/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule template:', error);
      throw error;
    }
  },

  deleteScheduleTemplate: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/schedule-import-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting schedule template:', error);
      throw error;
    }
  },

  // Customer Reports
  getCustomerReports: async (): Promise<ApiResponse<CustomerReport[]>> => {
    try {
      const response = await api.get<ApiResponse<CustomerReport[]>>('/admin/customer-reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer reports:', error);
      throw error;
    }
  },

  updateCustomerReport: async (id: number, data: Partial<CustomerReport>): Promise<ApiResponse<CustomerReport>> => {
    try {
      const response = await api.put<ApiResponse<CustomerReport>>(`/admin/customer-reports/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating customer report:', error);
      throw error;
    }
  },

  deleteCustomerReport: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/admin/customer-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting customer report:', error);
      throw error;
    }
  },

  // Analytics
  getAnalytics: async (params: { period: '7d' | '30d' | '90d' }): Promise<ApiResponse<AnalyticsData>> => {
    try {
      const response = await api.get<ApiResponse<AnalyticsData>>('/admin/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // System Settings
  getSystemSettings: async (): Promise<ApiResponse<SystemSettings>> => {
    try {
      const response = await api.get<ApiResponse<SystemSettings>>('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  },

  updateSystemSettings: async (settings: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> => {
    try {
      const response = await api.put<ApiResponse<SystemSettings>>('/admin/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  },
};

export default AdminAPI;