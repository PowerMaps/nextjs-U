'use client';

import React from 'react';
import { VehicleDetail } from './vehicle-detail';
import { useToast } from '@/components/ui/use-toast';

interface VehicleDetailClientProps {
  vehicleId: string;
}

export function VehicleDetailClient({ vehicleId }: VehicleDetailClientProps) {
  const { toast } = useToast();

  // Placeholder for fetching vehicle data
  const vehicle = {
    id: vehicleId,
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
    <VehicleDetail vehicle={vehicle} onEdit={handleEdit} onDelete={handleDelete} />
  );
}