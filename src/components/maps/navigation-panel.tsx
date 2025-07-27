"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Navigation, 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Route,
  Zap,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Minus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface NavigationPanelProps {
  route: any; // Route data from Google Directions API
  isNavigating: boolean;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  onPauseNavigation: () => void;
  onResumeNavigation: () => void;
  currentStepIndex?: number;
  onStepChange?: (stepIndex: number) => void;
}

export function NavigationPanel({
  route,
  isNavigating,
  onStartNavigation,
  onStopNavigation,
  onPauseNavigation,
  onResumeNavigation,
  currentStepIndex = 0,
  onStepChange
}: NavigationPanelProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [steps, setSteps] = useState<NavigationStep[]>([]);

  // Extract navigation steps from route data
  useEffect(() => {
    if (!route) return;

    let routeSteps: NavigationStep[] = [];

    // Handle different route data formats
    if ('routes' in route && route.routes.length > 0) {
      const firstRoute = route.routes[0];
      if (firstRoute.legs && firstRoute.legs.length > 0) {
        routeSteps = firstRoute.legs.flatMap((leg: any) => 
          leg.steps?.map((step: any) => ({
            instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || 'Continue straight',
            distance: step.distance?.text || '0 m',
            duration: step.duration?.text || '0 min',
            maneuver: step.maneuver || 'straight',
            location: {
              lat: step.start_location?.lat || 0,
              lng: step.start_location?.lng || 0
            }
          })) || []
        );
      }
    } else if ('legs' in route && route.legs?.length > 0) {
      routeSteps = route.legs.flatMap((leg: any) => 
        leg.steps?.map((step: any) => ({
          instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || 'Continue straight',
          distance: step.distance?.text || '0 m',
          duration: step.duration?.text || '0 min',
          maneuver: step.maneuver || 'straight',
          location: {
            lat: step.start_location?.lat || 0,
            lng: step.start_location?.lng || 0
          }
        })) || []
      );
    }

    setSteps(routeSteps);
  }, [route]);

  const getManeuverIcon = (maneuver: string) => {
    switch (maneuver.toLowerCase()) {
      case 'turn-left':
      case 'turn-slight-left':
        return <ArrowLeft className="h-4 w-4" />;
      case 'turn-right':
      case 'turn-slight-right':
        return <ArrowRight className="h-4 w-4" />;
      case 'turn-sharp-left':
        return <RotateCw className="h-4 w-4 rotate-180" />;
      case 'turn-sharp-right':
        return <RotateCw className="h-4 w-4" />;
      case 'uturn-left':
      case 'uturn-right':
        return <RotateCw className="h-4 w-4 rotate-180" />;
      case 'straight':
      case 'continue':
        return <ArrowUp className="h-4 w-4" />;
      case 'merge':
        return <Minus className="h-4 w-4 rotate-45" />;
      default:
        return <ArrowUp className="h-4 w-4" />;
    }
  };

  const handleStartNavigation = () => {
    setIsPaused(false);
    onStartNavigation();
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      onResumeNavigation();
    } else {
      setIsPaused(true);
      onPauseNavigation();
    }
  };

  const handleStopNavigation = () => {
    setIsPaused(false);
    onStopNavigation();
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      onStepChange?.(currentStepIndex - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      onStepChange?.(currentStepIndex + 1);
    }
  };

  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];

  if (!route || steps.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Navigation className="h-4 w-4" />
            Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Calculate a route to start navigation
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Navigation className="h-4 w-4" />
          Navigation
          {isNavigating && (
            <Badge variant={isPaused ? "secondary" : "default"} className="ml-auto">
              {isPaused ? "Paused" : "Active"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          {!isNavigating ? (
            <Button
              onClick={handleStartNavigation}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePauseResume}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                onClick={handleStopNavigation}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}
          
          <Button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            variant="outline"
            size="sm"
            title={isVoiceEnabled ? "Disable voice" : "Enable voice"}
          >
            {isVoiceEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {getManeuverIcon(currentStep.maneuver)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-blue-900 mb-1">
                  {currentStep.instruction}
                </p>
                <div className="flex items-center gap-4 text-xs text-blue-700">
                  <span className="flex items-center gap-1">
                    <Route className="h-3 w-3" />
                    {currentStep.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {currentStep.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Step Preview */}
        {nextStep && (
          <div className="border rounded-lg p-2 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white">
                {getManeuverIcon(nextStep.maneuver)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 truncate">
                  Then: {nextStep.instruction}
                </p>
                <p className="text-xs text-gray-500">
                  in {nextStep.distance}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePreviousStep}
            disabled={currentStepIndex === 0}
            variant="outline"
            size="sm"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <span className="text-xs text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          
          <Button
            onClick={handleNextStep}
            disabled={currentStepIndex === steps.length - 1}
            variant="outline"
            size="sm"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* All Steps List (Collapsible) */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
            <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
            All Directions ({steps.length} steps)
          </summary>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded text-xs cursor-pointer transition-colors ${
                  index === currentStepIndex 
                    ? 'bg-blue-100 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onStepChange?.(index)}
              >
                <div className="flex-shrink-0 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-white">
                  {getManeuverIcon(step.maneuver)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1 truncate">
                    {step.instruction}
                  </p>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>{step.distance}</span>
                    <span>•</span>
                    <span>{step.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}