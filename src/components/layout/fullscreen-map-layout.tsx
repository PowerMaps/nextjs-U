"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FullscreenMapLayoutProps {
  children: React.ReactNode;
}

export function FullscreenMapLayout({ children }: FullscreenMapLayoutProps) {
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Add keyboard shortcut (Escape key) to go back to dashboard
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleBackToDashboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          onClick={handleBackToDashboard}
          variant="secondary"
          size="sm"
          className="shadow-lg bg-white/95 backdrop-blur-sm hover:bg-white border border-gray-200 font-medium"
          title="Back to Dashboard (Press Escape)"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      {/* Full-screen content */}
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  );
}