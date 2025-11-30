import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import { API_CONFIG } from "../config/api";
import { StorageKeys } from "../constants";

// API Configuration using centralized config
const getBaseURL = () => {
  const baseUrl = API_CONFIG.BASE_URL;

  if (Platform.OS === "android" && __DEV__) {
    // Android emulator needs special handling for localhost
    // If using machine's IP (192.168.x.x), keep it as is
    // If using localhost/127.0.0.1, replace with 10.0.2.2
    let androidUrl = baseUrl;
    if (baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost")) {
      androidUrl = baseUrl.replace(/127\.0\.0\.1|localhost/, "10.0.2.2");
    }
    return androidUrl + "/api/v1";
  } else if (Platform.OS === "ios" && __DEV__) {
    // iOS simulator can use the machine's IP directly
    return baseUrl + "/api/v1";
  }

  return baseUrl + "/api/v1";
};

const API_BASE_URL = getBaseURL();
const TOKEN_KEY = StorageKeys.AUTH.TOKEN;

console.log('🌐 API Configuration Loaded:');
console.log('🌐 Current Platform:', Platform.OS);
console.log('🌐 Development Mode:', __DEV__);
console.log('🌐 API_BASE_URL:', API_BASE_URL);
console.log('🌐 From API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);

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
        // Check for admin endpoints first
        if (config.url?.includes('/admin/')) {
          const adminToken = await AsyncStorage.getItem('@admin_token');
          if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
          }
        } else {
          // Use regular user token for non-admin endpoints
          const token = await AsyncStorage.getItem(TOKEN_KEY);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Check if it's an admin endpoint
          if (error.config?.url?.includes('/admin/')) {
            await AsyncStorage.removeItem('@admin_token');
            await AsyncStorage.removeItem('@admin_data');
          } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
          }
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
