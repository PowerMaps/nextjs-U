"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  batteryCapacity?: number;
  chargingPortType?: string;
}

interface VehicleDetailProps {
  vehicle: Vehicle;
  onEdit: (vehicleId: string) => void;
  onDelete: (vehicleId: string) => void;
}

export function VehicleDetail({ vehicle, onEdit, onDelete }: VehicleDetailProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(vehicle.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your
                  vehicle data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive" onClick={() => onDelete(vehicle.id)}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">License Plate</p>
          <p className="text-lg font-medium">{vehicle.licensePlate}</p>
        </div>
        {vehicle.vin && (
          <div>
            <p className="text-sm text-muted-foreground">VIN</p>
            <p className="text-lg font-medium">{vehicle.vin}</p>
          </div>
        )}
        {vehicle.batteryCapacity && (
          <div>
            <p className="text-sm text-muted-foreground">Battery Capacity</p>
            <p className="text-lg font-medium">{vehicle.batteryCapacity} kWh</p>
          </div>
        )}
        {vehicle.chargingPortType && (
          <div>
            <p className="text-sm text-muted-foreground">Charging Port Type</p>
            <p className="text-lg font-medium">{vehicle.chargingPortType}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}