/**
 * Web HTTP client adapter using axios
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpClient, RequestConfig, PlatformCapabilities } from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class WebHttpClient extends AbstractBaseAdapter implements HttpClient {
  private client: AxiosInstance;

  constructor() {
    super();
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async initialize(): Promise<void> {
    try {
      // Set up request interceptors
      this.client.interceptors.request.use(
        (config) => {
          // Add any global request modifications here
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Set up response interceptors
      this.client.interceptors.response.use(
        (response) => {
          return response;
        },
        (error) => {
          // Handle common HTTP errors
          if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const message = error.response.data?.message || error.message;
            
            throw new PlatformError(
              `HTTP ${status}: ${message}`,
              'web',
              `HTTP_${status}`,
              status < 500 // Client errors are generally not recoverable
            );
          } else if (error.request) {
            // Network error
            throw new PlatformError(
              'Network error: No response received',
              'web',
              'NETWORK_ERROR',
              true
            );
          } else {
            // Request setup error
            throw new PlatformError(
              `Request error: ${error.message}`,
              'web',
              'REQUEST_ERROR',
              true
            );
          }
        }
      );

      this.setAvailable(true);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize web HTTP client:', error);
      this.setAvailable(false);
      this.setInitialized(true);
    }
  }

  getCapabilities(): Partial<PlatformCapabilities> {
    return {
      hasNetwork: this.isAvailable(),
    };
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'HTTP client not available',
        'web',
        'HTTP_UNAVAILABLE',
        false
      );
    }

    try {
      const axiosConfig = this.convertConfig(config);
      const response: AxiosResponse<T> = await this.client.get(url, axiosConfig);
      return response.data;
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      throw new PlatformError(
        `GET request failed: ${error}`,
        'web',
        'HTTP_GET_ERROR',
        true
      );
    }
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'HTTP client not available',
        'web',
        'HTTP_UNAVAILABLE',
        false
      );
    }

    try {
      const axiosConfig = this.convertConfig(config);
      const response: AxiosResponse<T> = await this.client.post(url, data, axiosConfig);
      return response.data;
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      throw new PlatformError(
        `POST request failed: ${error}`,
        'web',
        'HTTP_POST_ERROR',
        true
      );
    }
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'HTTP client not available',
        'web',
        'HTTP_UNAVAILABLE',
        false
      );
    }

    try {
      const axiosConfig = this.convertConfig(config);
      const response: AxiosResponse<T> = await this.client.put(url, data, axiosConfig);
      return response.data;
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      throw new PlatformError(
        `PUT request failed: ${error}`,
        'web',
        'HTTP_PUT_ERROR',
        true
      );
    }
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'HTTP client not available',
        'web',
        'HTTP_UNAVAILABLE',
        false
      );
    }

    try {
      const axiosConfig = this.convertConfig(config);
      const response: AxiosResponse<T> = await this.client.delete(url, axiosConfig);
      return response.data;
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      throw new PlatformError(
        `DELETE request failed: ${error}`,
        'web',
        'HTTP_DELETE_ERROR',
        true
      );
    }
  }

  private convertConfig(config?: RequestConfig): AxiosRequestConfig {
    if (!config) return {};

    return {
      headers: config.headers,
      timeout: config.timeout,
      params: config.params,
    };
  }
}