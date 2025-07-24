"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
}

const vehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
  },
  {
    id: '2',
    make: 'Porsche',
    model: 'Taycan',
    year: 2023,
  },
  {
    id: '3',
    make: 'Nissan',
    model: 'Leaf',
    year: 2021,
  },
];

export function VehicleSelector() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const { toast } = useToast();

  const handleVehicleChange = (value: string) => {
    setSelectedVehicleId(value);
    toast({
      title: "Vehicle Selected",
      description: `You have selected ${vehicles.find(v => v.id === value)?.make} ${vehicles.find(v => v.id === value)?.model}.`,
    });
  };

  const handleDefaultChange = (checked: boolean) => {
    setIsDefault(checked);
    if (checked) {
      toast({
        title: "Default Vehicle Set",
        description: "This vehicle will be used as your default for route planning.",
      });
    } else {
      toast({
        title: "Default Vehicle Unset",
        description: "This vehicle is no longer your default.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Vehicle for Route Planning</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-select">Select a Vehicle</Label>
          <Select onValueChange={handleVehicleChange} value={selectedVehicleId || ""}>
            <SelectTrigger id="vehicle-select">
              <SelectValue placeholder="Choose your vehicle" />
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
        <div className="flex items-center space-x-2">
          <Checkbox
            id="set-default"
            checked={isDefault}
            onCheckedChange={handleDefaultChange}
          />
          <Label htmlFor="set-default">Set as default vehicle</Label>
        </div>
      </CardContent>
    </Card>
  );
}