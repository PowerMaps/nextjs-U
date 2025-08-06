"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  MapPin,
  Zap,
  Clock,
  Phone,
  Globe,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { ConnectorType, ConnectorSpeed } from '@/lib/api/hooks/user-station-hooks';

interface ConnectorData {
  type: ConnectorType;
  speed: ConnectorSpeed;
  powerOutput: number;
  pricePerKwh: number;
}

interface StationFormData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  connectors: ConnectorData[];
  openingTime?: string;
  closingTime?: string;
  amenities: string[];
}

interface StationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StationFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: any;
  coordinates?: { lat: number; lng: number } | null;
  isEditing: boolean;
  isLoading?: boolean;
  isDeleting?: boolean;
}

const CONNECTOR_TYPES = [
  { value: ConnectorType.TYPE_2, label: 'Type 2' },
  { value: ConnectorType.CCS, label: 'CCS' },
  { value: ConnectorType.CHADEMO, label: 'CHAdeMO' },
  { value: ConnectorType.TESLA, label: 'Tesla' },
];

const CONNECTOR_SPEEDS = [
  { value: ConnectorSpeed.SLOW, label: 'Slow (≤22kW)' },
  { value: ConnectorSpeed.FAST, label: 'Fast (22-50kW)' },
  { value: ConnectorSpeed.RAPID, label: 'Rapid (>50kW)' },
];

const AMENITIES_OPTIONS = [
  'WiFi',
  'Restaurant',
  'Cafe',
  'Restroom',
  'Shopping',
  'Parking',
  'ATM',
  'Car Wash'
];

export function StationFormModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  coordinates,
  isEditing,
  isLoading = false,
  isDeleting = false
}: StationFormModalProps) {
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    connectors: [{ 
      type: ConnectorType.TYPE_2, 
      speed: ConnectorSpeed.FAST, 
      powerOutput: 22, 
      pricePerKwh: 0.35 
    }],
    openingTime: '',
    closingTime: '',
    amenities: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Editing existing station
        setFormData({
          name: initialData.name || '',
          address: initialData.address || '',
          latitude: initialData.latitude || 0,
          longitude: initialData.longitude || 0,
          connectors: initialData.connectors?.map((c: any) => ({
            type: c.type || ConnectorType.TYPE_2,
            speed: c.speed || ConnectorSpeed.FAST,
            powerOutput: c.powerOutput || c.power || 22,
            pricePerKwh: c.pricePerKwh || 0.35
          })) || [{ 
            type: ConnectorType.TYPE_2, 
            speed: ConnectorSpeed.FAST, 
            powerOutput: 22, 
            pricePerKwh: 0.35 
          }],
          openingTime: initialData.openingTime || '',
          closingTime: initialData.closingTime || '',
          amenities: initialData.amenities || []
        });
      } else if (coordinates) {
        // Adding new station
        setFormData(prev => ({
          ...prev,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          name: '',
          address: `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
          connectors: [{ 
            type: ConnectorType.TYPE_2, 
            speed: ConnectorSpeed.FAST, 
            powerOutput: 22, 
            pricePerKwh: 0.35 
          }],
          amenities: []
        }));
      }
      setErrors({});
    }
  }, [isOpen, initialData, coordinates]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Station name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.connectors.length === 0) {
      newErrors.connectors = 'At least one connector is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && !isLoading) {
      await onSubmit(formData);
    }
  };

  const addConnector = () => {
    setFormData(prev => ({
      ...prev,
      connectors: [...prev.connectors, { 
        type: ConnectorType.TYPE_2, 
        speed: ConnectorSpeed.FAST, 
        powerOutput: 22, 
        pricePerKwh: 0.35 
      }]
    }));
  };

  const removeConnector = (index: number) => {
    setFormData(prev => ({
      ...prev,
      connectors: prev.connectors.filter((_, i) => i !== index)
    }));
  };

  const updateConnector = (index: number, field: keyof ConnectorData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      connectors: prev.connectors.map((connector, i) =>
        i === index ? { ...connector, [field]: value } : connector
      )
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            {isEditing ? 'Edit Charging Station' : 'Add New Charging Station'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Station Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Downtown Charging Hub"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address of the charging station"
                  rows={2}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                    placeholder="36.8008"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                    placeholder="10.1815"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connectors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Connectors
                </span>
                <Button type="button" onClick={addConnector} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.connectors.map((connector, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <Select
                      value={connector.type}
                      onValueChange={(value) => updateConnector(index, 'type', value as ConnectorType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONNECTOR_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={connector.speed}
                      onValueChange={(value) => updateConnector(index, 'speed', value as ConnectorSpeed)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONNECTOR_SPEEDS.map(speed => (
                          <SelectItem key={speed.value} value={speed.value}>{speed.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={connector.powerOutput}
                      onChange={(e) => updateConnector(index, 'powerOutput', parseFloat(e.target.value) || 0)}
                      placeholder="Power (kW)"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={connector.pricePerKwh}
                      onChange={(e) => updateConnector(index, 'pricePerKwh', parseFloat(e.target.value) || 0)}
                      placeholder="€/kWh"
                    />
                  </div>
                  {formData.connectors.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeConnector(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.connectors && <p className="text-xs text-red-600">{errors.connectors}</p>}
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="openingTime">Opening Time</Label>
                  <Input
                    id="openingTime"
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, openingTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="closingTime">Closing Time</Label>
                  <Input
                    id="closingTime"
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, closingTime: e.target.value }))}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">Leave empty for 24/7 operation</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map(amenity => (
                  <Badge
                    key={amenity}
                    variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>



          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {isEditing && onDelete && (
                <Button
                  type="button"
                  onClick={onDelete}
                  variant="destructive"
                  className="flex items-center gap-2"
                  disabled={isDeleting || isLoading}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete Station'}
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={isLoading || isDeleting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || isDeleting}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isLoading
                  ? (isEditing ? 'Updating...' : 'Adding...')
                  : (isEditing ? 'Update Station' : 'Add Station')
                }
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}