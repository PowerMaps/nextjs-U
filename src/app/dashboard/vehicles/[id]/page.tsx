"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { VehicleDetail } from '@/components/vehicles/vehicle-detail';
import { useToast } from '@/components/ui/use-toast';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();

  // Placeholder for fetching vehicle data
  const vehicle = {
    id: id as string,
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    licensePlate: 'TN 123 ABC',
    vin: '1234567890ABCDEF',
    batteryCapacity: 75,
    chargingPortType: 'Type 2',
  };

  const handleEdit = (vehicleId: string) => {
    toast({
      title: "Edit Vehicle",
      description: `Editing vehicle with ID: ${vehicleId}`,
    });
    // In a real application, navigate to an edit page or open a modal
  };

  const handleDelete = (vehicleId: string) => {
    toast({
      title: "Delete Vehicle",
      description: `Deleting vehicle with ID: ${vehicleId}`,
      variant: "destructive",
    });
    // In a real application, call an API to delete the vehicle and then navigate back to the list
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Vehicle Details</h1>
      <VehicleDetail vehicle={vehicle} onEdit={handleEdit} onDelete={handleDelete} />
    </DashboardLayout>
  );
}