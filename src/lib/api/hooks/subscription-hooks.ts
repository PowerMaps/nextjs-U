'use client';

import { useApiQuery, useApiMutation } from './base-hooks';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// Types for subscriptions
interface SubscriptionPlanResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionResponseDto {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlanResponseDto;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateSubscriptionDto {
  planId: string;
  autoRenew?: boolean;
  paymentMethodId?: string;
}

interface UpdateSubscriptionDto {
  autoRenew?: boolean;
  paymentMethodId?: string;
}

// Hook to get all subscription plans
export function useSubscriptionPlans() {
  return useApiQuery<SubscriptionPlanResponseDto[]>(
    ['subscription-plans'],
    '/subscriptions/plans',
    {
      staleTime: 60 * 60 * 1000, // 1 hour - plans don't change often
    }
  );
}

// Hook to get a specific subscription plan
export function useSubscriptionPlan(planId: string) {
  return useApiQuery<SubscriptionPlanResponseDto>(
    ['subscription-plan', planId],
    `/subscriptions/plans/${planId}`,
    {
      enabled: !!planId,
    }
  );
}

// Hook to get current user's subscription
export function useCurrentSubscription() {
  return useApiQuery<SubscriptionResponseDto>(
    ['subscription', 'current'],
    '/subscriptions/current',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Hook to subscribe to a plan
export function useSubscribe() {
  const queryClient = useQueryClient();
  
  return useApiMutation<SubscriptionResponseDto, CreateSubscriptionDto>(
    '/subscriptions',
    'POST',
    {
      onSuccess: (data) => {
        // Invalidate current subscription
        queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
        
        toast({
          title: 'Subscription successful',
          description: `You have successfully subscribed to the ${data.plan.name} plan.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Subscription failed',
          description: error.message || 'An error occurred while processing your subscription.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to cancel subscription
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useApiMutation<SubscriptionResponseDto, void>(
    '/subscriptions/cancel',
    'POST',
    {
      onSuccess: (data) => {
        // Invalidate current subscription
        queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
        
        toast({
          title: 'Subscription cancelled',
          description: `Your subscription has been cancelled. You will have access until ${new Date(data.endDate).toLocaleDateString()}.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Cancellation failed',
          description: error.message || 'An error occurred while cancelling your subscription.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to update subscription
export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  
  return useApiMutation<SubscriptionResponseDto, UpdateSubscriptionDto>(
    '/subscriptions/update',
    'PATCH',
    {
      onSuccess: (data) => {
        // Invalidate current subscription
        queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
        
        toast({
          title: 'Subscription updated',
          description: 'Your subscription settings have been updated successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Update failed',
          description: error.message || 'An error occurred while updating your subscription.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to get subscription history
export function useSubscriptionHistory() {
  return useApiQuery<SubscriptionResponseDto[]>(
    ['subscription', 'history'],
    '/subscriptions/history',
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

// Hook to change subscription plan
export function useChangePlan() {
  const queryClient = useQueryClient();
  
  return useApiMutation<SubscriptionResponseDto, { planId: string }>(
    '/subscriptions/change-plan',
    'POST',
    {
      onSuccess: (data) => {
        // Invalidate current subscription
        queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
        
        toast({
          title: 'Plan changed',
          description: `Your subscription has been changed to the ${data.plan.name} plan.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Plan change failed',
          description: error.message || 'An error occurred while changing your subscription plan.',
          variant: 'destructive',
        });
      },
    }
  );
}