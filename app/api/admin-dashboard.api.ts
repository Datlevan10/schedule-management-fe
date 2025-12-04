import api from './index';

export interface DashboardStatistics {
  users: {
    total: number;
    active: number;
    inactive: number;
    today: number;
    this_week: number;
    this_month: number;
  };
  tasks: {
    total: number;
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    postponed: number;
    manual_tasks: number;
    today: number;
    this_week: number;
    this_month: number;
    by_priority: {
      [key: string]: number;
    };
  };
  admins: {
    total: number;
    active: number;
  };
  recent_activity: {
    recent_users: Array<{
      id: number;
      name: string;
      email: string;
      created_at: string;
    }>;
    recent_tasks: Array<{
      id: number;
      title: string;
      status: string;
      user: {
        id: number;
        name: string;
      };
      category?: {
        id: number;
        name: string;
      };
      created_at: string;
    }>;
  };
  summary: {
    total_users: number;
    total_tasks: number;
    total_admins: number;
    completion_rate: number;
    active_user_percentage: number;
  };
  timestamp: string;
}

export interface QuickSummary {
  total_users: number;
  total_tasks: number;
  total_admins: number;
  active_users: number;
  completed_tasks: number;
  completion_rate: number;
}

export interface DashboardResponse {
  status: 'success' | 'error';
  message: string;
  data: DashboardStatistics;
  timestamp: string;
}

export interface QuickSummaryResponse {
  status: 'success' | 'error';
  message: string;
  data: QuickSummary;
}

export const AdminDashboardAPI = {
  // Get complete dashboard statistics
  getStatistics: async (): Promise<DashboardResponse> => {
    try {
      console.log('🔍 Fetching admin dashboard statistics...');
      const response = await api.get<DashboardResponse>('/admin/dashboard/statistics');
      console.log('✅ Dashboard statistics retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard statistics:', error);
      throw error;
    }
  },

  // Get quick summary
  getQuickSummary: async (): Promise<QuickSummaryResponse> => {
    try {
      console.log('🔍 Fetching admin dashboard summary...');
      const response = await api.get<QuickSummaryResponse>('/admin/dashboard/summary');
      console.log('✅ Dashboard summary retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard summary:', error);
      throw error;
    }
  },
};

export default AdminDashboardAPI;