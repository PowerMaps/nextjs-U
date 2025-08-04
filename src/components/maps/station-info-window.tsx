"use client";

import React, { useState } from 'react';
import { ChargingStationResponseDto } from '@/lib/api/types';

import { useCreateBooking, useConnectorPricing } from '@/lib/api/hooks/booking-hooks';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Zap,
  MapPin,
  Star,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { CardTitle } from '../ui/card';

interface StationInfoWindowProps {
  station: ChargingStationResponseDto;
  onClose?: () => void;
}

export function StationInfoWindow({ station, onClose }: StationInfoWindowProps) {
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [estimatedEnergy, setEstimatedEnergy] = useState<number>(20);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Use connectors directly from station data - no need for separate API call
  const { data: pricing } = useConnectorPricing(selectedConnectorId);
  const createBooking = useCreateBooking();

  const getConnectorStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_use':
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'maintenance':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectorStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_use':
      case 'occupied':
        return <XCircle className="h-4 w-4" />;
      case 'reserved':
        return <Clock className="h-4 w-4" />;
      case 'offline':
      case 'maintenance':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedConnectorId || !startTime || !endTime) {
      return;
    }

    try {
      await createBooking.mutateAsync({
        connectorId: selectedConnectorId,
        startTime,
        endTime,
        estimatedEnergyNeeded: estimatedEnergy,
      });

      setShowBookingForm(false);
      setSelectedConnectorId('');
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const calculateEstimatedCost = () => {
    if (!pricing || !estimatedEnergy) return null;
    return (pricing.pricePerKwh * estimatedEnergy).toFixed(2);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  // Set default start time to now + 1 hour, end time to now + 3 hours
  const getDefaultTimes = () => {
    const now = new Date();
    const startDefault = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    const endDefault = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 hours

    return {
      start: startDefault.toISOString().slice(0, 16), // Format for datetime-local input
      end: endDefault.toISOString().slice(0, 16),
    };
  };

  const defaultTimes = getDefaultTimes();

  return (
    <div className="w-full">
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{station.name}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{station.address}</span>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 mt-2">
          <Badge variant={station.isActive ? "default" : "secondary"}>
            {station.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {station.isVerified && (
            <Badge variant="outline" className="text-blue-600">
              Verified
            </Badge>
          )}
          {station.rate && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{station.rate.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Station Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              {station.openingTime && station.closingTime
                ? `${station.openingTime} - ${station.closingTime}`
                : '24/7'
              }
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">{station.type}</Badge>
          </div>

          {station.description && (
            <p className="text-sm text-muted-foreground">{station.description}</p>
          )}
        </div>

        <Separator />

        {/* Connectors */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Connectors ({station.connectors?.length || 0})
          </h4>

          {station.connectors && station.connectors.length > 0 ? (
            <div className="space-y-2">
              {station.connectors.map((connector) => (
                <div
                  key={connector.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedConnectorId === connector.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    if (connector.status === 'AVAILABLE') {
                      setSelectedConnectorId(connector.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getConnectorStatusColor(connector.status)}>
                        {getConnectorStatusIcon(connector.status)}
                        <span className="ml-1">{connector.status}</span>
                      </Badge>
                      <span className="font-medium">{connector.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {connector.power}kW
                      </span>
                      {connector.pricePerKwh && (
                        <span className="text-xs text-muted-foreground">
                          €{connector.pricePerKwh}/kWh
                        </span>
                      )}
                    </div>
                    {connector.status === 'AVAILABLE' && (
                      <Button
                        size="sm"
                        variant={selectedConnectorId === connector.id ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedConnectorId(connector.id);
                          setShowBookingForm(true);
                          if (!startTime) setStartTime(defaultTimes.start);
                          if (!endTime) setEndTime(defaultTimes.end);
                        }}
                      >
                        Book
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">No connectors available at this station</p>
            </div>
          )}
        </div>

        {/* Booking Form */}
        {showBookingForm && selectedConnectorId && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Book Connector
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startTime" className="text-sm">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-sm">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    min={startTime}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedEnergy" className="text-sm">
                  Estimated Energy Needed (kWh)
                </Label>
                <Input
                  id="estimatedEnergy"
                  type="number"
                  value={estimatedEnergy}
                  onChange={(e) => setEstimatedEnergy(Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>

              {pricing && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span>Price: {pricing.pricePerKwh} {pricing.currency}/kWh</span>
                  </div>
                  {calculateEstimatedCost() && (
                    <div className="text-sm font-medium mt-1">
                      Estimated Cost: {calculateEstimatedCost()} {pricing.currency}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleBookingSubmit}
                  disabled={createBooking.isPending || !startTime || !endTime}
                  className="flex-1"
                >
                  {createBooking.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Confirm Booking
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedConnectorId('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}