"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { VehicleComparison } from '@/components/vehicles/vehicle-comparison';

export default function VehicleComparisonPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Compare Vehicles</h1>
      <VehicleComparison />
    </DashboardLayout>
  );
}