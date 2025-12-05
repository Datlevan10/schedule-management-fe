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
  duration_minutes: number;
  is_selectable: boolean;
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
    };
    selection_info: {
      instruction: string;
      min_selection: number;
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
      console.log('🤖 Starting AI analysis for selected tasks:', { userId, analysisRequest });
      const response = await api.post<AIAnalysisResponse>(
        `/ai-schedule/analyze-selected/${userId}`,
        analysisRequest
      );
      console.log('✅ AI analysis completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error in AI analysis:', error);
      throw error;
    }
  }
};

export default TaskSelectionAPI;