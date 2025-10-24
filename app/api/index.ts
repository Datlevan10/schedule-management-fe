import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import { API_CONFIG } from "../config/api";

// API Configuration using centralized config
const getBaseURL = () => {
  const baseUrl = API_CONFIG.BASE_URL;

  if (Platform.OS === "android" && __DEV__) {
    // Android emulator can use 10.0.2.2 to access host localhost
    return baseUrl.replace("192.168.1.216", "10.0.2.2") + "/api/v1";
  }

  return baseUrl + "/api/v1";
};

const API_BASE_URL = getBaseURL();
const TOKEN_KEY = "@auth_token";

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem(TOKEN_KEY);
        }

        // Enhanced error handling
        if (
          error.code === "NETWORK_ERROR" ||
          error.message === "Network Error"
        ) {
          error.message =
            "Unable to connect to server. Please check your internet connection.";
        } else if (error.code === "ECONNABORTED") {
          error.message = "Request timeout. Please try again.";
        } else if (error.response?.status === 500) {
          error.message = "Server error. Please try again later.";
        } else if (error.response?.status === 404) {
          error.message = "Service not found. Please check your configuration.";
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<T>(url, config);
    return { data: response.data, status: response.status };
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<T>(url, data, config);
    return { data: response.data, status: response.status };
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<T>(url, data, config);
    return { data: response.data, status: response.status };
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<T>(url, config);
    return { data: response.data, status: response.status };
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<T>(url, data, config);
    return { data: response.data, status: response.status };
  }
}

export default new ApiClient();
export type { ApiResponse };
