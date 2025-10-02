"use client";

import React, { useState } from 'react';
import { ChargingStationResponseDto } from '@/lib/api/types';

import { useCreateBooking, useConnectorPricing, useCheckConnectorAvailability } from '@/lib/api/hooks/booking-hooks';
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
import { useRouter } from 'next/navigation';

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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const router = useRouter();

  // Use connectors directly from station data - no need for separate API call
  const { data: pricing } = useConnectorPricing(selectedConnectorId);
  const { data: availability } = useCheckConnectorAvailability(
    selectedConnectorId,
    startTime,
    endTime
  );
  const createBooking = useCreateBooking();

  const getConnectorStatusColor = (status: string) => {
    console.log(status);
    
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

  const handleProceedToConfirmation = () => {
    if (!selectedConnectorId || !startTime || !endTime) {
      return;
    }

    // Check availability
    if (availability && !availability.available) {
      return;
    }

    setShowConfirmation(true);
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
      setShowConfirmation(false);
      setSelectedConnectorId('');
      setStartTime('');
      setEndTime('');

      // Navigate to bookings page after successful booking
      router.push('/dashboard/bookings');
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
                    if (connector.status?.toLocaleUpperCase() === 'AVAILABLE') {
                      setSelectedConnectorId(connector.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getConnectorStatusColor(connector.status?.toLocaleUpperCase())}>
                        {getConnectorStatusIcon(connector.status?.toLocaleUpperCase())}
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
        {showBookingForm && selectedConnectorId && !showConfirmation && (
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

              {/* Availability Check */}
              {availability && startTime && endTime && (
                <div className={`p-3 rounded-lg ${
                  availability.available
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 text-sm">
                    {availability.available ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium">Available for selected time slot</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-800 font-medium">Not available - conflicting bookings</span>
                      </>
                    )}
                  </div>
                </div>
              )}

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
                  onClick={handleProceedToConfirmation}
                  disabled={
                    !startTime ||
                    !endTime ||
                    (availability && !availability.available)
                  }
                  className="flex-1"
                >
                  Continue to Payment
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

        {/* Confirmation & Payment Step */}
        {showBookingForm && selectedConnectorId && showConfirmation && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Confirm Your Booking
              </h4>

              {/* Booking Summary */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div className="font-medium text-blue-900">Booking Summary</div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Station:</span>
                    <span className="font-medium text-blue-900">{station.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Connector:</span>
                    <span className="font-medium text-blue-900">
                      {station.connectors?.find(c => c.id === selectedConnectorId)?.type}
                      {' '}
                      ({station.connectors?.find(c => c.id === selectedConnectorId)?.power}kW)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Start Time:</span>
                    <span className="font-medium text-blue-900">{formatDateTime(startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">End Time:</span>
                    <span className="font-medium text-blue-900">{formatDateTime(endTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Energy Needed:</span>
                    <span className="font-medium text-blue-900">{estimatedEnergy} kWh</span>
                  </div>
                  {pricing && calculateEstimatedCost() && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-blue-700 font-medium">Estimated Total:</span>
                        <span className="text-lg font-bold text-blue-900">
                          {calculateEstimatedCost()} {pricing.currency}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Note */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Payment will be processed from your wallet</p>
                    <p className="text-xs mt-1">The actual cost will be calculated after charging is complete.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleBookingSubmit}
                  disabled={createBooking.isPending}
                  className="flex-1"
                >
                  {createBooking.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={createBooking.isPending}
                >
                  Back
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}