"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useWallet, useWalletTransactions, useTopUpWallet } from '@/lib/api/hooks/wallet-hooks';
import { WalletTransactionResponseDto } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Euro,
  CreditCard,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Search
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function WalletPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);

  // API hooks
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactionsData, isLoading: transactionsLoading } = useWalletTransactions({
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
  const topUpWallet = useTopUpWallet();

  const transactions = transactionsData?.items || [];

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate wallet statistics
  const totalIncome = transactions
    .filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => ['PAYMENT', 'WITHDRAWAL'].includes(t.type) && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const pendingTransactions = transactions.filter(t => t.status === 'PENDING').length;

  // Handle top-up
  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (amount > 0) {
      try {
        await topUpWallet.mutateAsync({
          amount,
          paymentMethod: 'card',
          paymentDetails: {
            // This would normally contain payment method details
            method: 'credit_card'
          }
        });
        setTopUpAmount('');
        setIsTopUpDialogOpen(false);
      } catch (error) {
        console.error('Top-up failed:', error);
      }
    }
  };

  // Get transaction icon and color
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return { icon: ArrowDownLeft, color: 'text-green-600', bg: 'bg-green-100' };
      case 'PAYMENT':
        return { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-100' };
      case 'WITHDRAWAL':
        return { icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'TRANSFER':
        return { icon: Euro, color: 'text-blue-600', bg: 'bg-blue-100' };
      default:
        return { icon: Euro, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  // Format transaction amount
  const formatAmount = (amount: number, type: string) => {
    const prefix = type === 'DEPOSIT' ? '+' : '-';
    return `${prefix}€${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">
              Manage your balance and view transaction history
            </p>
          </div>
          <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Top Up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Top Up Wallet</DialogTitle>
                <DialogDescription>
                  Add funds to your wallet to pay for charging sessions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (€)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    min="1"
                    step="0.01"
                  />
                </div>
                <div className="flex gap-2">
                  {[10, 25, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setTopUpAmount(amount.toString())}
                    >
                      €{amount}
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleTopUp}
                  disabled={!topUpAmount || parseFloat(topUpAmount) <= 0 || topUpWallet.isPending}
                >
                  {topUpWallet.isPending ? 'Processing...' : 'Top Up'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Wallet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletLoading ? '...' : `€${wallet?.balance.toFixed(2) || '0.00'}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Available for charging
              </p>
            </CardContent>
          </Card>

          {/* Total Income */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                €{totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time deposits
              </p>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                €{totalExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time spending
              </p>
            </CardContent>
          </Card>

          {/* Pending Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingTransactions}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Transaction History</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DEPOSIT">Deposits</SelectItem>
                  <SelectItem value="PAYMENT">Payments</SelectItem>
                  <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
                  <SelectItem value="TRANSFER">Transfers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transactions List */}
            {transactionsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => {
                  const { icon: Icon, color, bg } = getTransactionIcon(transaction.type);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${bg}`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()} •
                            {transaction.reference && ` Ref: ${transaction.reference}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${transaction.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </div>
                        <Badge variant={
                          transaction.status === 'COMPLETED' ? 'default' :
                            transaction.status === 'PENDING' ? 'secondary' : 'destructive'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'No transactions found'
                    : 'No transactions yet'
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters to find transactions.'
                    : 'Your transaction history will appear here once you start using your wallet.'
                  }
                </p>
                {!searchQuery && typeFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={() => setIsTopUpDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Make Your First Top-Up
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}