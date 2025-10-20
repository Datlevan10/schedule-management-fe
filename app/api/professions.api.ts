import api from './index';

export interface Profession {
  id: number;
  display_name: string;
  description?: string;
}

export const ProfessionsAPI = {
  getAll: async () => {
    return api.get<Profession[]>('/professions');
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