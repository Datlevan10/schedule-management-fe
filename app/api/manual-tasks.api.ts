import api from './index';

export interface ManualTask {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  task_type?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category_id?: number;
  assigned_to?: number;
  created_by?: number;
  meta_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateManualTaskRequest {
  title: string;
  description?: string;
  start_datetime: string;  // Changed from start_date
  end_datetime: string;    // Changed from end_date
  location?: string;
  status?: 'scheduled' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  user_id?: number;        // Changed from assigned_to
  priority?: number;       // Changed to number (1-5)
  task_type?: string;
  task_priority_label?: 'low' | 'medium' | 'high' | 'urgent';
  participants?: string[];
  requirements?: string[];
  event_metadata?: Record<string, any>;
  category_id?: number;
  meta_data?: Record<string, any>;
}

export interface UpdateManualTaskRequest extends Partial<CreateManualTaskRequest> {
  id?: number;
}

export interface ManualTaskFilters {
  status?: string;
  priority?: string;
  task_type?: string;
  category_id?: number;
  assigned_to?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface ManualTaskResponse {
  success?: boolean;
  status?: 'success' | 'error';
  message?: string;
  data?: ManualTask;
}

export interface ManualTaskListResponse {
  success: boolean;
  data: ManualTask[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export const ManualTasksAPI = {
  // Create a new manual task
  create: async (data: CreateManualTaskRequest): Promise<ManualTaskResponse> => {
    try {
      const response = await api.post<any>('/manual-tasks', data);
      console.log('🔍 Raw API response:', response);
      
      // Handle different response formats from backend
      const normalizedResponse: ManualTaskResponse = {
        success: response.data?.success || response.data?.status === 'success',
        status: response.data?.status || (response.data?.success ? 'success' : 'error'),
        message: response.data?.message,
        data: response.data?.data || response.data?.task // Handle different data field names
      };
      
      console.log('📋 Normalized response:', normalizedResponse);
      return normalizedResponse;
    } catch (error) {
      console.error('Error creating manual task:', error);
      throw error;
    }
  },

  // Get all manual tasks with optional filters
  getAll: async (filters?: ManualTaskFilters): Promise<ManualTaskListResponse> => {
    try {
      const response = await api.get<ManualTaskListResponse>('/manual-tasks', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching manual tasks:', error);
      throw error;
    }
  },

  // Get a specific manual task by ID
  getById: async (id: number): Promise<ManualTaskResponse> => {
    try {
      const response = await api.get<ManualTaskResponse>(`/manual-tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching manual task:', error);
      throw error;
    }
  },

  // Update an existing manual task
  update: async (id: number, data: UpdateManualTaskRequest): Promise<ManualTaskResponse> => {
    try {
      const response = await api.put<ManualTaskResponse>(`/manual-tasks/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating manual task:', error);
      throw error;
    }
  },

  // Delete a manual task
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/manual-tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting manual task:', error);
      throw error;
    }
  },

  // Update manual task status
  updateStatus: async (id: number, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): Promise<ManualTaskResponse> => {
    try {
      const response = await api.patch<ManualTaskResponse>(`/manual-tasks/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating manual task status:', error);
      throw error;
    }
  },

  // Bulk operations
  bulkDelete: async (ids: number[]): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/manual-tasks/bulk-delete', { ids });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting manual tasks:', error);
      throw error;
    }
  },
};

export default ManualTasksAPI;