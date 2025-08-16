/**
 * Native HTTP client adapter using Capacitor HTTP
 */

import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { HttpClient, RequestConfig, PlatformCapabilities } from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class NativeHttpClient extends AbstractBaseAdapter implements HttpClient {
  async initialize(): Promise<void> {
    try {
      // Capacitor HTTP is always available in native context
      this.setAvailable(true);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize native HTTP client:', error);
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
        'Native HTTP client not available',
        'native',
        'HTTP_UNAVAILABLE',
        false
      );
    }

    try {
      const options = this.convertConfig('GET', url, undefined, config);
      const response: HttpResponse = await CapacitorHttp.request(options);
      
      if (response.status >= 400) {
        throw new PlatformError(
          `HTTP ${response.status}: ${response.data?.message || 'Request failed'}`,
          'native',
          `HTTP_${response.status}`,
          response.status < 500
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      throw new PlatformError(
        `GET request failed: ${error instanceof Error ? error.message : String(error)}`,
        'native',
        'HTTP_GET_ERROR',
        true
      );
    }
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Native HTTP client not available',
        'native',
        'HTTP_UNAVAILABLE',
        false
      );
    }

    try {
      const options = this.convertConfig('POST', url, data, config);
      const response: HttpResponse = await CapacitorHttp.request(options);
      
      if (response.status >= 400) {
        throw new PlatformError(
          `HTTP ${response.status}: ${response.data?.message || 'Request failed'}`,
          'native',
          `HTTP_${response.status}`,
          response.status < 500
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      throw new PlatformError(
        `POST request failed: ${error instanceof Error ? error.message : String(error)}`,
        'native',
        'HTTP_POST_ERROR',
        true
      );
    }
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Native HTTP client not available',
        'native',
        'HTTP_UNAVAILABLE',
        false
      );
    }

    try {
      const options = this.convertConfig('PUT', url, data, config);
      const response: HttpResponse = await CapacitorHttp.request(options);
      
      if (response.status >= 400) {
        throw new PlatformError(
          `HTTP ${response.status}: ${response.data?.message || 'Request failed'}`,
          'native',
          `HTTP_${response.status}`,
          response.status < 500
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      throw new PlatformError(
        `PUT request failed: ${error instanceof Error ? error.message : String(error)}`,
        'native',
        'HTTP_PUT_ERROR',
        true
      );
    }
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Native HTTP client not available',
        'native',
        'HTTP_UNAVAILABLE',
        false
      );
    }

    try {
      const options = this.convertConfig('DELETE', url, undefined, config);
      const response: HttpResponse = await CapacitorHttp.request(options);
      
      if (response.status >= 400) {
        throw new PlatformError(
          `HTTP ${response.status}: ${response.data?.message || 'Request failed'}`,
          'native',
          `HTTP_${response.status}`,
          response.status < 500
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      throw new PlatformError(
        `DELETE request failed: ${error instanceof Error ? error.message : String(error)}`,
        'native',
        'HTTP_DELETE_ERROR',
        true
      );
    }
  }

  private convertConfig(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): HttpOptions {
    const options: HttpOptions = {
      url,
      method: method as any,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    };

    if (data) {
      options.data = data;
    }

    if (config?.params) {
      options.params = config.params;
    }

    if (config?.timeout) {
      options.connectTimeout = config.timeout;
      options.readTimeout = config.timeout;
    }

    return options;
  }
}