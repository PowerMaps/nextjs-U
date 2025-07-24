"use client";

import { useEffect, useState } from 'react';
import { useSessionTimeout, useLogout } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/store/auth-store';

export function SessionTimeoutModal() {
  const { shouldShowWarning, getTimeUntilExpiration, updateLastActivity, isSessionExpired } = useSessionTimeout();
  const { logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (shouldShowWarning()) {
      setIsOpen(true);
    }
  }, [shouldShowWarning]);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        const remaining = getTimeUntilExpiration();
        if (remaining) {
          setTimeRemaining(Math.ceil(remaining / 1000));
        } else {
          logout();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, getTimeUntilExpiration, logout]);

  const handleExtendSession = () => {
    updateLastActivity();
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Timeout</DialogTitle>
          <DialogDescription>
            Your session is about to expire due to inactivity. You will be logged out in {timeRemaining} seconds.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
          <Button onClick={handleExtendSession}>Extend Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}