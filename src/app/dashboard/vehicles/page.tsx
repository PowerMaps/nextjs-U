"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useVehicles, useDeleteVehicle } from '@/lib/api/hooks/vehicle-hooks';
import { VehicleResponseDto } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Car, 
  Plus, 
  Search, 
  Battery, 
  Zap, 
  MapPin, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleResponseDto | null>(null);

  // API hooks
  const { data: vehicles, isLoading, error } = useVehicles();
  const deleteVehicle = useDeleteVehicle();

  // Filter vehicles based on search query
  const filteredVehicles = vehicles?.filter(vehicle => 
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle vehicle deletion
  const handleDeleteVehicle = async () => {
    if (vehicleToDelete) {
      try {
        await deleteVehicle.mutateAsync(vehicleToDelete.id);
        setVehicleToDelete(null);
      } catch (error) {
        console.error('Failed to delete vehicle:', error);
      }
    }
  };

  // Get connector type color
  const getConnectorTypeColor = (connectorType: string) => {
    switch (connectorType.toLowerCase()) {
      case 'ccs':
        return 'bg-blue-100 text-blue-800';
      case 'chademo':
        return 'bg-green-100 text-green-800';
      case 'type2':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load vehicles</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading your vehicles. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Vehicles</h1>
            <p className="text-muted-foreground">
              Manage your electric vehicles and their specifications
            </p>
          </div>
          <Link href="/dashboard/vehicles/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vehicles by make, model, nickname, or license plate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Car className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.year} • {vehicle.make} {vehicle.model}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/vehicles/${vehicle.id}/settings`}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setVehicleToDelete(vehicle)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* License Plate */}
                  {vehicle.licensePlate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">License Plate</span>
                      <Badge variant="outline">{vehicle.licensePlate}</Badge>
                    </div>
                  )}

                  {/* Connector Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Connector</span>
                    <Badge className={getConnectorTypeColor(vehicle.connectorType)}>
                      {vehicle.connectorType}
                    </Badge>
                  </div>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{vehicle.batteryCapacity} kWh</div>
                        <div className="text-xs text-muted-foreground">Battery</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{vehicle.range} km</div>
                        <div className="text-xs text-muted-foreground">Range</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{vehicle.chargingPower} kW</div>
                        <div className="text-xs text-muted-foreground">Max Power</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{vehicle.efficiency}</div>
                        <div className="text-xs text-muted-foreground">kWh/100km</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/map?vehicle=${vehicle.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <MapPin className="h-4 w-4 mr-2" />
                        Plan Route
                      </Button>
                    </Link>
                    <Link href={`/dashboard/vehicles/${vehicle.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No vehicles found' : 'No vehicles yet'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms to find your vehicles.'
                : 'Add your first electric vehicle to start planning routes and tracking your journeys.'
              }
            </p>
            {!searchQuery && (
              <Link href="/dashboard/vehicles/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vehicle
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!vehicleToDelete} onOpenChange={() => setVehicleToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{vehicleToDelete?.nickname || `${vehicleToDelete?.make} ${vehicleToDelete?.model}`}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteVehicle}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteVehicle.isPending}
              >
                {deleteVehicle.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}