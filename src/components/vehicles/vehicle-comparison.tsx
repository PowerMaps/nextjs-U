"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  batteryCapacity: number;
  range: number;
  chargingSpeed: number;
}

const vehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    batteryCapacity: 75,
    range: 500,
    chargingSpeed: 250,
  },
  {
    id: '2',
    make: 'Porsche',
    model: 'Taycan',
    year: 2023,
    batteryCapacity: 93,
    range: 450,
    chargingSpeed: 270,
  },
  {
    id: '3',
    make: 'Nissan',
    model: 'Leaf',
    year: 2021,
    batteryCapacity: 62,
    range: 385,
    chargingSpeed: 100,
  },
  {
    id: '4',
    make: 'Hyundai',
    model: 'Kona Electric',
    year: 2023,
    batteryCapacity: 64,
    range: 484,
    chargingSpeed: 100,
  },
];

export function VehicleComparison() {
  const [selectedVehicle1, setSelectedVehicle1] = useState<Vehicle | null>(null);
  const [selectedVehicle2, setSelectedVehicle2] = useState<Vehicle | null>(null);

  const handleSelectVehicle1 = (vehicleId: string) => {
    setSelectedVehicle1(vehicles.find((v) => v.id === vehicleId) || null);
  };

  const handleSelectVehicle2 = (vehicleId: string) => {
    setSelectedVehicle2(vehicles.find((v) => v.id === vehicleId) || null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select onValueChange={handleSelectVehicle1}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Vehicle 1" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select onValueChange={handleSelectVehicle2}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Vehicle 2" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(selectedVehicle1 || selectedVehicle2) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedVehicle1 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {selectedVehicle1.make} {selectedVehicle1.model}
                </h3>
                <p>Year: {selectedVehicle1.year}</p>
                <p>Battery Capacity: {selectedVehicle1.batteryCapacity} kWh</p>
                <p>Range: {selectedVehicle1.range} km</p>
                <p>Charging Speed: {selectedVehicle1.chargingSpeed} kW</p>
              </div>
            )}
            {selectedVehicle1 && selectedVehicle2 && <Separator orientation="vertical" />}
            {selectedVehicle2 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {selectedVehicle2.make} {selectedVehicle2.model}
                </h3>
                <p>Year: {selectedVehicle2.year}</p>
                <p>Battery Capacity: {selectedVehicle2.batteryCapacity} kWh</p>
                <p>Range: {selectedVehicle2.range} km</p>
                <p>Charging Speed: {selectedVehicle2.chargingSpeed} kW</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}