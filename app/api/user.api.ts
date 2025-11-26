import AsyncStorage from "@react-native-async-storage/async-storage";
import api from './index';
import { StorageKeys } from '../constants';

export interface Profession {
  id: number;
  name: string;
  display_name: string;
  level: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  reminder_advance_minutes: number[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  email_verified_at: string | null;
  profession: Profession;
  workplace: string;
  department: string;
  work_schedule: string[];
  work_habits: string[];
  notification_preferences: NotificationPreferences;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member_since: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  defaultCalendarView: 'day' | 'week' | 'month';
  workingHours: {
    start: string;
    end: string;
  };
  reminderDefaults: string[];
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  language: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  timezone?: string;
  preferences?: Partial<UserPreferences>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const UserAPI = {
  getProfile: async () => {
    return api.get<User>('/user/profile');
  },

  getUserProfile: async (userId?: number): Promise<UserProfileResponse> => {
    try {
      let userIdToFetch = userId;
      
      if (!userIdToFetch) {
        const userData = await AsyncStorage.getItem(StorageKeys.AUTH.USER_DATA);
        if (userData) {
          const parsed = JSON.parse(userData);
          userIdToFetch = parsed.id;
        }
      }
      
      if (!userIdToFetch) {
        throw new Error('User ID not found');
      }
      
      const response = await api.get<UserProfileResponse>(`/users/${userIdToFetch}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  updateUserProfile: async (userId: number, data: Partial<UserProfile>): Promise<UserProfileResponse> => {
    try {
      const response = await api.put<UserProfileResponse>(`/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    return api.put<User>('/user/profile', data);
  },

  uploadAvatar: async (file: FormData) => {
    return api.post<{ url: string }>('/user/avatar', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  changePassword: async (data: ChangePasswordRequest) => {
    return api.post('/user/change-password', data);
  },

  deleteAccount: async () => {
    return api.delete('/user/account');
  },

  getActivityStats: async () => {
    return api.get('/user/activity-stats');
  },

  updatePreferences: async (preferences: Partial<UserPreferences>) => {
    return api.put<User>('/user/preferences', preferences);
  },
};