'use client';

import { useNetworkStatus, useOfflineRoutes, useOfflineStations } from '@/lib/api/hooks';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, RefreshCw, Trash2 } from 'lucide-react';

export function OfflineDataExample() {
  const { isOnline, isSyncing, syncNow, pendingOperations } = useNetworkStatus();
  const { routes, clearOfflineRoutes } = useOfflineRoutes();
  const { stations, clearOfflineStations } = useOfflineStations();

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Offline Data Management</h2>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Network Status */}
      <div className="mb-6 rounded-lg bg-muted/40 p-4">
        <h3 className="mb-2 font-medium">Network Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Connection:</span>
            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
              {isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Pending Operations:</span>
            <span className={pendingOperations > 0 ? 'text-amber-600' : 'text-green-600'}>
              {pendingOperations}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sync Status:</span>
            <span className={isSyncing ? 'text-blue-600' : 'text-gray-600'}>
              {isSyncing ? 'Syncing...' : 'Idle'}
            </span>
          </div>
        </div>
        
        {isOnline && (
          <Button
            onClick={syncNow}
            disabled={isSyncing}
            className="mt-3 w-full"
            variant="outline"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        )}
      </div>

      {/* Offline Data Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Cached Routes */}
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium">Cached Routes</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearOfflineRoutes}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Routes:</span>
              <span className="font-medium">{routes.length}</span>
            </div>
            {routes.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Last route: {new Date((routes[routes.length - 1] as any)?.timestamp || '').toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Cached Stations */}
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium">Cached Stations</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearOfflineStations}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Stations:</span>
              <span className="font-medium">{stations.length}</span>
            </div>
            {stations.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Includes nearby and searched stations
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offline Tips */}
      {!isOnline && (
        <div className="mt-6 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
          <h4 className="mb-2 font-medium text-amber-800 dark:text-amber-200">
            Offline Mode Tips
          </h4>
          <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
            <li>• Your changes will be saved and synced when you reconnect</li>
            <li>• Cached data may be outdated - sync when online</li>
            <li>• Some features may be limited while offline</li>
            <li>• Critical operations are queued for later processing</li>
          </ul>
        </div>
      )}

      {/* Pending Operations */}
      {pendingOperations > 0 && (
        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
            Pending Operations ({pendingOperations})
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            You have {pendingOperations} operation{pendingOperations !== 1 ? 's' : ''} waiting to be processed.
            {isOnline ? ' They will be processed automatically.' : ' Connect to the internet to process them.'}
          </p>
        </div>
      )}
    </div>
  );
}