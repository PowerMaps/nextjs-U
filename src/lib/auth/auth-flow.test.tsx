import { renderHook, act, waitFor } from '@testing-library/react';
import { useLogin, useLogout, useAuthStatus } from '@/lib/hooks/use-auth';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('Authentication Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should successfully log in a user', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      user: { email: 'test@example.com', firstName: 'Test', lastName: 'User' },
    });
    (apiClient.get as jest.Mock).mockResolvedValueOnce(
      { email: 'test@example.com', firstName: 'Test', lastName: 'User' }
    );

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });
    const { result: authStatus } = renderHook(() => useAuthStatus(), { wrapper: createWrapper() });

    expect(authStatus.current.isAuthenticated).toBe(false);

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password123' });
    });

    await waitFor(() => expect(authStatus.current.isAuthenticated).toBe(true));
    expect(authStatus.current.user?.email).toBe('test@example.com');
    expect(localStorage.getItem('auth-store')).toContain('mock_access_token');
  });

  it('should handle login failure', async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });
    const { result: authStatus } = renderHook(() => useAuthStatus(), { wrapper: createWrapper() });

    await act(async () => {
      await expect(
        result.current.login({ email: 'test@example.com', password: 'wrong_password' })
      ).rejects.toThrow('Invalid credentials');
    });

    expect(authStatus.current.isAuthenticated).toBe(false);
    expect(authStatus.current.error).toBe('Invalid credentials');
    expect(localStorage.getItem('auth-store')).toBeNull();
  });

  it('should successfully log out a user', async () => {
    // Simulate a logged-in state
    localStorage.setItem('auth-store', JSON.stringify({
      state: {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        user: { email: 'test@example.com' },
        isAuthenticated: true,
      },
      version: 0,
    }));

    (apiClient.post as jest.Mock).mockResolvedValueOnce({}); // Mock logout API call

    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });
    const { result: authStatus } = renderHook(() => useAuthStatus(), { wrapper: createWrapper() });

    // Initial state should reflect logged in
    await waitFor(() => expect(authStatus.current.isAuthenticated).toBe(true));

    await act(async () => {
      result.current.logout();
    });

    await waitFor(() => expect(authStatus.current.isAuthenticated).toBe(false));
    expect(localStorage.getItem('auth-store')).not.toContain('mock_access_token');
  });
});
