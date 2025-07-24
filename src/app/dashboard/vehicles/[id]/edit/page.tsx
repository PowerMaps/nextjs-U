"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { VehicleForm, VehicleFormValues } from '@/components/vehicles/vehicle-form';
import { useToast } from '@/components/ui/use-toast';

export default function EditVehiclePage() {
  const { id } = useParams();
  const { toast } = useToast();

  // In a real application, you would fetch the vehicle data by ID
  const initialData: VehicleFormValues = {
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    licensePlate: 'TN 123 ABC',
    vin: '1234567890ABCDEF',
    batteryCapacity: 75,
    chargingPortType: 'Type 2',
  };

  const handleSubmit = (data: VehicleFormValues) => {
    // In a real application, you would send this data to your API to update the vehicle
    console.log(`Updating Vehicle ${id}:`, data);
    toast({
      title: "Vehicle Updated",
      description: `Vehicle ${data.make} ${data.model} updated successfully!`,
    });
    // Optionally, redirect to the vehicle detail page or list page
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Edit Vehicle</h1>
      <VehicleForm initialData={initialData} onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}