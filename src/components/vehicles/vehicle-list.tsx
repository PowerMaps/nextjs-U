"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

const initialVehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    licensePlate: 'TN 123 ABC',
  },
  {
    id: '2',
    make: 'Porsche',
    model: 'Taycan',
    year: 2023,
    licensePlate: 'TN 456 DEF',
  },
  {
    id: '3',
    make: 'Nissan',
    model: 'Leaf',
    year: 2021,
    licensePlate: 'TN 789 GHI',
  },
];

export function VehicleList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">My Vehicles</CardTitle>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          {filteredVehicles.length === 0 ? (
            <p className="text-muted-foreground">No vehicles found.</p>
          ) : (
            filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div>
                  <p className="text-lg font-medium">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    License Plate: {vehicle.licensePlate}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}