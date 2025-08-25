
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateBooking } from '@/lib/api/hooks/booking-hooks';
import { useCurrentSubscription } from '@/lib/api/hooks/subscription-hooks';

// Mock API client
jest.mock('@/lib/api/api-client', () => ({
  apiClient: {
    post: jest.fn((url, data) => {
      if (url === '/bookings') {
        return Promise.resolve({ data: { id: 'booking-123', ...data, totalCost: data.estimatedEnergyNeeded * 0.5, totalCostBeforeDiscount: data.estimatedEnergyNeeded * 1 } });
      }
      return Promise.reject(new Error('Not found'));
    }),
  },
}));

// Mock subscription hook to return a subscription with a discount
jest.mock('@/lib/api/hooks/subscription-hooks', () => ({
  ...jest.requireActual('@/lib/api/hooks/subscription-hooks'),
  useCurrentSubscription: () => ({
    data: {
      plan: {
        discount: 0.5,
      },
    },
    isLoading: false,
  }),
}));

describe('Booking with subscription benefits', () => {
  it('should apply subscription discount to booking cost', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    result.current.mutate({
      connectorId: 'connector-1',
      startTime: '2025-08-16T10:00:00',
      endTime: '2025-08-16T11:00:00',
      estimatedEnergyNeeded: 10,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.totalCost).toBe(5);
    expect(result.current.data?.totalCostBeforeDiscount).toBe(10);
  });

  it('should handle booking failure', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Temporarily mock the API client to return an error
    jest.spyOn(require('@/lib/api/api-client'), 'apiClient').post.mockImplementationOnce(() =>
      Promise.reject(new Error('Booking failed due to server error'))
    );

    const { result } = renderHook(() => useCreateBooking(), { wrapper });

    result.current.mutate({
      connectorId: 'connector-2',
      startTime: '2025-08-16T12:00:00',
      endTime: '2025-08-16T13:00:00',
      estimatedEnergyNeeded: 5,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Booking failed due to server error');
  });
});
