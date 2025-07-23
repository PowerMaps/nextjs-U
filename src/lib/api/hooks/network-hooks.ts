'use client';

import { useState, useEffect } from 'react';
import { offlineQueue } from '../offline-queue';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// Hook to monitor network status and handle offline/online transitions
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      
      // Sync data when coming back online
      syncData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      
      toast({
        title: 'You are offline',
        description: 'Some features may be limited. Changes will be saved when you reconnect.',
        variant: 'destructive',
      });
    };

    // Sync data function
    const syncData = async () => {
      setIsSyncing(true);
      
      try {
        // Process offline queue
        if (offlineQueue) {
          await offlineQueue.processQueue();
        }
        
        // Refetch critical data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
          queryClient.invalidateQueries({ queryKey: ['wallet', 'my-wallet'] }),
          queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', 'count'] }),
        ]);
        
        toast({
          title: 'You are back online',
          description: 'Your data has been synchronized.',
        });
      } catch (error) {
        console.error('Error syncing data:', error);
        
        toast({
          title: 'Sync error',
          description: 'There was an error synchronizing your data.',
          variant: 'destructive',
        });
      } finally {
        setIsSyncing(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  // Function to manually trigger sync
  const syncNow = async () => {
    if (!isOnline) {
      toast({
        title: 'Cannot sync',
        description: 'You are currently offline. Please connect to the internet and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    if (isSyncing) {
      toast({
        title: 'Sync in progress',
        description: 'Data synchronization is already in progress.',
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // Process offline queue
      if (offlineQueue) {
        await offlineQueue.processQueue();
      }
      
      // Refetch all data
      await queryClient.refetchQueries();
      
      toast({
        title: 'Sync complete',
        description: 'Your data has been synchronized successfully.',
      });
    } catch (error) {
      console.error('Error syncing data:', error);
      
      toast({
        title: 'Sync error',
        description: 'There was an error synchronizing your data.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Get pending operations count
  const pendingOperations = offlineQueue ? offlineQueue.getQueue().length : 0;

  return {
    isOnline,
    isSyncing,
    syncNow,
    pendingOperations,
  };
}

// Hook to check if critical data is available offline
export function useCriticalDataStatus() {
  const [status, setStatus] = useState({
    userProfile: false,
    wallet: false,
    vehicles: false,
    savedRoutes: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if critical data is available in cache
    const userProfile = localStorage.getItem('queryData:["user","profile"]') !== null;
    const wallet = localStorage.getItem('queryData:["wallet","my-wallet"]') !== null;
    const vehicles = localStorage.getItem('queryData:["vehicles"]') !== null;
    const savedRoutes = localStorage.getItem('queryData:["routes","saved"]') !== null;
    
    setStatus({
      userProfile,
      wallet,
      vehicles,
      savedRoutes,
    });
  }, []);

  return status;
}