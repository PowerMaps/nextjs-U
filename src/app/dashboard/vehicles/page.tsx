"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { VehicleList } from '@/components/vehicles/vehicle-list';

export default function VehiclePage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">My Vehicles</h1>
      <VehicleList />
    </DashboardLayout>
  );
}