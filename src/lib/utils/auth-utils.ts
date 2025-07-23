import { UserRole, UserResponseDto } from '@/lib/api/types';

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  OPERATOR: 2,
  ADMIN: 3,
};

// Check if user has a specific role
export function hasRole(user: UserResponseDto | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

// Check if user has at least the specified role level
export function hasMinimumRole(user: UserResponseDto | null, minimumRole: UserRole): boolean {
  if (!user) return false;
  
  const userRoleLevel = ROLE_HIERARCHY[user.role];
  const minimumRoleLevel = ROLE_HIERARCHY[minimumRole];
  
  return userRoleLevel >= minimumRoleLevel;
}

// Check if user has any of the specified roles
export function hasAnyRole(user: UserResponseDto | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

// Check if user is admin
export function isAdmin(user: UserResponseDto | null): boolean {
  return hasRole(user, 'ADMIN');
}

// Check if user is operator or higher
export function isOperatorOrHigher(user: UserResponseDto | null): boolean {
  return hasMinimumRole(user, 'OPERATOR');
}

// Check if user is regular user
export function isUser(user: UserResponseDto | null): boolean {
  return hasRole(user, 'USER');
}

// Get user display name
export function getUserDisplayName(user: UserResponseDto | null): string {
  if (!user) return 'Guest';
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

// Get user initials for avatar
export function getUserInitials(user: UserResponseDto | null): string {
  if (!user) return 'G';
  
  const firstName = user.firstName?.charAt(0)?.toUpperCase() || '';
  const lastName = user.lastName?.charAt(0)?.toUpperCase() || '';
  
  if (firstName && lastName) {
    return `${firstName}${lastName}`;
  }
  
  if (firstName) {
    return firstName;
  }
  
  return user.email?.charAt(0)?.toUpperCase() || 'U';
}

// Check if user can perform an action based on role
export function canPerformAction(
  user: UserResponseDto | null, 
  action: string,
  resource?: string
): boolean {
  if (!user) return false;

  // Define permissions based on roles
  const permissions: Record<UserRole, string[]> = {
    USER: [
      'view:profile',
      'edit:profile',
      'view:vehicles',
      'create:vehicle',
      'edit:own_vehicle',
      'delete:own_vehicle',
      'view:routes',
      'create:route',
      'view:wallet',
      'topup:wallet',
      'view:notifications',
      'edit:notification_preferences',
    ],
    OPERATOR: [
      // All user permissions plus:
      'view:all_vehicles',
      'view:charging_stations',
      'edit:charging_station',
      'view:analytics',
      'manage:reservations',
    ],
    ADMIN: [
      // All permissions plus:
      'view:all_users',
      'edit:user',
      'delete:user',
      'create:charging_station',
      'delete:charging_station',
      'view:system_analytics',
      'manage:system_settings',
    ],
  };

  // Get user permissions based on role hierarchy
  const userPermissions: string[] = [];
  
  // Add permissions for current role and all lower roles
  Object.entries(ROLE_HIERARCHY).forEach(([role, level]) => {
    if (ROLE_HIERARCHY[user.role] >= level) {
      userPermissions.push(...permissions[role as UserRole]);
    }
  });

  // Check if user has the required permission
  const requiredPermission = resource ? `${action}:${resource}` : action;
  return userPermissions.includes(requiredPermission);
}

// Validate token expiration (if JWT payload is accessible)
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    // If we can't parse the token, consider it expired
    return true;
  }
}

// Get token expiration time
export function getTokenExpiration(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
}

// Format user role for display
export function formatUserRole(role: UserRole): string {
  const roleLabels: Record<UserRole, string> = {
    USER: 'User',
    OPERATOR: 'Operator',
    ADMIN: 'Administrator',
  };
  
  return roleLabels[role] || role;
}

// Check if user account is active/valid
export function isUserAccountActive(user: UserResponseDto | null): boolean {
  if (!user) return false;
  
  // Add any additional checks for account status
  // For now, if user object exists, account is considered active
  return true;
}

// Generate a secure logout URL with return path
export function generateLogoutUrl(returnPath?: string): string {
  const baseUrl = '/auth/login';
  if (returnPath) {
    return `${baseUrl}?returnUrl=${encodeURIComponent(returnPath)}&reason=logout`;
  }
  return baseUrl;
}

// Generate a secure login URL with return path
export function generateLoginUrl(returnPath?: string, reason?: string): string {
  const baseUrl = '/auth/login';
  const params = new URLSearchParams();
  
  if (returnPath) {
    params.set('returnUrl', returnPath);
  }
  
  if (reason) {
    params.set('reason', reason);
  }
  
  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
}