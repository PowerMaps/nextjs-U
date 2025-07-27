"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { VehicleForm } from '@/components/vehicles/vehicle-form';
import { useVehicle, useUpdateVehicle } from '@/lib/api/hooks/vehicle-hooks';
import { CreateVehicleDto, UpdateVehicleDto } from '@/lib/api/types';
import { ConnectorType } from '@/lib/api/hooks/user-station-hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Car, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  // Fetch vehicle data
  const { data: vehicle, isLoading: isLoadingVehicle, error } = useVehicle(vehicleId);
  const updateVehicleMutation = useUpdateVehicle(vehicleId);

  const handleSubmit = async (data: CreateVehicleDto) => {
    try {
      const updateData: UpdateVehicleDto = {
        make: data.make,
        model: data.model,
        year: data.year,
        licensePlate: data.licensePlate,
        batteryCapacity: data.batteryCapacity,
        range: data.range,
        efficiency: data.efficiency,
        connectorType: data.connectorType as string, // Convert enum back to string
        chargingPower: data.chargingPower,
      };

      await updateVehicleMutation.mutateAsync(updateData);
      // Redirect to vehicles list page after successful update
      router.push('/dashboard/vehicles');
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to update vehicle:', error);
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/vehicles">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vehicles
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Vehicle not found</h2>
                <p className="text-muted-foreground mb-4">
                  The vehicle you're trying to edit doesn't exist or you don't have permission to edit it.
                </p>
                <Link href="/dashboard/vehicles">
                  <Button>
                    Back to Vehicles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoadingVehicle) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/vehicles">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vehicles
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Loading vehicle...</h2>
                <p className="text-muted-foreground">
                  Please wait while we fetch your vehicle details.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Convert VehicleResponseDto to CreateVehicleDto format for the form
  const initialData: CreateVehicleDto | undefined = vehicle ? {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    licensePlate: vehicle.licensePlate,
    batteryCapacity: vehicle.batteryCapacity,
    range: vehicle.range,
    efficiency: vehicle.efficiency,
    connectorType: vehicle.connectorType as ConnectorType, // Convert string to enum
    chargingPower: vehicle.chargingPower,
  } : undefined;
  console.log(initialData);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vehicles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vehicles
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Vehicle</h1>
          <p className="text-muted-foreground">
            Update your vehicle details and specifications.
          </p>
        </div>

        {initialData && (
          <VehicleForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={updateVehicleMutation.isPending}
          />
        )}
      </div>
    </DashboardLayout>
  );
}