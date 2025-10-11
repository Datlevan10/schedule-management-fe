import api from './index';

export interface ReportData {
  id: string;
  type: 'time_usage' | 'productivity' | 'category_breakdown' | 'weekly_summary';
  data: any;
  period: {
    start: string;
    end: string;
  };
  generatedAt: string;
}

export interface TimeUsageReport {
  totalHours: number;
  categories: {
    name: string;
    hours: number;
    percentage: number;
    color: string;
  }[];
  dailyBreakdown: {
    date: string;
    hours: number;
    events: number;
  }[];
}

export interface ProductivityReport {
  productivityScore: number;
  focusTime: number;
  breakTime: number;
  meetingTime: number;
  trends: {
    date: string;
    score: number;
  }[];
  recommendations: string[];
}

export interface WeeklySummary {
  week: string;
  totalEvents: number;
  totalHours: number;
  completedTasks: number;
  topCategories: string[];
  achievements: string[];
  areasForImprovement: string[];
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  categories?: string[];
  includeWeekends?: boolean;
  groupBy?: 'day' | 'week' | 'month';
}

export const ReportAPI = {
  getTimeUsage: async (filters: ReportFilters) => {
    return api.get<TimeUsageReport>('/reports/time-usage', { params: filters });
  },

  getProductivity: async (filters: ReportFilters) => {
    return api.get<ProductivityReport>('/reports/productivity', { params: filters });
  },

  getWeeklySummary: async (weekStart: string) => {
    return api.get<WeeklySummary>('/reports/weekly-summary', { 
      params: { weekStart } 
    });
  },

  getCategoryBreakdown: async (filters: ReportFilters) => {
    return api.get('/reports/category-breakdown', { params: filters });
  },

  getCustomReport: async (config: any) => {
    return api.post<ReportData>('/reports/custom', config);
  },

  exportReport: async (type: string, format: 'pdf' | 'csv' | 'xlsx', filters: ReportFilters) => {
    return api.get(`/reports/${type}/export/${format}`, {
      params: filters,
      responseType: 'blob'
    });
  },

  getReportHistory: async () => {
    return api.get<ReportData[]>('/reports/history');
  },

  scheduleReport: async (config: {
    type: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    email?: string;
    filters: ReportFilters;
  }) => {
    return api.post('/reports/schedule', config);
  },

  getScheduledReports: async () => {
    return api.get('/reports/scheduled');
  },

  deleteScheduledReport: async (id: string) => {
    return api.delete(`/reports/scheduled/${id}`);
  },
};