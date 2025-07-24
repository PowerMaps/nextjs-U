"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { WalletDashboard } from '@/components/wallet/wallet-dashboard';

export default function WalletPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">My Wallet</h1>
      <WalletDashboard />
    </DashboardLayout>
  );
}