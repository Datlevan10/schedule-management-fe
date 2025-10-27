import api from "./index";

export interface FeatureHighlight {
  id: number;
  title: string;
  description: string;
  icon_url: string;
  order: number;
  is_active: boolean;
}

interface FeatureHighlightResponse {
  status: string;
  data: FeatureHighlight[];
}

export const FeatureHighlightsAPI = {
  getAll: async () => {
    const response = await api.get<FeatureHighlightResponse>("/feature-highlights");
    return { data: response.data.data, status: response.data.status };
  },

  getActive: async () => {
    const response = await api.get<FeatureHighlightResponse>("/feature-highlights");
    return { data: response.data.data, status: response.data.status };
  },

  getById: async (id: number) => {
    const response = await api.get<{ status: string; data: FeatureHighlight }>(`/feature-highlights/${id}`);
    return { data: response.data.data, status: response.data.status };
  },
};