"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { VehicleForm, VehicleFormValues } from '@/components/vehicles/vehicle-form';
import { useCreateVehicle } from '@/lib/api/hooks/vehicle-hooks';
import { CreateVehicleDto } from '@/lib/api/types';

export default function AddVehiclePage() {
  const router = useRouter();
  const createVehicleMutation = useCreateVehicle();

  const handleSubmit = async (data: CreateVehicleDto) => {
    try {
      await createVehicleMutation.mutateAsync(data);
      // Redirect to vehicles list page after successful creation
      router.push('/dashboard/vehicles');
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to create vehicle:', error);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Add New Vehicle</h1>
      <VehicleForm 
        onSubmit={handleSubmit} 
        isLoading={createVehicleMutation.isPending}
      />
    </DashboardLayout>
  );
}