import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Define API error response structure
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// Token management utilities
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static hasValidToken(): boolean {
    return !!this.getAccessToken();
  }
}

// Create API client class
class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    const authStore = 'auth-store';
    const authData = typeof window !== 'undefined' ? localStorage.getItem(authStore) : null;
    const token = authData ? JSON.parse(authData)?.state?.accessToken : null;

    this.client = axios.create({
      baseURL: process.env.API_URL || 'http://localhost:5500/api/v1',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      timeout: 10000,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Define endpoints that don't require authentication
        const publicEndpoints = [
          '/auth/login',
          '/auth/register',
          '/auth/refresh',
          '/auth/forgot-password',
          '/auth/reset-password',
        ];

        // Check if current request is to a public endpoint
        const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));

        // Add auth header for protected endpoints only
        if (!isPublicEndpoint && typeof window !== 'undefined') {
          const authData = localStorage.getItem('auth-store');
          const token = authData ? JSON.parse(authData)?.state?.accessToken : null;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Add request timestamp for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            hasAuth: !isPublicEndpoint && !!token,
            timestamp: new Date().toISOString(),
          });
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle token refresh if 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token from auth store
            const authData =
              typeof window !== 'undefined' ? localStorage.getItem('auth-store') : null;
            const refreshToken = authData ? JSON.parse(authData)?.state?.refreshToken : null;

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.client.post('/auth/refresh', {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Update auth store with new tokens
            if (typeof window !== 'undefined' && authData) {
              const authState = JSON.parse(authData);
              authState.state.accessToken = accessToken;
              if (newRefreshToken) {
                authState.state.refreshToken = newRefreshToken;
              }
              localStorage.setItem('auth-store', JSON.stringify(authState));
            }

            // Retry the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear auth store and redirect
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-store');
              window.location.href = '/auth/login?session=expired';
            }
            return Promise.reject(refreshError);
          }
        }

        // Format error message
        let errorMessage = 'An unexpected error occurred';
        if (error.response?.data?.message) {
          errorMessage = Array.isArray(error.response.data.message)
            ? error.response.data.message.join(', ')
            : error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Enhance error object
        const enhancedError = new Error(errorMessage) as Error & {
          status?: number;
          data?: any;
        };
        enhancedError.status = error.response?.status;
        enhancedError.data = error.response?.data;

        return Promise.reject(enhancedError);
      }
    );
  }

  // Singleton pattern
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Generic request method
  public async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }

  // Convenience methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Export default for convenience
export default apiClient;
