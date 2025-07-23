// Authentication context and provider
export { AuthProvider, useAuth, AuthContext } from '@/lib/contexts/auth-context';

// Authentication hooks
export {
  useLogin,
  useRegister,
  useLogout,
  useAuthStatus,
  useCurrentUser,
  useProtectedAction,
} from '@/lib/hooks/use-auth';

// Authentication redirect hooks
export {
  useAuthRedirect,
  useSessionExpiration,
  useAuthStateChange,
  useAuthError,
} from '@/lib/hooks/use-auth-redirect';

// Protected route components
export {
  ProtectedRoute,
  GuestOnlyRoute,
  withAuth,
  withGuestOnly,
  useAuthGuard,
} from '@/components/auth/protected-route';

// Authentication utilities
export {
  hasRole,
  hasMinimumRole,
  hasAnyRole,
  isAdmin,
  isOperatorOrHigher,
  isUser,
  getUserDisplayName,
  getUserInitials,
  canPerformAction,
  isTokenExpired,
  getTokenExpiration,
  formatUserRole,
  isUserAccountActive,
  generateLogoutUrl,
  generateLoginUrl,
} from '@/lib/utils/auth-utils';

// Authentication store
export {
  useAuthStore,
  useAuthPreferences,
  useAuthUI,
  useSessionState,
  useSessionTimeout,
} from '@/lib/store/auth-store';

// Re-export types for convenience
export type {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  UserResponseDto,
  UserRole,
  UserPreferences,
  NotificationPreferences,
} from '@/lib/api/types';