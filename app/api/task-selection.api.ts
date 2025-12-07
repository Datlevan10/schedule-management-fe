import api from './index';

export interface SelectableTask {
  task_id: string;
  source: 'manual' | 'imported';
  source_id: number;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  location?: string;
  status: 'scheduled' | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  priority: number;
  completion_percentage: number;
  category?: string | null;
  duration_minutes: number;
  is_selectable: boolean;
  created_at: string;
  metadata: {
    manually_created?: boolean;
    task_type?: string;
    source_type?: string;
    original_text?: string;
    ai_confidence?: number;
  };
}

export interface TaskListResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    user_id: string;
    user_name: string;
    tasks: SelectableTask[];
    summary: {
      total_tasks: number;
      manual_tasks: number;
      imported_tasks: number;
      selectable_tasks: number;
      date_range: {
        earliest: string;
        latest: string;
      };
      filters_available: {
        by_source: string[];
        by_priority: number[];
        by_status: string[];
      };
    };
    selection_info: {
      instruction: string;
      min_selection: number;
      max_selection: number | null;
      recommended_selection: string;
    };
  };
}

export interface AIAnalysisRequest {
  selected_tasks: string[];
  analysis_type: 'optimization' | 'comprehensive' | 'weekly_optimization';
  focus_areas: Array<'conflict_detection' | 'time_optimization' | 'workload_balance' | 'priority_alignment'>;
  additional_context?: string;
}

export interface AIAnalysisResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    user_id: string;
    analysis_type: string;
    selected_tasks: Array<{
      task_id: string;
      title: string;
      start_datetime: string;
      priority: number;
    }>;
    task_summary: {
      selected_tasks_count: number;
      manual_tasks_count: number;
      imported_tasks_count: number;
      total_duration_minutes: number;
    };
    ai_analysis: {
      structured_response: {
        assessment: string;
        conflicts: Array<{
          type: string;
          tasks: string[];
          suggestion: string;
        }>;
        optimizations: string[];
        recommended_schedule: Array<{
          task: string;
          suggested_time: string;
          reason: string;
        }>;
        time_savings: string;
        productivity_score: number;
      };
      model_used: string;
    };
    selection_metadata: {
      total_selected: number;
      manual_selected: number;
      imported_selected: number;
    };
  };
}

export interface TaskListFilters {
  upcoming_only?: boolean;
  date_from?: string;
  date_to?: string;
  status?: string;
  priority_min?: number;
  priority_max?: number;
}

export interface AnalysisHistoryItem {
  analysis_id: number;
  user_id: string;
  analysis_type: 'optimization' | 'comprehensive' | 'weekly_optimization';
  focus_areas: string[];
  selected_tasks: Array<{
    task_id: string;
    source: string;
    title: string;
    description: string;
    start_datetime: string;
    end_datetime: string;
    location: string;
    status: string;
    priority: number;
    completion_percentage: number;
    category: string | null;
    duration_minutes: number;
  }>;
  task_summary: {
    selected_tasks_count: number;
    manual_tasks_count: number;
    imported_tasks_count: number;
    priority_distribution: Record<string, number>;
    total_duration_minutes: number;
    date_range: {
      start: string;
      end: string;
    };
  };
  ai_analysis: {
    raw_response: string;
    structured_response: {
      task_assessment: {
        task_combination: string;
        total_duration: string;
        priority_analysis: {
          high_priority: {
            task_id: string;
            priority: number;
          };
          low_priority: {
            task_id: string;
            priority: number;
          };
        };
      };
      conflicts_identified: {
        scheduling_conflict: string;
        location_conflict: string;
      };
      optimization_suggestions: {
        task_1: {
          task_id: string;
          suggestions: string[];
        };
        task_2: {
          task_id: string;
          suggestions: string[];
        };
      };
      priority_recommendations: {
        high_priority_task: {
          task_id: string;
          time_allocation: string;
        };
        low_priority_task: {
          task_id: string;
          time_allocation: string;
        };
      };
      actionable_improvements: string[];
      recommended_schedule_sequence: Array<{
        task_id: string;
        start_datetime: string;
        end_datetime: string;
        priority: string;
      }>;
    };
    model_used: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    confidence: string;
    processing_time_ms: number;
    api_cost: number;
  };
  recommendations: any;
  analyzed_at: string;
  selection_metadata: {
    total_selected: number;
    manual_selected: number;
    imported_selected: number;
  };
  saved_to_database: boolean;
}

