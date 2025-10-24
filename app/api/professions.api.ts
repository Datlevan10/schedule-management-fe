import api from './index';

export interface Profession {
  id: number;
  name: string;
  display_name: string;
  description: string;
  default_categories: string[];
  default_priorities: Record<string, number>;
  ai_keywords: string[];
  created_at: string;
  updated_at: string;
}

interface ProfessionsResponse {
  success: boolean;
  data: Profession[];
}

export const ProfessionsAPI = {
  getAll: async () => {
    const response = await api.get<ProfessionsResponse>('/professions');
    return { data: response.data.data, status: response.status };
  },

  getById: async (id: number) => {
    return api.get<Profession>(`/professions/${id}`);
  },

  create: async (data: Omit<Profession, 'id'>) => {
    return api.post<Profession>('/professions', data);
  },

  update: async (id: number, data: Partial<Omit<Profession, 'id'>>) => {
    return api.put<Profession>(`/professions/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete(`/professions/${id}`);
  },
};