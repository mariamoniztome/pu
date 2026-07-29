import axios from "axios";
import i18n from "../i18n/config";

// Creates an Axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: false,
});

// Request interceptor to set appropriate Content-Type and forward the active
// UI language, so backend-generated messages (toasts, error text) come back
// in the same language as the rest of the interface instead of always English.
api.interceptors.request.use((config) => {
  // Don't set Content-Type for FormData - let the browser handle it
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  config.headers["Accept-Language"] = i18n.language;
  return config;
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    console.error("API error:", {
      message: errorMessage,
      status: statusCode,
      url: originalRequest?.url,
      method: originalRequest?.method,
    });

    return Promise.reject({
      ...error,
      message: errorMessage,
      status: statusCode,
    });
  }
);

export default api;