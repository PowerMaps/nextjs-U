'use client';

import { useApiQuery, useApiMutation, usePaginatedApiQuery, useOptimisticUpdateConfig } from './base-hooks';
import { CreateVehicleDto, PaginationQueryDto, UpdateVehicleDto, VehicleResponseDto } from '../types';
import { toast } from '@/components/ui/use-toast';

// Hook to get all user vehicles
export function useVehicles(params: PaginationQueryDto = {}) {
  return useApiQuery<VehicleResponseDto[]>(
    ['vehicles', JSON.stringify(params)],
    '/vehicles/my-vehicles',
    {
      staleTime: 60 * 1000, // 1 minute
    }
  );
}

// Hook to get vehicle by ID
export function useVehicle(vehicleId: string) {
  return useApiQuery<VehicleResponseDto>(
    ['vehicle', vehicleId],
    `/vehicles/${vehicleId}`,
    {
      enabled: !!vehicleId,
    }
  );
}

// Hook to create a new vehicle
export function useCreateVehicle() {
  return useApiMutation<VehicleResponseDto, CreateVehicleDto>(
    '/vehicles',
    'POST',
    {
      onSuccess: (data) => {
        toast({
          title: 'Vehicle added',
          description: `${data.make} ${data.model} has been added to your account.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to add vehicle',
          description: error.message || 'An error occurred while adding your vehicle.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to update a vehicle
export function useUpdateVehicle(vehicleId: string) {
  const queryKey = ['vehicle', vehicleId];
  
  return useApiMutation<VehicleResponseDto, UpdateVehicleDto>(
    `/vehicles/${vehicleId}`,
    'PATCH',
    {
      ...useOptimisticUpdateConfig<VehicleResponseDto, UpdateVehicleDto>(
        queryKey,
        (oldData, variables) => ({
          ...oldData,
          ...variables,
        })
      ),
      onSuccess: (data) => {
        toast({
          title: 'Vehicle updated',
          description: `${data.make} ${data.model} has been updated.`,
        });
      },
    }
  );
}

// Hook to delete a vehicle
export function useDeleteVehicle() {
  return useApiMutation<void, string>(
    '', // URL will be set in mutationFn
    'DELETE',
    {
      mutationFn: async (vehicleId: string) => {
        const { apiClient } = await import('../client');
        return await apiClient.delete(`/vehicles/${vehicleId}`);
      },
      onSuccess: (_, vehicleId) => {
        toast({
          title: 'Vehicle removed',
          description: 'The vehicle has been removed from your account.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to remove vehicle',
          description: error.message || 'An error occurred while removing your vehicle.',
          variant: 'destructive',
        });
      },
    }
  );
}