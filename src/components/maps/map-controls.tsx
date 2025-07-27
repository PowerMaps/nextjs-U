"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Layers, 
  Navigation, 
  Maximize2, 
  Palette, 
  Car, 
  Bus,
  Satellite,
  Map as MapIcon,
  Sun,
  Moon,
  Zap,
  RotateCcw,
  Route as RouteIcon,
  Navigation2,
  Square
} from 'lucide-react';
import { useMapContext } from '@/lib/contexts/map-context';
import { useNavigation } from '@/lib/contexts/navigation-context';

interface MapControlsProps {
  map: google.maps.Map | null;
  onLocationClick?: () => void;
  onLayersClick?: () => void;
  onNavigationClick?: () => void;
  onFullscreenClick?: () => void;
  route?: any;
}

export function MapControls({
  map,
  onLocationClick,
  onLayersClick,
  onNavigationClick,
  onFullscreenClick,
  route
}: MapControlsProps) {
  const { theme, setTheme, showTraffic, setShowTraffic, showTransit, setShowTransit, mapType, setMapType } = useMapContext();
  const { isNavigating, startNavigation, stopNavigation } = useNavigation();
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null);
  const [transitLayer, setTransitLayer] = useState<google.maps.TransitLayer | null>(null);
  const handleMyLocation = () => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
          map.setZoom(15);

          // Add a marker for current location
          new google.maps.Marker({
            position: pos,
            map: map,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 6,
            },
          });
        },
        () => {
          console.error('Error: The Geolocation service failed.');
        }
      );
    }

    onLocationClick?.();
  };

  const handleLayersToggle = () => {
    if (!map) return;

    // Toggle between roadmap and satellite view
    const currentType = map.getMapTypeId();
    const newType = currentType === 'roadmap' ? 'satellite' : 'roadmap';
    map.setMapTypeId(newType as google.maps.MapTypeId);
    setMapType(newType as google.maps.MapTypeId);

    onLayersClick?.();
  };

  const handleThemeToggle = () => {
    const themes: Array<typeof theme> = ['light', 'dark', 'ev'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const handleTrafficToggle = () => {
    if (!map) return;

    if (showTraffic) {
      trafficLayer?.setMap(null);
      setShowTraffic(false);
    } else {
      if (!trafficLayer) {
        const newTrafficLayer = new google.maps.TrafficLayer();
        setTrafficLayer(newTrafficLayer);
        newTrafficLayer.setMap(map);
      } else {
        trafficLayer.setMap(map);
      }
      setShowTraffic(true);
    }
  };

  const handleTransitToggle = () => {
    if (!map) return;

    if (showTransit) {
      transitLayer?.setMap(null);
      setShowTransit(false);
    } else {
      if (!transitLayer) {
        const newTransitLayer = new google.maps.TransitLayer();
        setTransitLayer(newTransitLayer);
        newTransitLayer.setMap(map);
      } else {
        transitLayer.setMap(map);
      }
      setShowTransit(true);
    }
  };

  const [isNavigationLocked, setIsNavigationLocked] = useState(false);

  const handleNavigationMode = () => {
    if (!map) return;

    // Toggle navigation lock mode
    const newLockState = !isNavigationLocked;
    setIsNavigationLocked(newLockState);
    
    map.setOptions({
      draggable: !newLockState,
      scrollwheel: !newLockState,
      disableDoubleClickZoom: newLockState,
      keyboardShortcuts: !newLockState,
    });

    onNavigationClick?.();
  };

  const handleNavigationToggle = () => {
    if (!route) return;
    
    if (isNavigating) {
      stopNavigation();
    } else {
      startNavigation(route);
    }
  };

  const handleFullscreen = () => {
    const mapContainer = map?.getDiv().parentElement;
    if (!mapContainer) return;

    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }

    onFullscreenClick?.();
  };

  return (
    <div className="absolute top-32 right-1 z-10 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        className="bg-white/95 backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200"
        onClick={handleMyLocation}
        title="Find My Location"
      >
        <MapPin className="h-4 w-4 text-blue-600" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="bg-white/95 backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200"
        onClick={handleLayersToggle}
        title={`Switch to ${mapType === 'roadmap' ? 'Satellite' : 'Map'} View`}
      >
        {mapType === 'roadmap' ? (
          <Satellite className="h-4 w-4 text-green-600" />
        ) : (
          <MapIcon className="h-4 w-4 text-green-600" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="bg-white/95 backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200"
        onClick={handleThemeToggle}
        title={`Current: ${theme} theme`}
      >
        {theme === 'light' ? (
          <Sun className="h-4 w-4 text-yellow-600" />
        ) : theme === 'dark' ? (
          <Moon className="h-4 w-4 text-purple-600" />
        ) : (
          <Zap className="h-4 w-4 text-blue-600" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={`backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200 ${
          showTraffic ? 'bg-red-100 text-red-600' : 'bg-white/95'
        }`}
        onClick={handleTrafficToggle}
        title="Toggle Traffic Layer"
      >
        <RouteIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={`backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200 ${
          showTransit ? 'bg-blue-100 text-blue-600' : 'bg-white/95'
        }`}
        onClick={handleTransitToggle}
        title="Toggle Public Transport Layer"
      >
        <Bus className="h-4 w-4" />
      </Button>

      {/* Navigation Start/Stop Button */}
      {route && (
        <Button
          variant="outline"
          size="icon"
          className={`backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200 ${
            isNavigating ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}
          onClick={handleNavigationToggle}
          title={isNavigating ? "Stop Navigation" : "Start Navigation"}
        >
          {isNavigating ? (
            <Square className="h-4 w-4" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        className={`backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200 ${
          isNavigationLocked ? 'bg-red-100 text-red-600' : 'bg-white/95'
        }`}
        onClick={handleNavigationMode}
        title={isNavigationLocked ? "Unlock Navigation" : "Lock Navigation"}
      >
        {isNavigationLocked ? (
          <RotateCcw className="h-4 w-4" />
        ) : (
          <Navigation2 className="h-4 w-4 text-orange-600" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="bg-white/95 backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200"
        onClick={handleFullscreen}
        title="Toggle Fullscreen"
      >
        <Maximize2 className="h-4 w-4 text-gray-600" />
      </Button>
    </div>
  );
}