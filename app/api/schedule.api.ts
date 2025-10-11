import api from './index';

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  category?: string;
  color?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  reminders?: string[];
  participants?: string[];
  attachments?: string[];
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  category?: string;
  color?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  reminders?: string[];
  participants?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface ScheduleFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  priority?: string;
  status?: string;
}

export const ScheduleAPI = {
  getAll: async (filters?: ScheduleFilters) => {
    return api.get<Schedule[]>('/schedules', { params: filters });
  },

  getById: async (id: string) => {
    return api.get<Schedule>(`/schedules/${id}`);
  },

  create: async (data: CreateScheduleRequest) => {
    return api.post<Schedule>('/schedules', data);
  },

  update: async (id: string, data: Partial<CreateScheduleRequest>) => {
    return api.put<Schedule>(`/schedules/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/schedules/${id}`);
  },

  getUpcoming: async (limit: number = 5) => {
    return api.get<Schedule[]>('/schedules/upcoming', { params: { limit } });
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    return api.get<Schedule[]>('/schedules/range', { 
      params: { startDate, endDate } 
    });
  },

  getConflicts: async (startTime: string, endTime: string, excludeId?: string) => {
    return api.get<Schedule[]>('/schedules/conflicts', {
      params: { startTime, endTime, excludeId }
    });
  },

  bulkDelete: async (ids: string[]) => {
    return api.post('/schedules/bulk-delete', { ids });
  },

  export: async (format: 'pdf' | 'ics' | 'csv', filters?: ScheduleFilters) => {
    return api.get(`/schedules/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
};