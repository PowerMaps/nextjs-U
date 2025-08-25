'use client';

import { useApiQuery, useApiMutation, usePaginatedApiQuery } from './base-hooks';
import { 
  PaginationQueryDto, 
  TopUpWalletDto, 
  TransferFundsDto, 
  WalletResponseDto, 
  WalletTransactionResponseDto 
} from '../types';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// Hook to get current user's wallet
export function useWallet() {
  return useApiQuery<WalletResponseDto>(
    ['wallet', 'my-wallet'],
    '/wallet/my-wallet',
    {
      staleTime: 30 * 1000, // 30 seconds - wallet balance may change frequently
    }
  );
}

// Enhanced hook for real-time wallet balance checking
export function useWalletBalance(options?: {
  refetchInterval?: number;
  enableRealTime?: boolean;
}) {
  const { refetchInterval = 30000, enableRealTime = true } = options || {};
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const walletQuery = useApiQuery<WalletResponseDto>(
    ['wallet', 'balance'],
    '/wallet/my-wallet',
    {
      staleTime: 10 * 1000, // 10 seconds for balance-focused queries
      refetchInterval: enableRealTime ? refetchInterval : false,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
    }
  );

  // Manual refresh function for immediate balance updates
  const refreshBalance = () => {
    queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    queryClient.invalidateQueries({ queryKey: ['wallet', 'my-wallet'] });
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...walletQuery,
    balance: walletQuery.data?.balance ?? 0,
    currency: walletQuery.data?.currency ?? 'USD',
    refreshBalance,
    isBalanceLoading: walletQuery.isLoading,
  };
}

// Hook to get wallet by ID (admin only)
export function useWalletById(walletId: string) {
  return useApiQuery<WalletResponseDto>(
    ['wallet', walletId],
    `/wallet/${walletId}`,
    {
      enabled: !!walletId,
    }
  );
}

// Hook to get wallet transactions
export function useWalletTransactions(params: PaginationQueryDto = {}) {
  return usePaginatedApiQuery<WalletTransactionResponseDto>(
    ['wallet', 'transactions'],
    '/wallet/transactions',
    params
  );
}

// Hook to top up wallet
export function useTopUpWallet() {
  const queryClient = useQueryClient();
  
  return useApiMutation<
    { wallet: WalletResponseDto; transaction: WalletTransactionResponseDto },
    TopUpWalletDto
  >(
    '/wallet/top-up',
    'POST',
    {
      onSuccess: (data) => {
        // Update wallet data in cache
        queryClient.setQueryData(['wallet', 'my-wallet'], data.wallet);
        
        // Invalidate transactions list
        queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
        
        toast({
          title: 'Wallet topped up',
          description: `Your wallet has been topped up with ${data.transaction.amount} ${data.wallet.currency}.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Top up failed',
          description: error.message || 'An error occurred while processing your payment.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to transfer funds
export function useTransferFunds() {
  const queryClient = useQueryClient();
  
  return useApiMutation<
    { 
      fromWallet: WalletResponseDto; 
      toWallet: WalletResponseDto; 
      fromTransaction: WalletTransactionResponseDto; 
      toTransaction: WalletTransactionResponseDto 
    },
    TransferFundsDto
  >(
    '/wallet/transfer',
    'POST',
    {
      onSuccess: (data) => {
        // Update wallet data in cache
        queryClient.setQueryData(['wallet', 'my-wallet'], data.fromWallet);
        
        // Invalidate transactions list
        queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
        
        toast({
          title: 'Transfer successful',
          description: `You have transferred ${data.fromTransaction.amount} ${data.fromWallet.currency}.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Transfer failed',
          description: error.message || 'An error occurred while transferring funds.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook for wallet balance validation
export function useWalletValidation() {
  const { balance, currency, refreshBalance } = useWalletBalance();

  const validateSufficientFunds = (requiredAmount: number): {
    isValid: boolean;
    shortfall: number;
    message: string;
  } => {
    const isValid = balance >= requiredAmount;
    const shortfall = isValid ? 0 : requiredAmount - balance;
    
    let message = '';
    if (!isValid) {
      message = `Insufficient funds. You need ${shortfall.toFixed(2)} ${currency} more.`;
    }

    return {
      isValid,
      shortfall,
      message,
    };
  };

  const checkBalanceForBooking = (estimatedCost: number) => {
    return validateSufficientFunds(estimatedCost);
  };

  return {
    balance,
    currency,
    validateSufficientFunds,
    checkBalanceForBooking,
    refreshBalance,
  };
}

// Hook for booking payment processing
export function useBookingPayment() {
  const queryClient = useQueryClient();
  const { refreshBalance } = useWalletBalance();

  return useApiMutation<
    { 
      success: boolean; 
      transactionId: string; 
      newBalance: number;
      booking: any; // BookingResponseDto
    },
    { 
      bookingId: string; 
      amount: number; 
      walletId?: string;
    }
  >(
    '/wallet/booking-payment',
    'POST',
    {
      onSuccess: (data) => {
        // Update wallet balance in cache
        queryClient.setQueryData(['wallet', 'balance'], (oldData: WalletResponseDto | undefined) => 
          oldData ? { ...oldData, balance: data.newBalance } : oldData
        );
        queryClient.setQueryData(['wallet', 'my-wallet'], (oldData: WalletResponseDto | undefined) => 
          oldData ? { ...oldData, balance: data.newBalance } : oldData
        );

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });

        // Refresh balance to ensure sync
        refreshBalance();

        toast({
          title: 'Payment successful',
          description: `Booking payment of ${data.booking?.totalCost || 'amount'} processed successfully.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Payment failed',
          description: error.message || 'An error occurred while processing your payment.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook for booking refund processing
export function useBookingRefund() {
  const queryClient = useQueryClient();
  const { refreshBalance } = useWalletBalance();

  return useApiMutation<
    { 
      success: boolean; 
      refundAmount: number; 
      transactionId: string; 
      newBalance: number;
    },
    { 
      bookingId: string; 
      refundAmount?: number;
    }
  >(
    '/wallet/booking-refund',
    'POST',
    {
      onSuccess: (data) => {
        // Update wallet balance in cache
        queryClient.setQueryData(['wallet', 'balance'], (oldData: WalletResponseDto | undefined) => 
          oldData ? { ...oldData, balance: data.newBalance } : oldData
        );
        queryClient.setQueryData(['wallet', 'my-wallet'], (oldData: WalletResponseDto | undefined) => 
          oldData ? { ...oldData, balance: data.newBalance } : oldData
        );

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });

        // Refresh balance to ensure sync
        refreshBalance();

        toast({
          title: 'Refund processed',
          description: `Refund of ${data.refundAmount} has been added to your wallet.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Refund failed',
          description: error.message || 'An error occurred while processing your refund.',
          variant: 'destructive',
        });
      },
    }
  );
}