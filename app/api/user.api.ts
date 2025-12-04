import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "../constants";
import api from "./index";

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
  defaultCalendarView: "day" | "week" | "month";
  workingHours: {
    start: string;
    end: string;
  };
  reminderDefaults: string[];
  theme: "light" | "dark" | "system";
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
    return api.get<User>("/user/profile");
  },

  getUserProfile: async (userId: number): Promise<UserProfileResponse> => {
    try {
      // Always fetch user profile using the user ID endpoint
      console.log('🚀 Making API call with user ID:', userId);
      const response = await api.get<UserProfileResponse>(
        `/users/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  updateUserProfile: async (
    userId: number,
    data: Partial<UserProfile>
  ): Promise<UserProfileResponse> => {
    try {
      console.log('🔄 Attempting to update user profile:', { userId, data });
      
      // List of endpoint/method combinations to try
      const updateAttempts = [
        { method: 'patch', url: `/users/${userId}` },
        { method: 'put', url: `/users/${userId}` },
        { method: 'patch', url: `/user/profile` },
        { method: 'put', url: `/user/profile` }
      ];
      
      let lastError: any = null;
      
      for (const attempt of updateAttempts) {
        try {
          console.log(`🔄 Trying ${attempt.method.toUpperCase()} ${attempt.url}`);
          
          let response;
          if (attempt.method === 'patch') {
            response = await api.patch<UserProfileResponse>(attempt.url, data);
          } else {
            response = await api.put<UserProfileResponse>(attempt.url, data);
          }
          
          console.log(`✅ ${attempt.method.toUpperCase()} update successful on ${attempt.url}`);
          return response.data;
        } catch (error: any) {
          lastError = error;
          const status = error.response?.status;
          console.log(`❌ ${attempt.method.toUpperCase()} failed on ${attempt.url} with status ${status}`);
          
          // If it's not a 405 (Method Not Allowed) or 404 (Not Found), don't try other methods
          if (status && status !== 405 && status !== 404) {
            break;
          }
        }
      }
      
      // If all attempts failed, throw the last error
      throw lastError;
    } catch (error: any) {
      console.error("❌ Error updating user profile:", error);
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      });
      throw error;
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    return api.put<User>("/user/profile", data);
  },

  uploadAvatar: async (file: FormData) => {
    return api.post<{ url: string }>("/user/avatar", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  changePassword: async (data: ChangePasswordRequest) => {
    return api.post("/user/change-password", data);
  },

  deleteAccount: async () => {
    return api.delete("/user/account");
  },

  getActivityStats: async () => {
    return api.get("/user/activity-stats");
  },

  updatePreferences: async (preferences: Partial<UserPreferences>) => {
    return api.put<User>("/user/preferences", preferences);
  },

  // Test method to check available endpoints
  testUserEndpoints: async (userId: number) => {
    const endpoints = [
      `/users/${userId}`,
      `/user/profile`, 
      `/user/update`,
      `/profile/update`
    ];
    
    const results: any = {};
    
    for (const endpoint of endpoints) {
      try {
        // Try a simple GET first to see if endpoint exists
        await api.get(endpoint);
        results[endpoint] = { available: true, methods: ['GET'] };
      } catch (error: any) {
        results[endpoint] = { 
          available: false, 
          status: error.response?.status,
          error: error.message 
        };
      }
    }
    
    console.log('🔍 Available endpoints:', results);
    return results;
  },

  // Simple update method that tries the most common pattern
  updateUserProfileSimple: async (
    userId: number,
    data: Partial<UserProfile>
  ): Promise<UserProfileResponse> => {
    try {
      console.log('🔄 Simple update attempt for user:', userId);
      console.log('🔄 Update data:', data);
      
      // Try the /user/profile endpoint which seems to be in the config
      const response = await api.put<UserProfileResponse>("/user/profile", data);
      
      console.log('✅ Simple update successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Simple update failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });
      throw error;
    }
  },
};
