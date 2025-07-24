"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { VehicleForm, VehicleFormValues } from '@/components/vehicles/vehicle-form';
import { useToast } from '@/components/ui/use-toast';

export default function AddVehiclePage() {
  const { toast } = useToast();

  const handleSubmit = (data: VehicleFormValues) => {
    // In a real application, you would send this data to your API
    console.log("New Vehicle Data:", data);
    toast({
      title: "Vehicle Added",
      description: `Vehicle ${data.make} ${data.model} added successfully!`,
    });
    // Optionally, redirect to the vehicle list page
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Add New Vehicle</h1>
      <VehicleForm onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}