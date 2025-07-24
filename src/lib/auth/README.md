# Authentication System

This authentication system provides a comprehensive solution for user authentication, authorization, and session management in the PowerMaps application.

## Features

- **Context-based Authentication**: React Context API for global authentication state
- **Protected Routes**: Components and HOCs for route protection
- **Role-based Access Control**: Utilities for role and permission checking
- **Session Management**: Automatic token refresh and session timeout handling
- **Persistent Preferences**: User preferences stored with Zustand
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Redirect Management**: Automatic redirects after authentication

## Quick Start

### 1. Setup the AuthProvider

Wrap your app with the `AuthProvider` in your root layout:

```tsx
import { AuthProvider } from '@/lib/auth';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Use Authentication Hooks

```tsx
import { useAuth, useLogin, useLogout } from '@/lib/auth';

function LoginForm() {
  const { login, isLoading, error } = useLogin();
  
  const handleSubmit = async (credentials) => {
    try {
      await login(credentials);
      // User is now logged in
    } catch (error) {
      // Error is handled automatically
    }
  };
  
  return (
    // Your login form JSX
  );
}

function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { logout } = useLogout();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Protect Routes

```tsx
import { ProtectedRoute, withAuth } from '@/lib/auth';

// Using component wrapper
function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected dashboard content</div>
    </ProtectedRoute>
  );
}

// Using HOC
const ProtectedDashboard = withAuth(DashboardComponent);

// Guest-only routes (login, register)
import { GuestOnlyRoute } from '@/lib/auth';

function LoginPage() {
  return (
    <GuestOnlyRoute>
      <LoginForm />
    </GuestOnlyRoute>
  );
}
```

### 4. Role-based Access Control

```tsx
import { useAuth, hasRole, canPerformAction } from '@/lib/auth';

function AdminPanel() {
  const { user } = useAuth();
  
  if (!hasRole(user, 'ADMIN')) {
    return <div>Access denied</div>;
  }
  
  return (
    <div>
      <h1>Admin Panel</h1>
      {canPerformAction(user, 'delete', 'user') && (
        <button>Delete User</button>
      )}
    </div>
  );
}
```

## API Reference

### Hooks

#### `useAuth()`
Main authentication hook providing access to authentication state and actions.

```tsx
const {
  user,              // Current user object or null
  isAuthenticated,   // Boolean authentication status
  isLoading,         // Loading state
  error,             // Current error message
  login,             // Login function
  register,          // Register function
  logout,            // Logout function
  refreshUser,       // Refresh user data
  clearError,        // Clear current error
} = useAuth();
```

#### `useLogin()`
Specialized hook for login functionality.

```tsx
const {
  login,       // Login function
  isLoading,   // Loading state
  error,       // Error message
  clearError,  // Clear error function
} = useLogin();
```

#### `useRegister()`
Specialized hook for registration functionality.

```tsx
const {
  register,    // Register function
  isLoading,   // Loading state
  error,       // Error message
  clearError,  // Clear error function
} = useRegister();
```

#### `useAuthStatus()`
Hook for checking authentication status.

```tsx
const {
  user,            // Current user
  isAuthenticated, // Auth status
  isLoading,       // Loading state
  isGuest,         // True if not authenticated and not loading
} = useAuthStatus();
```

#### `useAuthRedirect()`
Hook for handling authentication redirects.

```tsx
const {
  returnUrl,           // URL to return to after auth
  reason,              // Reason for redirect
  redirectToLogin,     // Function to redirect to login
  redirectToRegister,  // Function to redirect to register
  redirectAfterLogout, // Function to redirect after logout
} = useAuthRedirect();
```

### Components

#### `<ProtectedRoute>`
Component for protecting routes that require authentication.

```tsx
<ProtectedRoute 
  fallback={<LoadingSpinner />}  // Optional loading component
  redirectTo="/login"            // Optional redirect URL
>
  <ProtectedContent />
</ProtectedRoute>
```

#### `<GuestOnlyRoute>`
Component for routes that should only be accessible to non-authenticated users.

```tsx
<GuestOnlyRoute redirectTo="/dashboard">
  <LoginForm />
</GuestOnlyRoute>
```

#### `withAuth(Component)`
Higher-order component for protecting pages.

```tsx
const ProtectedPage = withAuth(MyPageComponent, {
  redirectTo: '/login',
  fallback: <LoadingSpinner />
});
```

### Utilities

#### Role Checking
```tsx
import { hasRole, hasMinimumRole, isAdmin } from '@/lib/auth';

hasRole(user, 'ADMIN')           // Check exact role
hasMinimumRole(user, 'OPERATOR') // Check minimum role level
isAdmin(user)                    // Check if user is admin
```

#### Permission Checking
```tsx
import { canPerformAction } from '@/lib/auth';

canPerformAction(user, 'edit', 'profile')  // Check specific permission
canPerformAction(user, 'delete:user')      // Alternative syntax
```

#### User Display
```tsx
import { getUserDisplayName, getUserInitials } from '@/lib/auth';

getUserDisplayName(user)  // "John Doe" or email fallback
getUserInitials(user)     // "JD" for avatars
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Token Storage

Tokens are stored in localStorage by default. The system handles:
- Access token storage and retrieval
- Refresh token management
- Automatic token cleanup on logout
- Token expiration checking

### Session Management

The system includes automatic session management:
- Token refresh on API calls
- Session timeout handling
- Activity tracking
- Automatic logout on token expiration

## Error Handling

The authentication system provides comprehensive error handling:

- Network errors are caught and displayed with user-friendly messages
- Authentication errors trigger appropriate redirects
- Form validation errors are displayed inline
- Session expiration is handled gracefully

## Security Considerations

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- CSRF protection should be implemented at the API level
- All API calls include proper authorization headers
- Session timeout prevents unauthorized access
- Automatic token refresh maintains security

## Testing

The authentication system is designed to be testable:

```tsx
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/lib/auth';

// Mock the authentication context for testing
const MockAuthProvider = ({ children, mockUser = null }) => {
  // Your mock implementation
};

// Test protected components
test('renders protected content for authenticated user', () => {
  render(
    <MockAuthProvider mockUser={mockUser}>
      <ProtectedComponent />
    </MockAuthProvider>
  );
  
  expect(screen.getByText('Protected content')).toBeInTheDocument();
});
```

## Migration Guide

If migrating from an existing authentication system:

1. Replace existing auth context with `AuthProvider`
2. Update authentication hooks to use the new API
3. Replace route protection with `ProtectedRoute` components
4. Update role checking to use the new utilities
5. Test all authentication flows thoroughly

## Troubleshooting

### Common Issues

1. **"useAuth must be used within an AuthProvider"**
   - Ensure `AuthProvider` wraps your app at the root level

2. **Infinite redirect loops**
   - Check that protected routes don't redirect to themselves
   - Verify return URL handling in authentication flows

3. **Token refresh failures**
   - Check API endpoint configuration
   - Verify refresh token storage and retrieval

4. **Session timeout issues**
   - Adjust timeout duration in auth store
   - Check activity tracking implementation

### Debug Mode

Enable debug logging by setting:
```tsx
// In your auth context or store
const DEBUG_AUTH = process.env.NODE_ENV === 'development';
```

This will log authentication state changes and API calls for debugging.