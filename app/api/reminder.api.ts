import api from './index';

export interface Reminder {
  id: string;
  scheduleId: string;
  type: 'notification' | 'email' | 'sms';
  triggerTime: string;
  message?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderRequest {
  scheduleId: string;
  type: 'notification' | 'email' | 'sms';
  triggerTime: string;
  message?: string;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  triggerMinutes: number;
  type: 'notification' | 'email' | 'sms';
  message: string;
  isDefault: boolean;
}

export const ReminderAPI = {
  getBySchedule: async (scheduleId: string) => {
    return api.get<Reminder[]>(`/reminders/schedule/${scheduleId}`);
  },

  create: async (data: CreateReminderRequest) => {
    return api.post<Reminder>('/reminders', data);
  },

  update: async (id: string, data: Partial<CreateReminderRequest>) => {
    return api.put<Reminder>(`/reminders/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/reminders/${id}`);
  },

  toggle: async (id: string, isActive: boolean) => {
    return api.patch<Reminder>(`/reminders/${id}/toggle`, { isActive });
  },

  getTemplates: async () => {
    return api.get<ReminderTemplate[]>('/reminders/templates');
  },

  createTemplate: async (template: Omit<ReminderTemplate, 'id'>) => {
    return api.post<ReminderTemplate>('/reminders/templates', template);
  },

  updateTemplate: async (id: string, template: Partial<ReminderTemplate>) => {
    return api.put<ReminderTemplate>(`/reminders/templates/${id}`, template);
  },

  deleteTemplate: async (id: string) => {
    return api.delete(`/reminders/templates/${id}`);
  },

  testReminder: async (id: string) => {
    return api.post(`/reminders/${id}/test`);
  },
};