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
    console.log("Making API call to /welcome-screen");
    const response = await api.get<WelcomeScreenResponse>("/welcome-screen");
    console.log("Raw API response:", {
      status: response.status,
      data: response.data,
    });
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
