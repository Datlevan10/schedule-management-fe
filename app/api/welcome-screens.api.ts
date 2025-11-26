import api from "./index";

export interface WelcomeScreen {
  id: number;
  title: string;
  subtitle: string;
  background_type: "image" | "color";
  background_value: string;
  duration: number; // in seconds
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WelcomeScreenResponse {
  status: string;
  data: WelcomeScreen;
}

export const WelcomeScreensAPI = {
  get: async () => {
    const response = await api.get<WelcomeScreenResponse>("/welcome-screen");
    return { data: response.data.data, status: response.status };
  },

  // Legacy methods for backward compatibility
  getAll: async () => {
    const response = await WelcomeScreensAPI.get();
    return { data: [response.data], status: response.status };
  },

  getActive: async () => {
    const response = await WelcomeScreensAPI.get();
    return { data: [response.data], status: response.status };
  },

  getById: async (id: number) => {
    const response = await WelcomeScreensAPI.get();
    return { data: response.data, status: response.status };
  },
};
