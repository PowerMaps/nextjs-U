"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { VehicleSelector } from '@/components/vehicles/vehicle-selector';

export default function VehicleSelectionPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Vehicle Selection</h1>
      <VehicleSelector />
    </DashboardLayout>
  );
}