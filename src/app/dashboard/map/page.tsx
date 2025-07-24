"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { AddressAutocomplete } from '@/components/maps/address-autocomplete';
import { LocationHistory } from '@/components/maps/location-history';
import { RouteStatisticsPanel } from '@/components/maps/route-statistics-panel';
import { Map } from '@/components/maps/map';

// Define a simple GeoJSON type for a LineString
interface LineStringGeoJSON extends GeoJSON.Feature<GeoJSON.LineString> {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: number[][];
  };
}

export default function MapPage() {
  // Placeholder route data
  const sampleRoute: LineStringGeoJSON = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [10.1815, 34.0000],
        [10.5, 34.5],
        [10.8, 35.0],
        [11.0, 35.5],
      ],
    },
  };

  return (
    <DashboardLayout>
          <h1 className="text-3xl font-bold mb-6">Interactive Map</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="mb-4">
            <AddressAutocomplete onSelectAddress={(loc) => console.log(loc)} />
          </div>
          <div className="h-[600px] w-full">
            <Map />
          </div>
        </div>
        <div className="md:col-span-1">
          <LocationHistory onSelectLocation={(loc) => console.log(loc)} />
          <div className="mt-4">
            <RouteStatisticsPanel distance="150 km" duration="2h 30m" energyConsumption="25 kWh" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}