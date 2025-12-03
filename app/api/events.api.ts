import api from './index';

export interface Event {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  keywords?: string[];
  is_recurring: boolean;
  recurrence_pattern?: string;
  reminder_settings?: {
    enabled: boolean;
    minutes_before?: number;
    notification_type?: string;
  };
  status: 'active' | 'cancelled' | 'completed';
  metadata: {
    created_at: string;
    updated_at: string;
    created_at_human: string;
    updated_at_human: string;
  };
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  keywords?: string[];
  is_recurring?: boolean;
  recurrence_pattern?: string;
  reminder_settings?: {
    enabled: boolean;
    minutes_before?: number;
    notification_type?: string;
  };
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: 'active' | 'cancelled' | 'completed';
}

export interface EventFilters {
  start_date?: string;
  end_date?: string;
  category?: string;
  priority?: string;
  status?: string;
  search?: string;
}

export interface EventResponse {
  success: boolean;
  message?: string;
  data: Event;
}

export interface EventListResponse {
  success: boolean;
  data: Event[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export const EventsAPI = {
  // Create a new event (manual task creation)
  create: async (data: CreateEventRequest): Promise<EventResponse> => {
    try {
      const response = await api.post<EventResponse>('/events', data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Get all events with optional filters
  getAll: async (filters?: EventFilters): Promise<EventListResponse> => {
    try {
      const response = await api.get<EventListResponse>('/events', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get a specific event by ID
  getById: async (id: number): Promise<EventResponse> => {
    try {
      const response = await api.get<EventResponse>(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Update an existing event
  update: async (id: number, data: UpdateEventRequest): Promise<EventResponse> => {
    try {
      const response = await api.put<EventResponse>(`/events/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete an event
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Get upcoming events
  getUpcoming: async (limit: number = 10): Promise<EventListResponse> => {
    try {
      const response = await api.get<EventListResponse>('/events/upcoming', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // Get events by date range
  getByDateRange: async (startDate: string, endDate: string): Promise<EventListResponse> => {
    try {
      const response = await api.get<EventListResponse>('/events/range', { 
        params: { start_date: startDate, end_date: endDate } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      throw error;
    }
  },

  // Bulk operations
  bulkDelete: async (ids: number[]): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/events/bulk-delete', { ids });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting events:', error);
      throw error;
    }
  },

  // Update event status
  updateStatus: async (id: number, status: 'active' | 'cancelled' | 'completed'): Promise<EventResponse> => {
    try {
      const response = await api.patch<EventResponse>(`/events/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating event status:', error);
      throw error;
    }
  },
};

export default EventsAPI;