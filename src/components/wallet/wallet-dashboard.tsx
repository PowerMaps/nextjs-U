"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

const transactions: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: 50.00,
    description: 'Top-up',
    date: '2023-07-20',
  },
  {
    id: '2',
    type: 'debit',
    amount: 15.50,
    description: 'Charging Session',
    date: '2023-07-19',
  },
  {
    id: '3',
    type: 'credit',
    amount: 25.00,
    description: 'Refund',
    date: '2023-07-18',
  },
];

export function WalletDashboard() {
  const balance = 125.75; // Placeholder balance

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">My Wallet</CardTitle>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Top-up
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-5xl font-bold">${balance.toFixed(2)}</p>
        </div>

        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions found.</p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div className="flex items-center space-x-3">
                  {transaction.type === 'credit' ? (
                    <ArrowUpCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <p className="text-lg font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}