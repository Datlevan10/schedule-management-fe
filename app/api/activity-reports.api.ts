import api from './index';

export interface UserTaskActivity {
  id: number;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  location?: string;
  status: 'scheduled' | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  task_type?: string;
  category?: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  participants?: string[];
  requirements?: string[];
  meta_data?: Record<string, any>;
}

export interface ActivityFilters {
  user_id?: number;
  status?: string;
  priority?: string;
  task_type?: string;
  category_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ActivityReportsResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    tasks: UserTaskActivity[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
    summary: {
      total_tasks: number;
      completed_tasks: number;
      pending_tasks: number;
      in_progress_tasks: number;
      cancelled_tasks: number;
      completion_rate: number;
    };
  };
  timestamp: string;
}

export interface UserActivitySummary {
  user_id: number;
  user_name: string;
  user_email: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completion_rate: number;
  most_active_day: string;
  average_completion_time: number; // in hours
  recent_activity: UserTaskActivity[];
}

export interface UserActivitySummaryResponse {
  status: 'success' | 'error';
  message: string;
  data: UserActivitySummary;
  timestamp: string;
}

export const ActivityReportsAPI = {
  // Get user task activities with filters
  getUserActivities: async (filters?: ActivityFilters): Promise<ActivityReportsResponse> => {
    try {
      console.log('🔍 Fetching user activities with filters:', filters);
      const response = await api.get<ActivityReportsResponse>('/user/activities', { 
        params: filters 
      });
      console.log('✅ User activities retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user activities:', error);
      throw error;
    }
  },

  // Get activity summary for a specific user
  getUserActivitySummary: async (userId: number): Promise<UserActivitySummaryResponse> => {
    try {
      console.log('🔍 Fetching activity summary for user:', userId);
      const response = await api.get<UserActivitySummaryResponse>(`/user/${userId}/activity-summary`);
      console.log('✅ Activity summary retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching activity summary:', error);
      throw error;
    }
  },

  // Get all users activities (admin only)
  getAllUsersActivities: async (filters?: ActivityFilters): Promise<ActivityReportsResponse> => {
    try {
      console.log('🔍 Fetching all users activities with filters:', filters);
      const response = await api.get<ActivityReportsResponse>('/admin/activities', { 
        params: filters 
      });
      console.log('✅ All users activities retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all users activities:', error);
      throw error;
    }
  },

  // Export activities to different formats
  exportActivities: async (format: 'csv' | 'pdf' | 'excel', filters?: ActivityFilters): Promise<Blob> => {
    try {
      console.log('🔍 Exporting activities in format:', format);
      const response = await api.get(`/user/activities/export/${format}`, {
        params: filters,
        responseType: 'blob'
      });
      console.log('✅ Activities exported successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error exporting activities:', error);
      throw error;
    }
  },

  // Get activity statistics for date ranges
  getActivityStatistics: async (dateFrom?: string, dateTo?: string): Promise<{
    status: 'success' | 'error';
    data: {
      daily_completion_rate: Array<{ date: string; rate: number }>;
      weekly_summary: {
        tasks_created: number;
        tasks_completed: number;
        average_completion_time: number;
      };
      productivity_insights: {
        most_productive_day: string;
        most_productive_hour: number;
        common_task_types: Array<{ type: string; count: number }>;
      };
    };
  }> => {
    try {
      console.log('🔍 Fetching activity statistics...');
      const response = await api.get('/user/activity-statistics', {
        params: { date_from: dateFrom, date_to: dateTo }
      });
      console.log('✅ Activity statistics retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching activity statistics:', error);
      throw error;
    }
  }
};

export default ActivityReportsAPI;