"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Layers, Navigation, Maximize2, Palette, Car, Train } from 'lucide-react';
import { useMapContext } from '@/lib/contexts/map-context';

interface MapControlsProps {
  map: google.maps.Map | null;
  onLocationClick?: () => void;
  onLayersClick?: () => void;
  onNavigationClick?: () => void;
  onFullscreenClick?: () => void;
}

export function MapControls({ 
  map, 
  onLocationClick, 
  onLayersClick, 
  onNavigationClick, 
  onFullscreenClick 
}: MapControlsProps) {
  const { theme, setTheme, showTraffic, setShowTraffic, showTransit, setShowTransit, mapType, setMapType } = useMapContext();
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

  const handleNavigationMode = () => {
    if (!map) return;
    
    // Enable/disable dragging and zooming for navigation mode
    const isDraggable = map.get('draggable');
    map.setOptions({
      draggable: !isDraggable,
      scrollwheel: !isDraggable,
      disableDoubleClickZoom: isDraggable,
    });
    
    onNavigationClick?.();
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
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        className="bg-white shadow-md hover:bg-gray-50"
        onClick={handleMyLocation}
        title="My Location"
      >
        <MapPin className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="bg-white shadow-md hover:bg-gray-50"
        onClick={handleLayersToggle}
        title="Toggle Map Type"
      >
        <Layers className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="bg-white shadow-md hover:bg-gray-50"
        onClick={handleThemeToggle}
        title="Change Theme"
      >
        <Palette className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={`shadow-md hover:bg-gray-50 ${showTraffic ? 'bg-blue-100 text-blue-600' : 'bg-white'}`}
        onClick={handleTrafficToggle}
        title="Toggle Traffic"
      >
        <Car className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={`shadow-md hover:bg-gray-50 ${showTransit ? 'bg-green-100 text-green-600' : 'bg-white'}`}
        onClick={handleTransitToggle}
        title="Toggle Transit"
      >
        <Train className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="bg-white shadow-md hover:bg-gray-50"
        onClick={handleNavigationMode}
        title="Navigation Mode"
      >
        <Navigation className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="bg-white shadow-md hover:bg-gray-50"
        onClick={handleFullscreen}
        title="Fullscreen"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}