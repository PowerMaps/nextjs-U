'use client';

import { apiClient } from './client';
import { offlineQueue } from './offline-queue';
import { AxiosRequestConfig } from 'axios';

// List of critical endpoints that should be queued when offline
const CRITICAL_ENDPOINTS = [
  '/wallet/top-up',
  '/wallet/transfer',
  '/vehicles',
  '/vehicles/',
  '/notifications/preferences',
];

// Check if an endpoint is critical
function isCriticalEndpoint(url: string): boolean {
  return CRITICAL_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

// Enhanced API client with offline support
export const enhancedApiClient = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      return await apiClient.get<T>(url, config);
    } catch (error: any) {
      // If network error and endpoint is critical, use offline data
      if (error.message === 'Network Error' || error.message.includes('Failed to fetch')) {
        // For GET requests, we don't queue them but return cached data if available
        throw error;
      }
      throw error;
    }
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      return await apiClient.post<T>(url, data, config);
    } catch (error: any) {
      // If network error and endpoint is critical, queue the request
      if ((error.message === 'Network Error' || error.message.includes('Failed to fetch')) && isCriticalEndpoint(url)) {
        if (offlineQueue) {
          offlineQueue.enqueue(url, 'POST', data);
          return { queued: true } as any;
        }
      }
      throw error;
    }
  },

  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      return await apiClient.put<T>(url, data, config);
    } catch (error: any) {
      // If network error and endpoint is critical, queue the request
      if ((error.message === 'Network Error' || error.message.includes('Failed to fetch')) && isCriticalEndpoint(url)) {
        if (offlineQueue) {
          offlineQueue.enqueue(url, 'PUT', data);
          return { queued: true } as any;
        }
      }
      throw error;
    }
  },

  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      return await apiClient.patch<T>(url, data, config);
    } catch (error: any) {
      // If network error and endpoint is critical, queue the request
      if ((error.message === 'Network Error' || error.message.includes('Failed to fetch')) && isCriticalEndpoint(url)) {
        if (offlineQueue) {
          offlineQueue.enqueue(url, 'PATCH', data);
          return { queued: true } as any;
        }
      }
      throw error;
    }
  },

  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      return await apiClient.delete<T>(url, config);
    } catch (error: any) {
      // If network error and endpoint is critical, queue the request
      if ((error.message === 'Network Error' || error.message.includes('Failed to fetch')) && isCriticalEndpoint(url)) {
        if (offlineQueue) {
          offlineQueue.enqueue(url, 'DELETE');
          return { queued: true } as any;
        }
      }
      throw error;
    }
  },
};

// Export enhanced client as default
export default enhancedApiClient;