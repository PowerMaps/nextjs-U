"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface NavigationState {
  isNavigating: boolean;
  isPaused: boolean;
  currentStepIndex: number;
  isVoiceEnabled: boolean;
  route: any;
  currentLocation: {
    lat: number;
    lng: number;
  } | null;
}

interface NavigationContextType extends NavigationState {
  startNavigation: (route: any) => void;
  stopNavigation: () => void;
  pauseNavigation: () => void;
  resumeNavigation: () => void;
  setCurrentStep: (stepIndex: number) => void;
  toggleVoice: () => void;
  updateLocation: (location: { lat: number; lng: number }) => void;
  speakInstruction: (instruction: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    isPaused: false,
    currentStepIndex: 0,
    isVoiceEnabled: true,
    route: null,
    currentLocation: null
  });

  const watchIdRef = useRef<number | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Start location tracking when navigation begins
  useEffect(() => {
    if (state.isNavigating && !state.isPaused) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [state.isNavigating, state.isPaused]);

  const startLocationTracking = () => {
    if (!navigator.geolocation) return;

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setState(prev => ({
          ...prev,
          currentLocation: newLocation
        }));

        // Check if we need to advance to the next step
        checkStepProgress(newLocation);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      options
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const checkStepProgress = (currentLocation: { lat: number; lng: number }) => {
    if (!state.route || !state.isNavigating || state.isPaused) return;

    // Get current step
    const steps = extractStepsFromRoute(state.route);
    const currentStep = steps[state.currentStepIndex];
    
    if (!currentStep) return;

    // Calculate distance to next step
    const distance = calculateDistance(
      currentLocation,
      currentStep.location
    );

    // If we're close to the step location (within 50 meters), advance to next step
    if (distance < 0.05 && state.currentStepIndex < steps.length - 1) {
      const nextStepIndex = state.currentStepIndex + 1;
      const nextStep = steps[nextStepIndex];
      
      setState(prev => ({
        ...prev,
        currentStepIndex: nextStepIndex
      }));

      // Speak the next instruction
      if (state.isVoiceEnabled && nextStep) {
        speakInstruction(nextStep.instruction);
      }
    }
  };

  const extractStepsFromRoute = (route: any) => {
    if (!route) return [];

    let steps: any[] = [];

    if ('routes' in route && route.routes.length > 0) {
      const firstRoute = route.routes[0];
      if (firstRoute.legs && firstRoute.legs.length > 0) {
        steps = firstRoute.legs.flatMap((leg: any) => leg.steps || []);
      }
    } else if ('legs' in route && route.legs?.length > 0) {
      steps = route.legs.flatMap((leg: any) => leg.steps || []);
    }

    return steps.map((step: any) => ({
      instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || 'Continue straight',
      location: {
        lat: step.start_location?.lat || 0,
        lng: step.start_location?.lng || 0
      }
    }));
  };

  const calculateDistance = (
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const startNavigation = (route: any) => {
    setState(prev => ({
      ...prev,
      isNavigating: true,
      isPaused: false,
      currentStepIndex: 0,
      route
    }));

    // Speak the first instruction
    const steps = extractStepsFromRoute(route);
    if (state.isVoiceEnabled && steps.length > 0) {
      speakInstruction(`Navigation started. ${steps[0].instruction}`);
    }
  };

  const stopNavigation = () => {
    setState(prev => ({
      ...prev,
      isNavigating: false,
      isPaused: false,
      currentStepIndex: 0,
      route: null,
      currentLocation: null
    }));

    if (state.isVoiceEnabled) {
      speakInstruction('Navigation stopped');
    }
  };

  const pauseNavigation = () => {
    setState(prev => ({
      ...prev,
      isPaused: true
    }));

    if (state.isVoiceEnabled) {
      speakInstruction('Navigation paused');
    }
  };

  const resumeNavigation = () => {
    setState(prev => ({
      ...prev,
      isPaused: false
    }));

    if (state.isVoiceEnabled) {
      speakInstruction('Navigation resumed');
    }
  };

  const setCurrentStep = (stepIndex: number) => {
    setState(prev => ({
      ...prev,
      currentStepIndex: stepIndex
    }));

    // Speak the instruction for the selected step
    const steps = extractStepsFromRoute(state.route);
    if (state.isVoiceEnabled && steps[stepIndex]) {
      speakInstruction(steps[stepIndex].instruction);
    }
  };

  const toggleVoice = () => {
    setState(prev => ({
      ...prev,
      isVoiceEnabled: !prev.isVoiceEnabled
    }));
  };

  const updateLocation = (location: { lat: number; lng: number }) => {
    setState(prev => ({
      ...prev,
      currentLocation: location
    }));
  };

  const speakInstruction = (instruction: string) => {
    if (!speechSynthesisRef.current || !state.isVoiceEnabled) return;

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();

    // Create and speak the utterance
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Try to use a more natural voice if available
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthesisRef.current.speak(utterance);
  };

  const contextValue: NavigationContextType = {
    ...state,
    startNavigation,
    stopNavigation,
    pauseNavigation,
    resumeNavigation,
    setCurrentStep,
    toggleVoice,
    updateLocation,
    speakInstruction
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}