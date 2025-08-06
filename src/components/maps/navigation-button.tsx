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
  // Make navigation optional - only use if NavigationProvider is available
  let isNavigating = false;
  let startNavigation = (route?: any) => {};
  let stopNavigation = () => {};
  
  try {
    const navigation = useNavigation();
    isNavigating = navigation.isNavigating;
    startNavigation = navigation.startNavigation;
    stopNavigation = navigation.stopNavigation;
  } catch (error) {
    // NavigationProvider not available, use default values
    console.log('NavigationProvider not available in NavigationButton, navigation features disabled');
  }

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