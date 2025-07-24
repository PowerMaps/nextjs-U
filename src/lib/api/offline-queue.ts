'use client';

import { apiClient } from './client';
import { toast } from '@/components/ui/use-toast';

// Type for queued requests
interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  data?: any;
  timestamp: number;
  retryCount: number;
}

// Key for storing queued requests in localStorage
const OFFLINE_QUEUE_KEY = 'offline_request_queue';

// Maximum number of retries for a queued request
const MAX_RETRIES = 3;

// Class to manage offline request queue
class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isOnline: boolean = true;
  private isProcessing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize only in browser environment
    if (typeof window !== 'undefined') {
      // Load queue from localStorage
      this.loadQueue();
      
      // Set up online/offline event listeners
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      
      // Check initial online status
      this.isOnline = navigator.onLine;
      
      // Start sync interval
      this.startSyncInterval();
    }
  }

  // Add a request to the queue
  public enqueue(url: string, method: string, data?: any): string {
    const id = this.generateId();
    const request: QueuedRequest = {
      id,
      url,
      method,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    this.queue.push(request);
    this.saveQueue();
    
    toast({
      title: 'Offline mode',
      description: 'Your request has been queued and will be processed when you are back online.',
    });
    
    return id;
  }

  // Process the queue
  public async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    const requestsToProcess = [...this.queue];
    const successfulRequests: string[] = [];
    
    for (const request of requestsToProcess) {
      try {
        await this.processRequest(request);
        successfulRequests.push(request.id);
      } catch (error) {
        // Increment retry count
        const index = this.queue.findIndex(r => r.id === request.id);
        if (index !== -1) {
          this.queue[index].retryCount++;
          
          // Remove if max retries reached
          if (this.queue[index].retryCount >= MAX_RETRIES) {
            successfulRequests.push(request.id);
            toast({
              title: 'Sync failed',
              description: `Could not sync a queued request after ${MAX_RETRIES} attempts.`,
              variant: 'destructive',
            });
          }
        }
      }
    }
    
    // Remove successful requests from queue
    this.queue = this.queue.filter(request => !successfulRequests.includes(request.id));
    this.saveQueue();
    
    this.isProcessing = false;
    
    // If queue processed successfully, show toast
    if (successfulRequests.length > 0 && this.queue.length === 0) {
      toast({
        title: 'Sync complete',
        description: 'All queued requests have been processed successfully.',
      });
    }
  }

  // Get the current queue
  public getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  // Clear the queue
  public clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }

  public isInQueue(id: string): boolean {
    return this.queue.some(request => request.id === id);
  }

  // Sync with the server
  public async sync(): Promise<void> {
    await this.processQueue();
    // Add logic here to fetch latest data from the server and update local storage
  }
  private handleOnline = (): void => {
    this.isOnline = true;
    this.sync();
    
    toast({
      title: 'You are back online',
      description: 'Processing queued requests...',
    });
  };

  // Handle going offline
  private handleOffline = (): void => {
    this.isOnline = false;
    
    toast({
      title: 'You are offline',
      description: 'Your requests will be queued until you are back online.',
      variant: 'destructive',
    });
  };

  // Process a single request
  private async processRequest(request: QueuedRequest): Promise<any> {
    const { url, method, data } = request;
    
    switch (method.toUpperCase()) {
      case 'GET':
        return await apiClient.get(url);
      case 'POST':
        return await apiClient.post(url, data);
      case 'PUT':
        return await apiClient.put(url, data);
      case 'PATCH':
        return await apiClient.patch(url, data);
      case 'DELETE':
        return await apiClient.delete(url);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  // Save queue to localStorage
  private saveQueue(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    }
  }

  // Load queue from localStorage
  private loadQueue(): void {
    if (typeof window !== 'undefined') {
      const savedQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (savedQueue) {
        try {
          this.queue = JSON.parse(savedQueue);
        } catch (error) {
          console.error('Error parsing offline queue', error);
          this.queue = [];
        }
      }
    }
  }

  // Generate a unique ID for a request
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start sync interval
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Try to process queue every minute
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.processQueue();
      }
    }, 60000);
  }

  // Clean up
  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }
    }
  }
}

// Create singleton instance
export const offlineQueue = typeof window !== 'undefined' ? new OfflineQueue() : null;

// Hook to check online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Missing imports
import { useState, useEffect } from 'react';