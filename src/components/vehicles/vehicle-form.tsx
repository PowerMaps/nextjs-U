"use client";

import React from 'react';
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConnectorType } from "@/lib/api/hooks/user-station-hooks";
import { CreateVehicleDto } from "@/lib/api/types";

interface VehicleFormProps {
  initialData?: CreateVehicleDto;
  onSubmit: (data: CreateVehicleDto) => void;
  isLoading?: boolean;
}

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().optional(),
  batteryCapacity: z.number().min(1, "Battery capacity is required"),
  range: z.number().min(1, "Range is required"),
  efficiency: z.number().min(0.1, "Efficiency is required"),
  connectorType: z.nativeEnum(ConnectorType),
  chargingPower: z.number().min(1, "Charging power is required"),
});

const CONNECTOR_TYPE_OPTIONS = [
  { value: ConnectorType.TYPE_2, label: 'Type 2' },
  { value: ConnectorType.CCS, label: 'CCS' },
  { value: ConnectorType.CHADEMO, label: 'CHAdeMO' },
  { value: ConnectorType.TESLA, label: 'Tesla' },
];

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

export function VehicleForm({ initialData, onSubmit, isLoading }: VehicleFormProps) {

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData || {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
      batteryCapacity: 0,
      range: 0,
      efficiency: 0,
      connectorType: ConnectorType.TYPE_2,
      chargingPower: 0,
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
            <Label htmlFor="licensePlate">License Plate (Optional)</Label>
            <Input id="licensePlate" type="text" {...register("licensePlate")} />
            {errors.licensePlate && (
              <p className="text-sm text-destructive">{errors.licensePlate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="batteryCapacity">Battery Capacity (kWh) *</Label>
            <Input
              id="batteryCapacity"
              type="number"
              step="0.1"
              placeholder="e.g., 75.0"
              {...register("batteryCapacity", { valueAsNumber: true })}
            />
            {errors.batteryCapacity && (
              <p className="text-sm text-destructive">{errors.batteryCapacity.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="range">Range (km) *</Label>
            <Input
              id="range"
              type="number"
              placeholder="e.g., 400"
              {...register("range", { valueAsNumber: true })}
            />
            {errors.range && (
              <p className="text-sm text-destructive">{errors.range.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="efficiency">Efficiency (kWh/100km) *</Label>
            <Input
              id="efficiency"
              type="number"
              step="0.1"
              placeholder="e.g., 18.5"
              {...register("efficiency", { valueAsNumber: true })}
            />
            {errors.efficiency && (
              <p className="text-sm text-destructive">{errors.efficiency.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="chargingPower">Charging Power (kW) *</Label>
            <Input
              id="chargingPower"
              type="number"
              placeholder="e.g., 150"
              {...register("chargingPower", { valueAsNumber: true })}
            />
            {errors.chargingPower && (
              <p className="text-sm text-destructive">{errors.chargingPower.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="connectorType">Connector Type *</Label>
            <Controller
              name="connectorType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select connector type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONNECTOR_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.connectorType && (
              <p className="text-sm text-destructive">{errors.connectorType.message}</p>
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