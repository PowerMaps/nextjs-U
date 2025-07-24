'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useAuth, 
  useAuthStatus, 
  useLogout,
  getUserDisplayName,
  getUserInitials,
  formatUserRole,
  hasRole,
  isAdmin,
  canPerformAction,
  useAuthGuard
} from '@/lib/auth';
import { UserMenu } from '@/components/auth/user-menu';

export function AuthDemo() {
  const { user, isAuthenticated, isLoading } = useAuthStatus();
  const { logout } = useLogout();
  const { renderIfAuthenticated, renderIfGuest, renderByRole } = useAuthGuard();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Demo</CardTitle>
          <CardDescription>Loading authentication state...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span>Checking authentication...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Demo</CardTitle>
          <CardDescription>
            This component demonstrates all authentication features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Authentication Status</h3>
              <p className="text-sm text-muted-foreground">
                Current authentication state
              </p>
            </div>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "Authenticated" : "Guest"}
            </Badge>
          </div>

          {/* User Information */}
          {renderIfAuthenticated(
            <div className="space-y-2">
              <h3 className="font-semibold">User Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Display Name:</span>
                  <p>{getUserDisplayName(user)}</p>
                </div>
                <div>
                  <span className="font-medium">Initials:</span>
                  <p>{getUserInitials(user)}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p>{user?.email}</p>
                </div>
                <div>
                  <span className="font-medium">Role:</span>
                  <p>{user ? formatUserRole(user.role) : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Role-based Content */}
          {renderIfAuthenticated(
            <div className="space-y-2">
              <h3 className="font-semibold">Role-based Access</h3>
              <div className="space-y-2">
                {hasRole(user, 'USER') && (
                  <Badge variant="outline">User Features Available</Badge>
                )}
                {hasRole(user, 'OPERATOR') && (
                  <Badge variant="outline">Operator Features Available</Badge>
                )}
                {isAdmin(user) && (
                  <Badge variant="destructive">Admin Features Available</Badge>
                )}
              </div>
            </div>
          )}

          {/* Permission-based Content */}
          {renderIfAuthenticated(
            <div className="space-y-2">
              <h3 className="font-semibold">Permissions</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className={canPerformAction(user, 'edit', 'profile') ? 'text-green-600' : 'text-red-600'}>
                    {canPerformAction(user, 'edit', 'profile') ? '✓' : '✗'}
                  </span>
                  <span>Edit Profile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={canPerformAction(user, 'view', 'analytics') ? 'text-green-600' : 'text-red-600'}>
                    {canPerformAction(user, 'view', 'analytics') ? '✓' : '✗'}
                  </span>
                  <span>View Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={canPerformAction(user, 'delete', 'user') ? 'text-green-600' : 'text-red-600'}>
                    {canPerformAction(user, 'delete', 'user') ? '✓' : '✗'}
                  </span>
                  <span>Delete Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={canPerformAction(user, 'manage', 'system_settings') ? 'text-green-600' : 'text-red-600'}>
                    {canPerformAction(user, 'manage', 'system_settings') ? '✓' : '✗'}
                  </span>
                  <span>System Settings</span>
                </div>
              </div>
            </div>
          )}

          {/* Role-specific Content */}
          {renderByRole({
            'USER': (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  Welcome! You have access to basic user features.
                </p>
              </div>
            ),
            'OPERATOR': (
              <div className="p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-700">
                  You have operator privileges and can manage charging stations.
                </p>
              </div>
            ),
            'ADMIN': (
              <div className="p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-700">
                  You have full administrative access to the system.
                </p>
              </div>
            ),
          })}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              {renderIfGuest(
                <div className="space-x-2">
                  <Button asChild>
                    <a href="/auth/login">Sign In</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/auth/register">Sign Up</a>
                  </Button>
                </div>
              )}
              
              {renderIfAuthenticated(
                <div className="flex items-center space-x-2">
                  <UserMenu />
                  <Button variant="outline" onClick={logout}>
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Protected Content</CardTitle>
            <CardDescription>Only visible to authenticated users</CardDescription>
          </CardHeader>
          <CardContent>
            {renderIfAuthenticated(
              <div className="space-y-2">
                <p className="text-sm">This content is only visible to logged-in users.</p>
                <p className="text-xs text-muted-foreground">
                  Powered by useAuthGuard hook
                </p>
              </div>,
              <div className="text-center py-8">
                <p className="text-muted-foreground">Please sign in to view this content</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Only</CardTitle>
            <CardDescription>Restricted to administrators</CardDescription>
          </CardHeader>
          <CardContent>
            {renderByRole({
              'ADMIN': (
                <div className="space-y-2">
                  <p className="text-sm">Welcome, Administrator!</p>
                  <p className="text-xs text-muted-foreground">
                    You have access to all system features.
                  </p>
                </div>
              ),
            }, (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isAuthenticated ? 'Admin access required' : 'Please sign in as admin'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}