import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { EditVehicleClient } from '@/components/vehicles/edit-vehicle-client';

// Generate static params for static export
export async function generateStaticParams() {
  // Return a sample ID for static export
  return [{ id: 'sample' }];
}

interface EditVehiclePageProps {
  params: { id: string };
}

export default function EditVehiclePage({ params }: EditVehiclePageProps) {
  const vehicleId = params.id;

  return (
    <DashboardLayout>
      <EditVehicleClient vehicleId={vehicleId} />
    </DashboardLayout>
  );
}