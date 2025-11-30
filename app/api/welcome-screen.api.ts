import api from './index';

export interface WelcomeScreen {
  id: number;
  title: string;
  subtitle: string;
  background_type: 'image' | 'video' | 'color';
  background_value: string;
  duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWelcomeScreenRequest {
  title: string;
  subtitle: string;
  background_type: 'image' | 'video' | 'color';
  background_value: any; 
  duration: number;
  is_active: boolean;
}

export interface UpdateWelcomeScreenRequest {
  title?: string;
  subtitle?: string;
  background_type?: 'image' | 'video' | 'color';
  background_value?: any;
  duration?: number;
  is_active?: boolean;
}

export interface WelcomeScreenResponse {
  success: boolean;
  message: string;
  data: WelcomeScreen;
}

export interface WelcomeScreenListResponse {
  success: boolean;
  data: WelcomeScreen[];
}

export const WelcomeScreenAPI = {
  getActiveScreen: async (): Promise<WelcomeScreenResponse> => {
    try {
      const response = await api.get<WelcomeScreenResponse>('/welcome-screen');
      return response.data;
    } catch (error) {
      console.error('Error fetching active welcome screen:', error);
      throw error;
    }
  },

  getAll: async (): Promise<WelcomeScreenListResponse> => {
    try {
      const response = await api.get<WelcomeScreenListResponse>('/welcome-screens');
      return response.data;
    } catch (error) {
      console.error('Error fetching welcome screens:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<WelcomeScreenResponse> => {
    try {
      const response = await api.get<WelcomeScreenResponse>(`/welcome-screens/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching welcome screen:', error);
      throw error;
    }
  },

  create: async (data: CreateWelcomeScreenRequest): Promise<WelcomeScreenResponse> => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subtitle', data.subtitle);
      formData.append('background_type', data.background_type);
      formData.append('duration', data.duration.toString());
      formData.append('is_active', data.is_active ? '1' : '0');

      if (data.background_type === 'image' && data.background_value) {
        if (typeof data.background_value === 'string') {
          formData.append('background_value', data.background_value);
        } else {
          formData.append('background_value', {
            uri: data.background_value.uri,
            type: data.background_value.type || 'image/jpeg',
            name: data.background_value.name || 'image.jpg',
          } as any);
        }
      } else if (data.background_type === 'video' && data.background_value) {
        if (typeof data.background_value === 'string') {
          formData.append('background_value', data.background_value);
        } else {
          formData.append('background_value', {
            uri: data.background_value.uri,
            type: data.background_value.type || 'video/mp4',
            name: data.background_value.name || 'video.mp4',
          } as any);
        }
      } else if (data.background_type === 'color') {
        formData.append('background_value', data.background_value);
      }

      const response = await api.post<WelcomeScreenResponse>('/welcome-screens', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating welcome screen:', error);
      throw error;
    }
  },

  update: async (id: number, data: UpdateWelcomeScreenRequest): Promise<WelcomeScreenResponse> => {
    try {
      const formData = new FormData();
      
      if (data.title !== undefined) formData.append('title', data.title);
      if (data.subtitle !== undefined) formData.append('subtitle', data.subtitle);
      if (data.background_type !== undefined) formData.append('background_type', data.background_type);
      if (data.duration !== undefined) formData.append('duration', data.duration.toString());
      if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');

      if (data.background_value) {
        if (data.background_type === 'image') {
          if (typeof data.background_value === 'string') {
            formData.append('background_value', data.background_value);
          } else {
            formData.append('background_value', {
              uri: data.background_value.uri,
              type: data.background_value.type || 'image/jpeg',
              name: data.background_value.name || 'image.jpg',
            } as any);
          }
        } else if (data.background_type === 'video') {
          if (typeof data.background_value === 'string') {
            formData.append('background_value', data.background_value);
          } else {
            formData.append('background_value', {
              uri: data.background_value.uri,
              type: data.background_value.type || 'video/mp4',
              name: data.background_value.name || 'video.mp4',
            } as any);
          }
        } else if (data.background_type === 'color') {
          formData.append('background_value', data.background_value);
        }
      }

      formData.append('_method', 'PUT');

      const response = await api.post<WelcomeScreenResponse>(`/welcome-screens/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error updating welcome screen:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/welcome-screens/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting welcome screen:', error);
      throw error;
    }
  },

  activate: async (id: number): Promise<WelcomeScreenResponse> => {
    try {
      const response = await api.post<WelcomeScreenResponse>(`/welcome-screens/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating welcome screen:', error);
      throw error;
    }
  },
};

export default WelcomeScreenAPI;