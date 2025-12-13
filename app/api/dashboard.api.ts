import api from './index';

export interface DashboardStats {
  active_tasks: number;
  reminders: number;
  productivity_percentage: string;
  productivity_score: number;
}

export interface LatestPrioritiesResponse {
  status: string;
  data: {
    analysis_id: number;
    user_id: number;
    selected_tasks_count: number;
    dashboard_stats: DashboardStats;
    priority_recommendations?: {
      high_priority_tasks: any[];
      medium_priority_tasks: any[];
      low_priority_tasks: any[];
    };
    optimization_suggestions?: any;
    ai_analysis?: {
      model_used: string;
      confidence: string;
      processing_time_ms: number;
    };
    analyzed_at: string;
  };
  message: string;
}

export interface DashboardSummaryResponse {
  status: string;
  data: {
    stats: DashboardStats;
    recent_tasks: any[];
    upcoming_reminders: any[];
    productivity_trend: {
      current: number;
      previous: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
}

export const DashboardAPI = {
  // Get latest priorities and dashboard stats
  getLatestPriorities: async (userId: number): Promise<LatestPrioritiesResponse> => {
    try {
      console.log('📊 Fetching latest priorities for user:', userId);
      const response = await api.get<LatestPrioritiesResponse>(
        `/ai-analyses/user/${userId}/latest-priorities`
      );
      console.log('✅ Dashboard stats retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      // Return default values if API fails
      return {
        status: 'error',
        data: {
          analysis_id: 0,
          user_id: userId,
          selected_tasks_count: 0,
          dashboard_stats: {
            active_tasks: 0,
            reminders: 0,
            productivity_percentage: '0%',
            productivity_score: 0
          },
          analyzed_at: new Date().toISOString()
        },
        message: 'Failed to fetch dashboard stats'
      };
    }
  },

  // Get dashboard summary (alternative endpoint)
  getDashboardSummary: async (userId: number): Promise<DashboardSummaryResponse> => {
    try {
      console.log('📊 Fetching dashboard summary for user:', userId);
      const response = await api.get<DashboardSummaryResponse>(
        `/dashboard/user/${userId}/summary`
      );
      console.log('✅ Dashboard summary retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard summary:', error);
      throw error;
    }
  },

  // Get productivity stats
  getProductivityStats: async (userId: number, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any> => {
    try {
      console.log('📊 Fetching productivity stats:', { userId, period });
      const response = await api.get(
        `/dashboard/user/${userId}/productivity?period=${period}`
      );
      console.log('✅ Productivity stats retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching productivity stats:', error);
      throw error;
    }
  },

  // Get task statistics
  getTaskStats: async (userId: number): Promise<any> => {
    try {
      console.log('📊 Fetching task statistics for user:', userId);
      const response = await api.get(
        `/dashboard/user/${userId}/task-stats`
      );
      console.log('✅ Task stats retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching task stats:', error);
      throw error;
    }
  }
};

export default DashboardAPI;