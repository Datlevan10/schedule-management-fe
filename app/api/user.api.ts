import api from './index';

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