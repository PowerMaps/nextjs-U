"use client";

import React, { useState, useCallback } from 'react';
import { Map } from '@/components/maps/map';
import { StationFormModal } from '@/components/stations/station-form-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  Plus,
  ArrowLeft,
  Save,
  Trash2,
  Edit,
  Loader2
} from 'lucide-react';
import { MapProvider } from '@/lib/contexts/map-context';

import {
  useUserStations,
  useCreateStation,
  useUpdateStation,
  useDeleteStation,
  CreateStationDto,
  UpdateStationDto,
  ConnectorType,
  ConnectorSpeed
} from '@/lib/api/hooks/user-station-hooks';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface StationFormData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  connectors: Array<{
    type: ConnectorType;
    speed: ConnectorSpeed;
    powerOutput: number;
    pricePerKwh: number;
  }>;
  openingTime?: string;
  closingTime?: string;
  amenities: string[];
  operator?: string;
  phone?: string;
  website?: string;
}

export default function StationsMapPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // API hooks
  const { data: userStations = [], isLoading: userStationsLoading, error: userStationsError } = useUserStations();

  // Debug logging
  console.log('Map page - userStations:', userStations);
  console.log('Map page - userStationsLoading:', userStationsLoading);
  console.log('Map page - userStationsError:', userStationsError);
  const createStationMutation = useCreateStation();
  const updateStationMutation = useUpdateStation();
  const deleteStationMutation = useDeleteStation();
  const { toast } = useToast();

  // Handle map click for adding new stations
  const handleMapClick = useCallback((coordinates: { lat: number; lng: number }) => {
    if (isAddMode) {
      setClickedLocation(coordinates);
      setEditingStation(null);
      setIsFormOpen(true);
    }
  }, [isAddMode]);

  // Handle station click for editing
  const handleStationClick = useCallback((stationId: string) => {
    console.log('handleStationClick called with:', stationId);
    console.log('Available userStations:', userStations.map(s => s.id));

    const station = userStations.find(s => s.id === stationId);
    console.log('Found station:', station);

    if (station) {
      console.log('Opening edit form for station:', station.name);
      setEditingStation(station);
      setClickedLocation(null);
      setIsFormOpen(true);
    } else {
      console.log('Station not found in userStations');
    }
  }, [userStations]);

  // Handle form submission
  const handleFormSubmit = async (formData: StationFormData) => {
    try {
      if (editingStation) {
        // Update existing station
        const updateData: UpdateStationDto = {
          id: editingStation.id,
          name: formData.name,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          connectors: formData.connectors,
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          amenities: formData.amenities,
        };
        await updateStationMutation.mutateAsync(updateData);
        toast({
          title: "Station updated",
          description: "Your charging station has been updated successfully.",
        });
      } else {
        // Create new station
        const createData: CreateStationDto = {
          name: formData.name,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          connectors: formData.connectors,
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          amenities: formData.amenities,
        };
        await createStationMutation.mutateAsync(createData);
        toast({
          title: "Station created",
          description: "Your new charging station has been added successfully.",
        });
      }

      setIsFormOpen(false);
      setEditingStation(null);
      setClickedLocation(null);
      setIsAddMode(false);
    } catch (error) {
      toast({
        title: "Error",
        description: editingStation
          ? "Failed to update station. Please try again."
          : "Failed to create station. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle station deletion
  const handleDeleteStation = async (stationId: string) => {
    try {
      await deleteStationMutation.mutateAsync(stationId);
      toast({
        title: "Station deleted",
        description: "Your charging station has been deleted successfully.",
      });
      setIsFormOpen(false);
      setEditingStation(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete station. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Map user stations for display
  const mapStations = userStations.map(station => ({
    id: station.id,
    name: station.name,
    longitude: station.longitude,
    latitude: station.latitude,
    status: station.isActive ? 'available' as const : 'offline' as const,
    isUserOwned: true
  }));

  console.log('Map stations for rendering:', mapStations);

  return (
    <MapProvider>
      <div className="relative min-width overflow-hidden bg-gray-100">
        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/stations" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Stations</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Station Management</h1>
            </div>
            <div className="w-32"></div>
          </div>
        </div>

        {/* Map */}
        <Map
          initialLat={36.8008}
          initialLng={10.1815}
          initialZoom={13}
          stations={mapStations}
          onMapClick={handleMapClick}
          onStationClick={handleStationClick}
          clickMode={isAddMode ? 'origin' : 'none'}
        />

        {/* Control Panel */}
        <div className="absolute top-20 left-4 z-20 w-80 space-y-4">
          {/* Add Station Mode Toggle */}
          <Card className="shadow-lg bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Station Management</h3>
                <Button
                  onClick={() => setIsAddMode(!isAddMode)}
                  variant={isAddMode ? "default" : "outline"}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isAddMode ? 'Cancel Adding' : 'Add New Station'}
                </Button>
                {isAddMode && (
                  <p className="text-xs text-blue-600">
                    Click anywhere on the map to add a new charging station
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Stations List */}
          <Card className="shadow-lg bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Your Stations ({userStations.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userStationsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Loading stations...</span>
                  </div>
                ) : userStations.length === 0 ? (
                  <p className="text-sm text-gray-600">No stations added yet</p>
                ) : (
                  userStations.map((station) => (
                    <div key={station.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{station.name}</p>
                        <p className="text-xs text-gray-600 truncate">{station.address}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingStation(station);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteStation(station.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="shadow-lg bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Click "Add New Station" then click on the map</li>
                <li>• Click on your stations (blue markers) to edit</li>
                <li>• Use the list to quickly edit or delete stations</li>
                <li>• Only your stations are shown on this map</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Station Form Modal */}
        <StationFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingStation(null);
            setClickedLocation(null);
            setIsAddMode(false);
          }}
          onSubmit={handleFormSubmit}
          onDelete={editingStation ? () => handleDeleteStation(editingStation.id) : undefined}
          initialData={editingStation}
          coordinates={clickedLocation}
          isEditing={!!editingStation}
          isLoading={createStationMutation.isPending || updateStationMutation.isPending}
          isDeleting={deleteStationMutation.isPending}
        />
      </div>
    </MapProvider>
  );
}