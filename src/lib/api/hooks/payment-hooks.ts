'use client';

import { useApiQuery, useApiMutation, usePaginatedApiQuery } from './base-hooks';
import { PaginationQueryDto } from '../types';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// Types for payments
interface PaymentMethodResponseDto {
  id: string;
  type: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT';
  provider: string;
  isDefault: boolean;
  lastFour?: string;
  expiryDate?: string;
  cardholderName?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentResponseDto {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: PaymentMethodResponseDto;
  description: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePaymentMethodDto {
  type: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT';
  provider: string;
  token: string;
  setAsDefault?: boolean;
  billingDetails?: {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

interface CreatePaymentDto {
  amount: number;
  currency: string;
  paymentMethodId: string;
  description?: string;
}

// Hook to get user's payment methods
export function usePaymentMethods() {
  return useApiQuery<PaymentMethodResponseDto[]>(
    ['payment-methods'],
    '/payments/methods',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Hook to get a single payment method
export function usePaymentMethod(paymentMethodId: string) {
  return useApiQuery<PaymentMethodResponseDto>(
    ['payment-method', paymentMethodId],
    `/payments/methods/${paymentMethodId}`,
    {
      enabled: !!paymentMethodId,
    }
  );
}

// Hook to create a new payment method
export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  
  return useApiMutation<PaymentMethodResponseDto, CreatePaymentMethodDto>(
    '/payments/methods',
    'POST',
    {
      onSuccess: (data) => {
        // Invalidate payment methods list
        queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
        
        toast({
          title: 'Payment method added',
          description: 'Your payment method has been added successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to add payment method',
          description: error.message || 'An error occurred while adding your payment method.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to delete a payment method
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  
  return useApiMutation<void, string>(
    '', // URL will be set in mutationFn
    'DELETE',
    {
      mutationFn: async (paymentMethodId: string) => {
        return await apiClient.delete(`/payments/methods/${paymentMethodId}`);
      },
      onSuccess: () => {
        // Invalidate payment methods list
        queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
        
        toast({
          title: 'Payment method removed',
          description: 'Your payment method has been removed successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to remove payment method',
          description: error.message || 'An error occurred while removing your payment method.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to set a payment method as default
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();
  
  return useApiMutation<PaymentMethodResponseDto, string>(
    '', // URL will be set in mutationFn
    'PATCH',
    {
      mutationFn: async (paymentMethodId: string) => {
        return await apiClient.patch(`/payments/methods/${paymentMethodId}/set-default`);
      },
      onSuccess: () => {
        // Invalidate payment methods list
        queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
        
        toast({
          title: 'Default payment method updated',
          description: 'Your default payment method has been updated.',
        });
      },
    }
  );
}

// Hook to get payment history
export function usePaymentHistory(params: PaginationQueryDto = {}) {
  return usePaginatedApiQuery<PaymentResponseDto>(
    ['payments', 'history', JSON.stringify(params)],
    '/payments/history',
    params
  );
}

// Hook to create a new payment
export function useCreatePayment() {
  const queryClient = useQueryClient();
  
  return useApiMutation<PaymentResponseDto, CreatePaymentDto>(
    '/payments',
    'POST',
    {
      onSuccess: (data) => {
        // Invalidate payment history
        queryClient.invalidateQueries({ queryKey: ['payments', 'history'] });
        
        // Invalidate wallet balance if this is a wallet top-up
        queryClient.invalidateQueries({ queryKey: ['wallet', 'my-wallet'] });
        
        toast({
          title: 'Payment successful',
          description: `Your payment of ${data.amount} ${data.currency} has been processed.`,
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

// Hook to get a single payment by ID
export function usePayment(paymentId: string) {
  return useApiQuery<PaymentResponseDto>(
    ['payment', paymentId],
    `/payments/${paymentId}`,
    {
      enabled: !!paymentId,
    }
  );
}

// Hook to request a refund
export function useRequestRefund() {
  const queryClient = useQueryClient();
  
  return useApiMutation<PaymentResponseDto, { paymentId: string; reason?: string }>(
    '/payments/refund',
    'POST',
    {
      onSuccess: (data) => {
        // Invalidate payment history
        queryClient.invalidateQueries({ queryKey: ['payments', 'history'] });
        
        // Invalidate specific payment
        queryClient.invalidateQueries({ queryKey: ['payment', data.id] });
        
        // Invalidate wallet balance
        queryClient.invalidateQueries({ queryKey: ['wallet', 'my-wallet'] });
        
        toast({
          title: 'Refund requested',
          description: 'Your refund request has been submitted successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Refund request failed',
          description: error.message || 'An error occurred while requesting your refund.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Import missing apiClient
import { apiClient } from '../client';