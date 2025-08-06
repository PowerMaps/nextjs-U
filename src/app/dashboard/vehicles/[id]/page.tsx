import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { VehicleDetailClient } from '@/components/vehicles/vehicle-detail-client';

// Generate static params for static export
export async function generateStaticParams() {
  // Return a sample ID for static export
  return [{ id: 'sample' }];
}

interface VehicleDetailPageProps {
  params: { id: string };
}

export default function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const id = params.id;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Vehicle Details</h1>
      <VehicleDetailClient vehicleId={id} />
    </DashboardLayout>
  );
}