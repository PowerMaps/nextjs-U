"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { TopUpForm } from '@/components/wallet/top-up-form';

export default function TopUpPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Top Up Wallet</h1>
      <TopUpForm />
    </DashboardLayout>
  );
}