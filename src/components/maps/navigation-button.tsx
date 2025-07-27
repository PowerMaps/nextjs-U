"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, Play, Square } from 'lucide-react';
import { useNavigation } from '@/lib/contexts/navigation-context';

interface NavigationButtonProps {
  route?: any;
  className?: string;
}

export function NavigationButton({ route, className }: NavigationButtonProps) {
  const { isNavigating, startNavigation, stopNavigation } = useNavigation();

  const handleClick = () => {
    if (isNavigating) {
      stopNavigation();
    } else if (route) {
      startNavigation(route);
    }
  };

  if (!route) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
      size="sm"
    >
      {isNavigating ? (
        <>
          <Square className="h-4 w-4 mr-2" />
          Stop Navigation
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Start Navigation
        </>
      )}
    </Button>
  );
}