"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { FundTransferForm } from '@/components/wallet/fund-transfer-form';

export default function FundTransferPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Transfer Funds</h1>
      <FundTransferForm />
    </DashboardLayout>
  );
}