'use client';

import { useNetworkStatus } from '@/lib/api/hooks';
import { cn } from '@/lib/utils/cn';
import { WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline, isSyncing, syncNow, pendingOperations } = useNetworkStatus();

  if (isOnline && pendingOperations === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 flex items-center gap-2 rounded-lg p-3 shadow-lg',
        isOnline ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
        className
      )}
    >
      {!isOnline && <WifiOff className="h-5 w-5" />}
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {!isOnline ? 'You are offline' : `${pendingOperations} pending ${pendingOperations === 1 ? 'operation' : 'operations'}`}
        </span>
        {pendingOperations > 0 && isOnline && (
          <span className="text-xs">
            Click to sync now
          </span>
        )}
      </div>
      {isOnline && pendingOperations > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={syncNow}
          disabled={isSyncing}
          className="ml-2 h-8 w-8 rounded-full p-0"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="sr-only">Sync now</span>
        </Button>
      )}
    </div>
  );
}