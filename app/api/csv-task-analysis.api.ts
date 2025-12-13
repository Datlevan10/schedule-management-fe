import api from './index';

export interface CSVTaskEntry {
  id: number;
  import_id: number;
  user_id: number;
  row_number: number;
  raw_text: string;
  original_data: {
    lop?: string;
    ngay?: string;
    phong?: string;
    ghi_chu?: string;
    mon_hoc?: string;
    gio_bat_dau?: string;
    gio_ket_thuc?: string;
  };
  parsed_data: {
    title?: string;
    description?: string;
    start_datetime?: string;
    end_datetime?: string;
    duration_minutes?: number;
    location?: string;
    priority?: number;
  };
  ai_analysis: {
    detected_keywords?: string[];
    parsed_data?: any;
    confidence?: string;
    detected_category?: string;
    detected_importance?: string;
    meets_threshold?: boolean;
    is_available_for_analysis?: boolean;
    analysis_status?: 'pending' | 'in_progress' | 'completed' | 'failed';
    is_locked?: boolean;
  };
  status: {
    processing?: string;
    conversion?: string;
    is_converted?: boolean;
    has_errors?: boolean;
    manual_review_required?: boolean;
  };
  converted_event_id?: number;
  parsing_errors?: string[] | null;
  manual_review_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CSVAnalysisRequest {
  user_id: number;
  entry_ids: number[];
  analysis_type?: 'parsing' | 'ai' | 'both';
  options?: {
    language?: 'vietnamese' | 'english';
    optimize_schedule?: boolean;
    detect_conflicts?: boolean;
  };
}

export interface CSVAnalysisResponse {
  success: boolean;
  data: {
    analysis_id: string;
    user_id: number;
    entries_submitted: number;
    entries_locked: number;
    entries_skipped: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    estimated_time_seconds?: number;
    message: string;
  };
}

export interface CSVAnalysisResult {
  analysis_id: string;
  user_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  entries_analyzed: number;
  results: {
    entry_id: number;
    original_data: any;
    parsed_result: {
      title: string;
      description: string;
      start_datetime: string;
      end_datetime: string;
      location: string;
      priority: number;
      category: string;
      participants?: string[];
      requirements?: string[];
    };
    ai_analysis?: {
      confidence_score: number;
      suggestions: string[];
      detected_conflicts?: string[];
      optimization_recommendations?: string[];
    };
    status: 'success' | 'failed';
    error_message?: string;
  }[];
  completed_at?: string;
  processing_time_ms?: number;
}

export interface CSVAnalysisStatus {
  user_id: number;
  total_entries: number;
  available_for_analysis: number;
  pending_analysis: number;
  in_progress: number;
  completed: number;
  failed: number;
  locked: number;
}

export interface ParseVietnameseRequest {
  text: string;
  context?: {
    date?: string;
    time_format?: '12h' | '24h';
  };
}

export interface BatchAnalysisRequest {
  user_id: number;
  import_ids: number[];
  analysis_type?: 'parsing' | 'ai' | 'both';
  skip_locked?: boolean;
}

export const CSVTaskAnalysisAPI = {
  // Analyze selected CSV entries
  analyzeCSVTasks: async (request: CSVAnalysisRequest): Promise<CSVAnalysisResponse> => {
    try {
      console.log('🤖 Submitting CSV tasks for AI analysis:', request);
      console.log('📍 API Endpoint: POST /csv-tasks/analyze');
      console.log('📦 Request payload:', JSON.stringify(request, null, 2));
      
      const response = await api.post<CSVAnalysisResponse>('/csv-tasks/analyze', request);
      
      console.log('✅ Analysis initiated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error analyzing CSV tasks:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      throw error;
    }
  },

  // Get analysis results
  getAnalysisResults: async (analysisId: string): Promise<CSVAnalysisResult> => {
    try {
      console.log('📊 Fetching analysis results for:', analysisId);
      const response = await api.get<CSVAnalysisResult>(`/csv-tasks/analysis-results/${analysisId}`);
      console.log('✅ Analysis results retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching analysis results:', error);
      throw error;
    }
  },

  // Check analysis status for user
  getAnalysisStatus: async (userId: number): Promise<CSVAnalysisStatus> => {
    try {
      console.log('📈 Checking analysis status for user:', userId);
      const response = await api.get<CSVAnalysisStatus>(`/csv-tasks/analysis-status?user_id=${userId}`);
      console.log('✅ Status retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking analysis status:', error);
      throw error;
    }
  },

  // Parse Vietnamese text
  parseVietnamese: async (request: ParseVietnameseRequest): Promise<any> => {
    try {
      console.log('🇻🇳 Parsing Vietnamese text:', request.text);
      const response = await api.post('/csv-tasks/parse-vietnamese', request);
      console.log('✅ Text parsed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error parsing Vietnamese text:', error);
      throw error;
    }
  },

  // Batch analyze multiple imports
  batchAnalyze: async (request: BatchAnalysisRequest): Promise<CSVAnalysisResponse> => {
    try {
      console.log('📦 Batch analyzing imports:', request);
      const response = await api.post<CSVAnalysisResponse>('/csv-tasks/batch-analyze', request);
      console.log('✅ Batch analysis initiated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error in batch analysis:', error);
      throw error;
    }
  },

  // Unlock stuck tasks
  unlockTasks: async (userId: number, entryIds: number[]): Promise<any> => {
    try {
      console.log('🔓 Unlocking tasks:', { userId, entryIds });
      const response = await api.post('/csv-tasks/unlock', { user_id: userId, entry_ids: entryIds });
      console.log('✅ Tasks unlocked:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error unlocking tasks:', error);
      throw error;
    }
  },

  // Get locked tasks
  getLockedTasks: async (userId: number): Promise<CSVTaskEntry[]> => {
    try {
      console.log('🔒 Fetching locked tasks for user:', userId);
      const response = await api.get<{ data: CSVTaskEntry[] }>(`/csv-tasks/locked?user_id=${userId}`);
      console.log('✅ Locked tasks retrieved:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching locked tasks:', error);
      throw error;
    }
  }
};

export default CSVTaskAnalysisAPI;