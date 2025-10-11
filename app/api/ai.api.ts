import api from './index';

export interface AISuggestion {
  id: string;
  type: 'time_optimization' | 'conflict_resolution' | 'break_suggestion' | 'priority_suggestion';
  title: string;
  description: string;
  confidence: number;
  data: any;
  scheduleId?: string;
  isApplied: boolean;
  createdAt: string;
}

export interface NaturalLanguageRequest {
  text: string;
  context?: {
    currentDate?: string;
    timezone?: string;
    existingSchedules?: string[];
  };
}

export interface ParsedSchedule {
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  participants?: string[];
  confidence: number;
  suggestions?: string[];
}

export interface OptimizationRequest {
  schedules: string[];
  criteria: 'minimize_travel' | 'maximize_productivity' | 'balance_workload';
  constraints?: {
    workingHours?: { start: string; end: string };
    breakDuration?: number;
    maxDailyEvents?: number;
  };
}

export interface OptimizationResult {
  originalScore: number;
  optimizedScore: number;
  changes: {
    scheduleId: string;
    oldTime: string;
    newTime: string;
    reason: string;
  }[];
  improvements: string[];
}

export const AIAPI = {
  getSuggestions: async (limit: number = 10) => {
    return api.get<AISuggestion[]>('/ai/suggestions', { params: { limit } });
  },

  applySuggestion: async (id: string) => {
    return api.post<{ success: boolean }>(`/ai/suggestions/${id}/apply`);
  },

  dismissSuggestion: async (id: string) => {
    return api.delete(`/ai/suggestions/${id}`);
  },

  parseNaturalLanguage: async (data: NaturalLanguageRequest) => {
    return api.post<ParsedSchedule>('/ai/parse-text', data);
  },

  optimizeSchedule: async (data: OptimizationRequest) => {
    return api.post<OptimizationResult>('/ai/optimize', data);
  },

  getInsights: async (period: 'week' | 'month' | 'quarter') => {
    return api.get(`/ai/insights/${period}`);
  },

  predictBestTime: async (title: string, duration: number, preferences?: any) => {
    return api.post('/ai/predict-time', { title, duration, preferences });
  },

  analyzeProductivity: async (startDate: string, endDate: string) => {
    return api.get('/ai/productivity-analysis', {
      params: { startDate, endDate }
    });
  },

  generateSummary: async (scheduleIds: string[]) => {
    return api.post('/ai/generate-summary', { scheduleIds });
  },
};