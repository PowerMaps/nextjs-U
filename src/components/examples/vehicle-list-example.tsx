'use client';

import { useVehicles, useDeleteVehicle } from '@/lib/api/hooks';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useNetworkStatus } from '@/lib/api/hooks';

export function VehicleListExample() {
  const { data: vehicles, isLoading, error } = useVehicles();
  const deleteVehicle = useDeleteVehicle();
  const { isOnline } = useNetworkStatus();
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle.mutate(id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedVehicle(expandedVehicle === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-100">
        <h3 className="text-lg font-medium">Error loading vehicles</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Vehicles</h2>
        <Button asChild disabled={!isOnline}>
          <Link href="/dashboard/vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Link>
        </Button>
      </div>

      {!isOnline && (
        <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-100">
          You are currently offline. Some actions may be limited.
        </div>
      )}

      {vehicles?.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">You haven't added any vehicles yet.</p>
          <Button asChild className="mt-4" disabled={!isOnline}>
            <Link href="/dashboard/vehicles/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Vehicle
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles?.map((vehicle) => (
            <div
              key={vehicle.id}
              className="overflow-hidden rounded-lg border transition-all"
            >
              <div
                className="flex cursor-pointer items-center justify-between bg-muted/40 p-4"
                onClick={() => toggleExpand(vehicle.id)}
              >
                <div>
                  <h3 className="font-medium">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </h3>
                  {vehicle.nickname && (
                    <p className="text-sm text-muted-foreground">{vehicle.nickname}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={!isOnline}
                  >
                    <Link href={`/dashboard/vehicles/${vehicle.id}`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(vehicle.id);
                    }}
                    disabled={deleteVehicle.isPending || !isOnline}
                  >
                    {deleteVehicle.isPending && deleteVehicle.variables === vehicle.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedVehicle === vehicle.id && (
                <div className="border-t bg-background p-4">
                  <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Battery</dt>
                      <dd>{vehicle.batteryCapacity} kWh</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Range</dt>
                      <dd>{vehicle.range} km</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Efficiency</dt>
                      <dd>{vehicle.efficiency} kWh/1km</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Connector</dt>
                      <dd>{vehicle.connectorType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Charging Power</dt>
                      <dd>{vehicle.chargingPower} kW</dd>
                    </div>
                    {vehicle.licensePlate && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">License Plate</dt>
                        <dd>{vehicle.licensePlate}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}