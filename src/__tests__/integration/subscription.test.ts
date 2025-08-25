
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChangePlan } from '@/lib/api/hooks/subscription-hooks';

// Mock API client
jest.mock('@/lib/api/api-client', () => ({
  apiClient: {
    post: jest.fn((url, data) => {
      if (url === '/subscriptions/change-plan') {
        return Promise.resolve({ data: { id: 'sub-123', plan: { name: 'Premium', discount: 0.8 }, status: 'ACTIVE' } });
      }
      return Promise.reject(new Error('Not found'));
    }),
  },
}));

describe('Subscription upgrade/downgrade', () => {
  it('should change the subscription plan', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useChangePlan(), { wrapper });

    result.current.mutate({ planId: 'premium-plan-id' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.plan.name).toBe('Premium');
    expect(result.current.data?.plan.discount).toBe(0.8);
  });

  it('should handle subscription change failure', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Temporarily mock the API client to return an error
    jest.spyOn(require('@/lib/api/api-client'), 'apiClient').post.mockImplementationOnce(() =>
      Promise.reject(new Error('Subscription change failed due to server error'))
    );

    const { result } = renderHook(() => useChangePlan(), { wrapper });

    result.current.mutate({ planId: 'basic-plan-id' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Subscription change failed due to server error');
  });
});
