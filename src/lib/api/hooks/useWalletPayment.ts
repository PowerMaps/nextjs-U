
import { useApiMutation } from './base-hooks';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { WalletResponseDto } from '../types';

interface WalletPaymentRequest {
  bookingId: string;
  amount: number;
}

interface WalletPaymentResponse {
  success: boolean;
  transactionId: string;
  newBalance: number;
}

export const useWalletPayment = () => {
  const queryClient = useQueryClient();

  return useApiMutation<WalletPaymentResponse, WalletPaymentRequest>(
    '/wallet/pay',
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

        toast({
          title: 'Payment successful',
          description: 'Your booking payment has been processed successfully.',
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
};
