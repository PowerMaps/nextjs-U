"use client";

import React from 'react';
import { StationInfoWindow } from './station-info-window';
import { useChargingStation } from '@/lib/api/hooks/station-hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface StationDetailsSidebarProps {
  stationId: string | null;
  onClose: () => void;
}

export function StationDetailsSidebar({ stationId, onClose }: StationDetailsSidebarProps) {
  const { data: station, isLoading, error } = useChargingStation(stationId || '');

  if (!stationId) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-20 w-96 max-h-[calc(100vh-2rem)] overflow-hidden">
      <Card className="shadow-xl border-2">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Station Details</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading station details...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-sm text-red-600 mb-4">Failed to load station details</p>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
          
          {station && !isLoading && !error && (
            <div className="p-0">
              <StationInfoWindow station={station} onClose={onClose} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}