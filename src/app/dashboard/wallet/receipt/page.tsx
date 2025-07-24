"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { PaymentReceipt } from '@/components/wallet/payment-receipt';

export default function PaymentReceiptPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Transaction Receipt</h1>
      <PaymentReceipt
        transactionId="TRX123456789"
        date="2023-07-23 10:30 AM"
        amount={50.00}
        currency="TND"
        description="Wallet Top-up"
        paymentMethod="Credit Card"
        status="completed"
      />
    </DashboardLayout>
  );
}