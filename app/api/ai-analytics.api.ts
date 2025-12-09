import api from "./index";

export interface ChartData {
  label: string;
  value: number;
  color: string;
}

export interface DashboardAnalytics {
  task_status_analytics: {
    completed_tasks: number;
    in_progress_tasks: number;
    scheduled_tasks: number;
    cancelled_tasks: number;
    postponed_tasks: number;
  };
  ai_performance_metrics: {
    total_ai_analyses: number;
    ai_success_rate: number;
    average_confidence_score: number;
    average_processing_time: number;
    total_api_costs: number;
    total_token_usage: number;
    tasks_analyzed_per_analysis: number;
  };
  user_feedback_quality: {
    user_approval_rate: number;
    average_user_rating: number;
    ai_recommendation_accuracy: number;
    confidence_vs_approval_correlation: number;
  };
  trend_analysis: {
    daily_completion_trends: Array<{
      date: string;
      completed: number;
      created: number;
    }>;
    period_summary: {
      start_date: string;
      end_date: string;
      total_tasks_created: number;
      total_tasks_completed: number;
      average_completion_rate: number;
    };
  };
  processing_statistics: {
    ai_model_usage: {
      [key: string]: number;
    };
    retry_counts: {
      successful_first_attempt: number;
      required_retry: number;
      failed_after_retry: number;
    };
    analysis_type_distribution: {
      [key: string]: number;
    };
    confidence_level_distribution: {
      high: number;
      medium: number;
      low: number;
    };
  };
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