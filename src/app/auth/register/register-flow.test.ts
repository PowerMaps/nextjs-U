import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './page';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { apiClient } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
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

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {ui}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Registration Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should successfully register a new user and show success toast', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      user: { email: 'test@example.com', firstName: 'Test', lastName: 'User' },
    });

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    });

    // Expect the user to be redirected to the dashboard or a verification page
    // This depends on the actual implementation of the register hook/context
    // For now, we'll just check if the toast appears.
  });

  it('should show an error toast if registration fails', async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Email already exists'));

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'existing@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
    });
  });

  it('should show validation errors for invalid input', async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'mismatch' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});
