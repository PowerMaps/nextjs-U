"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw,
  Minus,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useNavigation } from '@/lib/contexts/navigation-context';

interface NavigationInstructionOverlayProps {
  route?: any;
}

export function NavigationInstructionOverlay({ route }: NavigationInstructionOverlayProps) {
  // Make navigation optional - only use if NavigationProvider is available
  let isNavigating = false;
  let currentStepIndex = 0;
  let isVoiceEnabled = true;
  let toggleVoice = () => {};
  let speakInstruction = () => {};
  
  try {
    const navigation = useNavigation();
    isNavigating = navigation.isNavigating;
    currentStepIndex = navigation.currentStepIndex;
    isVoiceEnabled = navigation.isVoiceEnabled;
    toggleVoice = navigation.toggleVoice;
    speakInstruction = navigation.speakInstruction;
  } catch (error) {
    // NavigationProvider not available, use default values
    console.log('NavigationProvider not available in NavigationInstructionOverlay, navigation features disabled');
  }

  if (!isNavigating || !route) {
    return null;
  }

  // Extract steps from route
  const extractSteps = (route: any) => {
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
      distance: step.distance?.text || '0 m',
      duration: step.duration?.text || '0 min',
      maneuver: step.maneuver || 'straight'
    }));
  };

  const steps = extractSteps(route);
  const currentStep = steps[currentStepIndex];

  if (!currentStep) {
    return null;
  }

  const getManeuverIcon = (maneuver: string) => {
    switch (maneuver.toLowerCase()) {
      case 'turn-left':
      case 'turn-slight-left':
        return <ArrowLeft className="h-8 w-8" />;
      case 'turn-right':
      case 'turn-slight-right':
        return <ArrowRight className="h-8 w-8" />;
      case 'turn-sharp-left':
        return <RotateCw className="h-8 w-8 rotate-180" />;
      case 'turn-sharp-right':
        return <RotateCw className="h-8 w-8" />;
      case 'uturn-left':
      case 'uturn-right':
        return <RotateCw className="h-8 w-8 rotate-180" />;
      case 'straight':
      case 'continue':
        return <ArrowUp className="h-8 w-8" />;
      case 'merge':
        return <Minus className="h-8 w-8 rotate-45" />;
      default:
        return <ArrowUp className="h-8 w-8" />;
    }
  };

  const handleRepeatInstruction = () => {
    speakInstruction(currentStep.instruction);
  };

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 max-w-md w-full mx-4">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-blue-200">
        <div className="p-4">
          <div className="flex items-center gap-4">
            {/* Maneuver Icon */}
            <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white">
              {getManeuverIcon(currentStep.maneuver)}
            </div>
            
            {/* Instruction Text */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg text-gray-900 mb-1">
                {currentStep.instruction}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">{currentStep.distance}</span>
                <span>•</span>
                <span>{currentStep.duration}</span>
              </div>
            </div>

            {/* Voice Controls */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={toggleVoice}
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0"
                title={isVoiceEnabled ? "Disable voice" : "Enable voice"}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              
              {isVoiceEnabled && (
                <Button
                  onClick={handleRepeatInstruction}
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0"
                  title="Repeat instruction"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <div className="flex-1 bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
            <span className="whitespace-nowrap">
              {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}