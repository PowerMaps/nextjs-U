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