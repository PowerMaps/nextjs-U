"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PaymentReceiptProps {
  transactionId: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  recipient?: string;
}

export function PaymentReceipt({
  transactionId,
  date,
  amount,
  currency,
  description,
  paymentMethod,
  status,
  recipient,
}: PaymentReceiptProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <p className="text-sm text-muted-foreground">Transaction ID:</p>
          <p className="text-sm font-medium text-right">{transactionId}</p>

          <p className="text-sm text-muted-foreground">Date:</p>
          <p className="text-sm font-medium text-right">{date}</p>

          <p className="text-sm text-muted-foreground">Description:</p>
          <p className="text-sm font-medium text-right">{description}</p>

          <p className="text-sm text-muted-foreground">Payment Method:</p>
          <p className="text-sm font-medium text-right">{paymentMethod}</p>

          {recipient && (
            <>
              <p className="text-sm text-muted-foreground">Recipient:</p>
              <p className="text-sm font-medium text-right">{recipient}</p>
            </>
          )}

          <p className="text-sm text-muted-foreground">Status:</p>
          <p className="text-sm font-medium text-right capitalize">{status}</p>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold">Total Amount:</p>
          <p className="text-2xl font-bold">{amount.toFixed(2)} {currency}</p>
        </div>
      </CardContent>
    </Card>
  );
}