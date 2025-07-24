"use client";

import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface VehicleFormProps {
  initialData?: VehicleFormValues;
  onSubmit: (data: VehicleFormValues) => void;
  isLoading?: boolean;
}

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  batteryCapacity: z.number().optional(),
  chargingPortType: z.string().optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

export function VehicleForm({ initialData, onSubmit, isLoading }: VehicleFormProps) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData || {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
      vin: "",
      batteryCapacity: undefined,
      chargingPortType: "",
    },
  });

  const handleFormSubmit = (data: VehicleFormValues) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Vehicle" : "Add New Vehicle"}</CardTitle>
        <CardDescription>
          {initialData ? "Update your vehicle details." : "Add a new vehicle to your garage."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Input id="make" type="text" {...register("make")} />
            {errors.make && (
              <p className="text-sm text-destructive">{errors.make.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" type="text" {...register("model")} />
            {errors.model && (
              <p className="text-sm text-destructive">{errors.model.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" {...register("year", { valueAsNumber: true })} />
            {errors.year && (
              <p className="text-sm text-destructive">{errors.year.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="licensePlate">License Plate</Label>
            <Input id="licensePlate" type="text" {...register("licensePlate")} />
            {errors.licensePlate && (
              <p className="text-sm text-destructive">{errors.licensePlate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vin">VIN (Optional)</Label>
            <Input id="vin" type="text" {...register("vin")} />
            {errors.vin && (
              <p className="text-sm text-destructive">{errors.vin.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="batteryCapacity">Battery Capacity (kWh, Optional)</Label>
            <Input id="batteryCapacity" type="number" {...register("batteryCapacity", { valueAsNumber: true })} />
            {errors.batteryCapacity && (
              <p className="text-sm text-destructive">{errors.batteryCapacity.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="chargingPortType">Charging Port Type (Optional)</Label>
            <Input id="chargingPortType" type="text" {...register("chargingPortType")} />
            {errors.chargingPortType && (
              <p className="text-sm text-destructive">{errors.chargingPortType.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : (initialData ? "Save Changes" : "Add Vehicle")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}