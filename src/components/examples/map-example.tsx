"use client";

import React from 'react';
import { Map } from '@/components/maps/map';
import { MapProvider } from '@/lib/contexts/map-context';

const sampleStations = [
  {
    id: '1',
    name: 'Downtown Charging Station',
    longitude: -86.7816,
    latitude: 36.1627,
    status: 'available' as const
  },
  {
    id: '2',
    name: 'Airport Charging Hub',
    longitude: -86.6782,
    latitude: 36.1245,
    status: 'occupied' as const
  },
  {
    id: '3',
    name: 'Mall Charging Point',
    longitude: -86.8025,
    latitude: 36.1853,
    status: 'offline' as const
  }
];

const sampleRoute: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [
      [-86.7816, 36.1627],
      [-86.7500, 36.1500],
      [-86.7200, 36.1400],
      [-86.6782, 36.1245]
    ]
  }
};

export function MapExample() {
  return (
    <MapProvider initialTheme="light">
      <div className="w-full h-[600px] border rounded-lg overflow-hidden">
        <Map
          initialLng={-86.7816}
          initialLat={36.1627}
          initialZoom={10}
          stations={sampleStations}
          routeGeoJSON={sampleRoute}
          showControls={true}
        />
      </div>
    </MapProvider>
  );
}