export interface AnalysisHistoryResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    analyses: AnalysisHistoryItem[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

export const TaskSelectionAPI = {
  // Get all user tasks for selection
  getUserTaskList: async (userId: number, filters?: TaskListFilters): Promise<TaskListResponse> => {
    try {
      console.log('🔍 Fetching user task list for selection:', { userId, filters });
      const response = await api.get<TaskListResponse>(`/tasks/user/${userId}/list`, {
        params: filters
      });
      console.log('✅ User task list retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user task list:', error);
      throw error;
    }
  },

  // AI analysis for selected tasks
  analyzeSelectedTasks: async (userId: number, analysisRequest: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
    try {
      const endpoint = `/ai-schedule/analyze-selected/${userId}`;
      
      console.log('🌐 ================= API SERVICE LOGGING =================');
      console.log('📍 Endpoint:', endpoint);
      console.log('🔧 Method:', 'POST');
      console.log('👤 User ID:', userId);
      console.log('📤 Request Body:', JSON.stringify(analysisRequest, null, 2));
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('=======================================================');

      // Increase timeout for AI analysis (3 minutes)
      const response = await api.post<AIAnalysisResponse>(endpoint, analysisRequest, {
        timeout: 180000 // 3 minutes (180,000 ms)
      });
      
      console.log('📥 ================= API RESPONSE LOGGING ===============');
      console.log('✅ Response Status Code:', response.status);
      console.log('📝 Response Data:', JSON.stringify(response.data, null, 2));
      console.log('⏰ Response Time:', new Date().toISOString());
      console.log('======================================================');
      
      return response.data;
    } catch (error: any) {
      console.log('❌ ================= API ERROR LOGGING =================');
      console.error('❌ Request Failed - Endpoint:', `/ai-schedule/analyze-selected/${userId}`);
      console.error('❌ Error Type:', error.constructor?.name || 'Unknown');
      console.error('❌ Error Message:', error.message);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Stack:', error.stack);
      
      if (error.response) {
        console.error('📥 Error Response Status:', error.response.status);
        console.error('📥 Error Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('📥 Error Response Headers:', JSON.stringify(error.response.headers, null, 2));
      }
      
      if (error.request) {
        console.error('📤 Error Request Config:', JSON.stringify({
          method: error.request.method || error.config?.method,
          url: error.request.url || error.config?.url,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
          headers: error.config?.headers
        }, null, 2));
      }
      
      console.error('⏰ Error Timestamp:', new Date().toISOString());
      console.log('====================================================');
      
      throw error;
    }
  },

  // Get AI analysis history for user
  getAnalysisHistory: async (userId: number, page: number = 1, perPage: number = 10): Promise<AnalysisHistoryResponse> => {
    try {
      console.log('🔍 Fetching AI analysis history:', { userId, page, perPage });
      const response = await api.get<AnalysisHistoryResponse>(`/ai-analyses/user/${userId}`, {
        params: { page, per_page: perPage }
      });
      console.log('✅ Analysis history retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching analysis history:', error);
      throw error;
    }
  },

  // Get specific AI analysis by ID
  getAnalysisById: async (userId: number, analysisId: string): Promise<{ status: string; data: AnalysisHistoryItem }> => {
    try {
      console.log('🔍 Fetching specific analysis:', { userId, analysisId });
      const response = await api.get<{ status: string; data: AnalysisHistoryItem }>(`/ai-analyses/user/${userId}/analysis/${analysisId}`);
      console.log('✅ Specific analysis retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching specific analysis:', error);
      throw error;
    }
  }
};

export default TaskSelectionAPI;