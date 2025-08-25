import React, { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useWalletBalance, 
  useWalletValidation, 
  useBookingPayment,
  useBookingRefund 
} from '../wallet-hooks';
import { validateBookingPayment, calculateSuggestedTopUp } from '../../../utils/wallet-validation';

// Mock the API client
jest.mock('../../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
};

describe('Wallet Integration Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useWalletBalance', () => {
    it('should return wallet balance data', async () => {
      const mockWalletData = {
        id: '1',
        balance: 100.50,
        currency: 'USD',
        owner: {} as any,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const { apiClient } = require('../../client');
      apiClient.get.mockResolvedValue(mockWalletData);

      const { result } = renderHook(() => useWalletBalance(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.balance).toBe(100.50);
        expect(result.current.currency).toBe('USD');
      });
    });

    it('should provide refresh balance function', async () => {
      const { result } = renderHook(() => useWalletBalance(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refreshBalance).toBe('function');
    });

    it('should handle real-time updates when enabled', () => {
      const { result } = renderHook(
        () => useWalletBalance({ enableRealTime: true, refetchInterval: 5000 }),
        { wrapper: createWrapper() }
      );

      expect(result.current.refreshBalance).toBeDefined();
    });
  });

  describe('useWalletValidation', () => {
    it('should validate sufficient funds correctly', async () => {
      const mockWalletData = {
        id: '1',
        balance: 100.00,
        currency: 'USD',
        owner: {} as any,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const { apiClient } = require('../../client');
      apiClient.get.mockResolvedValue(mockWalletData);

      const { result } = renderHook(() => useWalletValidation(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const validation = result.current.validateSufficientFunds(50);
        expect(validation.isValid).toBe(true);
        expect(validation.shortfall).toBe(0);
      });
    });

    it('should detect insufficient funds', async () => {
      const mockWalletData = {
        id: '1',
        balance: 30.00,
        currency: 'USD',
        owner: {} as any,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const { apiClient } = require('../../client');
      apiClient.get.mockResolvedValue(mockWalletData);

      const { result } = renderHook(() => useWalletValidation(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const validation = result.current.validateSufficientFunds(50);
        expect(validation.isValid).toBe(false);
        expect(validation.shortfall).toBe(20);
        expect(validation.message).toContain('20.00');
      });
    });

    it('should provide booking-specific validation', async () => {
      const mockWalletData = {
        id: '1',
        balance: 75.00,
        currency: 'USD',
        owner: {} as any,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const { apiClient } = require('../../client');
      apiClient.get.mockResolvedValue(mockWalletData);

      const { result } = renderHook(() => useWalletValidation(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const validation = result.current.checkBalanceForBooking(50);
        expect(validation.isValid).toBe(true);
      });
    });
  });

  describe('useBookingPayment', () => {
    it('should process payment successfully', async () => {
      const mockPaymentResponse = {
        success: true,
        transactionId: 'txn_123',
        newBalance: 50.00,
        booking: { id: 'booking_123', totalCost: 50.00 },
      };

      const { apiClient } = require('../../client');
      apiClient.post.mockResolvedValue(mockPaymentResponse);

      const { result } = renderHook(() => useBookingPayment(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.mutateAsync).toBeDefined();
      });

      const paymentData = {
        bookingId: 'booking_123',
        amount: 50.00,
      };

      await result.current.mutateAsync(paymentData);

      expect(apiClient.post).toHaveBeenCalledWith('/wallet/booking-payment', paymentData);
    });

    it('should handle payment failure', async () => {
      const { apiClient } = require('../../client');
      apiClient.post.mockRejectedValue(new Error('Payment failed'));

      const { result } = renderHook(() => useBookingPayment(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.mutateAsync).toBeDefined();
      });

      const paymentData = {
        bookingId: 'booking_123',
        amount: 50.00,
      };

      await expect(result.current.mutateAsync(paymentData)).rejects.toThrow('Payment failed');
    });
  });

  describe('useBookingRefund', () => {
    it('should process refund successfully', async () => {
      const mockRefundResponse = {
        success: true,
        refundAmount: 40.00,
        transactionId: 'txn_refund_123',
        newBalance: 90.00,
      };

      const { apiClient } = require('../../client');
      apiClient.post.mockResolvedValue(mockRefundResponse);

      const { result } = renderHook(() => useBookingRefund(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.mutateAsync).toBeDefined();
      });

      const refundData = {
        bookingId: 'booking_123',
        refundAmount: 40.00,
      };

      await result.current.mutateAsync(refundData);

      expect(apiClient.post).toHaveBeenCalledWith('/wallet/booking-refund', refundData);
    });
  });
});

describe('Wallet Validation Utilities', () => {
  describe('validateBookingPayment', () => {
    it('should validate sufficient funds with buffer', () => {
      const result = validateBookingPayment(100, 110, 'USD');
      expect(result.isValid).toBe(true);
      expect(result.canProceed).toBe(true);
    });

    it('should detect insufficient funds', () => {
      const result = validateBookingPayment(100, 90, 'USD');
      expect(result.isValid).toBe(false);
      expect(result.canProceed).toBe(false);
      expect(result.shortfall).toBeGreaterThan(0);
    });

    it('should account for buffer amount', () => {
      const result = validateBookingPayment(100, 104, 'USD'); // 5% buffer = 5, total needed = 105
      expect(result.isValid).toBe(false);
      expect(result.shortfall).toBe(1); // 105 - 104 = 1
    });
  });

  describe('calculateSuggestedTopUp', () => {
    it('should suggest minimum amount when no shortfall', () => {
      const suggestion = calculateSuggestedTopUp(0, undefined, 10, 1000);
      expect(suggestion).toBe(10);
    });

    it('should suggest amount with buffer for shortfall', () => {
      const suggestion = calculateSuggestedTopUp(20, undefined, 10, 1000);
      expect(suggestion).toBeGreaterThan(20);
      expect(suggestion).toBeLessThanOrEqual(30); // 20 * 1.2 = 24, rounded up
    });

    it('should consider user spending patterns', () => {
      const suggestion = calculateSuggestedTopUp(10, 25, 10, 1000);
      expect(suggestion).toBeGreaterThanOrEqual(60); // 10 + (25 * 2) = 60
    });

    it('should respect minimum and maximum bounds', () => {
      const lowSuggestion = calculateSuggestedTopUp(1, undefined, 10, 1000);
      expect(lowSuggestion).toBe(10);

      const highSuggestion = calculateSuggestedTopUp(2000, undefined, 10, 1000);
      expect(highSuggestion).toBe(1000);
    });

    it('should round to appropriate increments', () => {
      const smallSuggestion = calculateSuggestedTopUp(12, undefined, 10, 1000);
      expect(smallSuggestion % 5).toBe(0); // Should be multiple of 5

      const largeSuggestion = calculateSuggestedTopUp(80, undefined, 10, 1000);
      expect(largeSuggestion % 10).toBe(0); // Should be multiple of 10
    });
  });
});