import api from "./index";

export interface ChartData {
  label: string;
  value: number;
  color: string;
}

export interface DashboardAnalytics {
  ai_performance: {
    total_analyses: number;
    successful_analyses: number;
    failed_analyses: number;
    success_rate: number;
    average_confidence: number;
    average_processing_time: number;
    average_tasks_per_analysis: number;
    total_cost: number;
    total_tasks_analyzed: number;
    total_tokens: number;
  };
  task_analytics: {
    total_tasks: number;
    completion_rate: number;
    status_counts: {
      completed: number;
      in_progress: number;
      scheduled: number;
      cancelled: number;
      postponed: number;
      pending: number;
    };
    status_percentages: {
      completed: number;
      in_progress: number;
      scheduled: number;
      cancelled: number;
      postponed: number;
      pending: number;
    };
  };
  processing_statistics: {
    ai_models: {
      [key: string]: number;
    };
    analysis_types: {
      [key: string]: number;
    };
    confidence_distribution: {
      high: number;
      medium: number;
      low: number;
    };
    processing_efficiency: {
      average_retry_count: number;
      error_rate: number;
    };
    user_feedback: {
      approval_rate: number;
      approved_analyses: number;
      average_rating: number;
      total_rated: number;
    };
  };
  recommendation_accuracy: {
    total_recommendations: number;
    approved_recommendations: number;
    accuracy_score: number;
    user_satisfaction: number;
    confidence_vs_approval: {
      high_confidence_approved: number;
      medium_confidence_approved: number;
      low_confidence_approved: number;
    };
  };
  completion_trends: {
    daily_trends: Array<{
      date: string;
      completed_tasks: number;
      total_tasks: number;
      completion_rate: number;
    }>;
    period_summary: {
      total_days: number;
      average_daily_tasks: number;
      average_daily_completion_rate: number;
    };
  };
  summary: {
    total_ai_analyses: number;
    total_tasks_processed: number;
    ai_success_rate: number;
    average_confidence_score: number;
  };
  period: {
    from: string;
    to: string;
    user_filter: number | null;
  };
  generated_at: string;
}

export interface ChartsResponse {
  status: "success" | "error";
  message: string;
  data: {
    task_analytics_data: ChartData[];
    summary: {
      total_tasks: number;
      completion_rate: number;
    };
  };
}

export interface UserAnalytics {
  status: "success" | "error";
  message: string;
  data: {
    user_id: number;
    user_name: string;
    activity_stats: {
      total_tasks: number;
      completed_tasks: number;
      ai_analyses_requested: number;
      completion_rate: number;
    };
    performance_metrics: {
      average_task_duration: number;
      on_time_completion_rate: number;
      ai_recommendation_follow_rate: number;
    };
  };
}

export interface DashboardResponse {
  status: "success" | "error";
  message: string;
  data: DashboardAnalytics;
}

export const AIAnalyticsAPI = {
  // Get comprehensive dashboard analytics
  getDashboardAnalytics: async (params?: {
    date_from?: string;
    date_to?: string;
    user_id?: number;
  }): Promise<DashboardResponse> => {
    try {
      console.log("🔍 Fetching AI dashboard analytics...");
      
      const queryParams = new URLSearchParams();
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString());

      const response = await api.get(
        `/ai-analytics/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      );

      if (response.data.status === "success") {
        console.log("✅ AI dashboard analytics fetched successfully");
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch dashboard analytics");
      }
    } catch (error: any) {
      console.error("❌ Error fetching AI dashboard analytics:", error);
      throw error;
    }
  },

  // Get charts data formatted for frontend
  getChartsData: async (): Promise<ChartsResponse> => {
    try {
      console.log("📊 Fetching charts data for frontend...");
      
      const response = await api.get("/ai-analytics/charts");

      if (response.data.status === "success") {
        console.log("✅ Charts data fetched successfully");
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch charts data");
      }
    } catch (error: any) {
      console.error("❌ Error fetching charts data:", error);
      throw error;
    }
  },

  // Get user-specific analytics
  getUserAnalytics: async (userId: number): Promise<UserAnalytics> => {
    try {
      console.log(`👤 Fetching analytics for user ${userId}...`);
      
      const response = await api.get(`/ai-analytics/user/${userId}`);

      if (response.data.status === "success") {
        console.log("✅ User analytics fetched successfully");
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch user analytics");
      }
    } catch (error: any) {
      console.error("❌ Error fetching user analytics:", error);
      throw error;
    }
  },
};

export default AIAnalyticsAPI;